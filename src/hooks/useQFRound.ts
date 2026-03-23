import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import { MATCHING_ADDRESS, RPC_URL, AVAX_TO_USD, CHAIN_ID } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import type { QFRoundFull2, QFProjectData, ContributeStep } from "@/types/claro";

export function useQFRound() {
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  const [contributeStep, setContributeStep] = useState<ContributeStep>("idle");
  const [contributeError, setContributeError] = useState<string | null>(null);
  const [contributingProjectId, setContributingProjectId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["qf-round"],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, provider);

      let round: QFRoundFull2 = {
        projectIds: [],
        startTime: 0,
        endTime: 0,
        matchingPoolAvax: 0,
        matchingPoolUsd: 0,
        active: false,
        timeRemainingSeconds: 0,
      };

      try {
        const [rawRound, timeRemaining] = await Promise.all([
          matching.getRound(),
          matching.getTimeRemaining(),
        ]);

        const matchingPoolAvax = Number(ethers.formatEther(rawRound.matchingPool ?? rawRound[3] ?? 0n));
        const now = Math.floor(Date.now() / 1000);
        const projectIds = rawRound.projectIds ?? rawRound[0] ?? [];
        const endTime = Number(rawRound.endTime ?? rawRound[2] ?? 0);
        const isActive = (rawRound.active ?? rawRound[4] ?? false) &&
                         endTime > now &&
                         projectIds.length > 0;

        round = {
          projectIds: [...projectIds],
          startTime: Number(rawRound.startTime ?? rawRound[1] ?? 0),
          endTime,
          matchingPoolAvax,
          matchingPoolUsd: matchingPoolAvax * AVAX_TO_USD,
          active: isActive,
          timeRemainingSeconds: Number(timeRemaining),
        };
      } catch {
        return { round, projects: [] };
      }

      let projects: QFProjectData[] = [];
      if (round.active && round.projectIds.length > 0) {
        const projectDataPromises = round.projectIds.map(async (projectId: string) => {
          try {
            const [contributions, projectedMatching] = await Promise.all([
              matching.getProjectContributions(projectId),
              matching.calculateMatching(projectId).catch(() => 0n),
            ]);

            const totalAvax = Number(ethers.formatEther(contributions[0] ?? 0n));
            const projectedAvax = Number(ethers.formatEther(projectedMatching ?? 0n));

            return {
              projectId,
              projectName: projectId,
              orgContract: "",
              totalContributed: totalAvax,
              totalContributedUsd: totalAvax * AVAX_TO_USD,
              uniqueDonors: Number(contributions[1] ?? 0),
              projectedMatchingAvax: projectedAvax,
              projectedMatchingUsd: projectedAvax * AVAX_TO_USD,
            } as QFProjectData;
          } catch {
            return null;
          }
        });

        const rawProjects = await Promise.all(projectDataPromises);
        const validProjects = rawProjects.filter(Boolean) as QFProjectData[];

        if (validProjects.length > 0) {
          try {
            const { data: dbProjects } = await supabase
              .from("claro_projects")
              .select("onchain_project_id, name, org_contract")
              .in("onchain_project_id", round.projectIds)
              .eq("is_active", true);

            const nameMap = new Map(
              (dbProjects ?? []).map((p) => [p.onchain_project_id, { name: p.name, org: p.org_contract }])
            );

            projects = validProjects.map((p) => ({
              ...p,
              projectName: nameMap.get(p.projectId)?.name ?? p.projectId,
              orgContract: nameMap.get(p.projectId)?.org ?? "",
            }));
          } catch {
            projects = validProjects;
          }
        }
      }

      return { round, projects };
    },
  });

  async function contribute(projectId: string, amountUsd: number): Promise<boolean> {
    const amountAvax = amountUsd / AVAX_TO_USD;
    const amountWei = ethers.parseEther(amountAvax.toFixed(6));

    setContributeStep("confirming");
    setContributingProjectId(projectId);

    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(CHAIN_ID);
      const ethProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethProvider);
      const signer = await provider.getSigner();

      const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, signer);
      const tx = await matching.contribute(projectId, { value: amountWei });
      const receipt = await tx.wait(1);
      const txHash = receipt?.hash ?? tx.hash;

      try {
        const signerAddress = await signer.getAddress();
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-donation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              tx_hash: txHash,
              org_contract: "",
              donor_address: signerAddress,
              amount_avax: amountAvax,
              amount_usd: amountUsd,
              tx_type: "qf_contribution",
              project_id: projectId,
            }),
          }
        );
      } catch { /* non-blocking */ }

      queryClient.invalidateQueries({ queryKey: ["qf-round"] });
      setContributeStep("success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Contribution failed";
      const isRejected = message.toLowerCase().includes("rejected") ||
                         message.toLowerCase().includes("denied");
      setContributeError(isRejected ? "Transaction cancelled." : "Contribution failed. Try again.");
      setContributeStep("error");
      return false;
    }
  }

  function resetContribute() {
    setContributeStep("idle");
    setContributeError(null);
    setContributingProjectId(null);
  }

  return {
    round: data?.round ?? {
      projectIds: [], startTime: 0, endTime: 0,
      matchingPoolAvax: 0, matchingPoolUsd: 0,
      active: false, timeRemainingSeconds: 0,
    },
    projects: data?.projects ?? [],
    isLoading,
    contributeStep,
    contributeError,
    contributingProjectId,
    contribute,
    resetContribute,
  };
}
