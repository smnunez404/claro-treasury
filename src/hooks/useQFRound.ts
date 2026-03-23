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
        roundId: 0,
        projectIds: [],
        startTime: 0,
        endTime: 0,
        matchingPoolAvax: 0,
        matchingPoolUsd: 0,
        active: false,
        distributed: false,
        timeRemainingSeconds: 0,
      };

      // Get total rounds
      const roundCount = await matching.roundCount();
      const count = Number(roundCount);

      if (count === 0) return { round, projects: [] };

      // Get the latest round
      const latestRoundId = count;

      try {
        const [rawRound, timeRemaining] = await Promise.all([
          matching.getRound(latestRoundId),
          matching.getTimeRemaining(latestRoundId),
        ]);

        const matchingPoolAvax = Number(ethers.formatEther(rawRound.matchingPool ?? rawRound[3] ?? 0n));
        const now = Math.floor(Date.now() / 1000);
        const endTime = Number(rawRound.endTime ?? rawRound[2] ?? 0);
        const isActive = (rawRound.active ?? rawRound[5] ?? false) &&
                         !(rawRound.distributed ?? rawRound[4] ?? false) &&
                         endTime > now;

        const projectIds = await matching.getRoundProjects(latestRoundId);

        round = {
          roundId: latestRoundId,
          projectIds: [...projectIds],
          startTime: Number(rawRound.startTime ?? rawRound[1] ?? 0),
          endTime,
          matchingPoolAvax,
          matchingPoolUsd: matchingPoolAvax * AVAX_TO_USD,
          active: isActive,
          distributed: rawRound.distributed ?? rawRound[4] ?? false,
          timeRemainingSeconds: Number(timeRemaining),
        };
      } catch {
        return { round, projects: [] };
      }

      // Fetch per-project data
      let projects: QFProjectData[] = [];
      if (round.projectIds.length > 0) {
        try {
          const [matchingResult, ...statsResults] = await Promise.all([
            matching.calculateMatching(latestRoundId).catch(() => [[], []]),
            ...round.projectIds.map((pid: string) =>
              matching.getProjectStats(latestRoundId, pid).catch(() => [0n, 0n])
            ),
          ]);

          const [matchingProjectIds, matchingAmounts] = matchingResult as [string[], bigint[]];
          const matchingMap = new Map<string, bigint>();
          (matchingProjectIds ?? []).forEach((pid: string, i: number) => {
            matchingMap.set(pid, matchingAmounts?.[i] ?? 0n);
          });

          // Enrich with Supabase names
          const { data: dbProjects } = await supabase
            .from("claro_projects")
            .select("onchain_project_id, name, org_contract")
            .in("onchain_project_id", round.projectIds)
            .eq("is_active", true);

          const nameMap = new Map(
            (dbProjects ?? []).map((p) => [p.onchain_project_id, { name: p.name, org: p.org_contract }])
          );

          projects = round.projectIds.map((pid: string, i: number) => {
            const stats = statsResults[i] as [bigint, bigint];
            const totalAvax = Number(ethers.formatEther(stats[0] ?? 0n));
            const projectedAvax = Number(ethers.formatEther(matchingMap.get(pid) ?? 0n));

            return {
              projectId: pid,
              projectName: nameMap.get(pid)?.name ?? pid,
              orgContract: nameMap.get(pid)?.org ?? "",
              totalContributed: totalAvax,
              totalContributedUsd: totalAvax * AVAX_TO_USD,
              uniqueDonors: Number(stats[1] ?? 0),
              projectedMatchingAvax: projectedAvax,
              projectedMatchingUsd: projectedAvax * AVAX_TO_USD,
            } as QFProjectData;
          });
        } catch {
          // Failed to fetch project data
        }
      }

      return { round, projects };
    },
  });

  const roundId = data?.round?.roundId ?? 0;

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
      const tx = await matching.contribute(roundId, projectId, { value: amountWei });
      const receipt = await tx.wait(1);
      const txHash = receipt?.hash ?? tx.hash;

      // Log to Supabase (non-blocking)
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
      queryClient.invalidateQueries({ queryKey: ["explore-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["explore-orgs-meta"] });
      queryClient.invalidateQueries({ queryKey: ["protocol-stats"] });
      queryClient.invalidateQueries({ queryKey: ["org-profile"] });
      queryClient.invalidateQueries({ queryKey: ["treasury"] });
      setContributeStep("success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Contribution failed";
      const lower = message.toLowerCase();
      const isRejected = lower.includes("rejected") || lower.includes("denied");
      const isInsufficientFunds =
        lower.includes("insufficient funds") ||
        lower.includes("insufficient balance") ||
        lower.includes("exceeds balance");
      setContributeError(
        isRejected
          ? "Payment cancelled."
          : isInsufficientFunds
          ? "You don't have enough funds. Tap 'Add money' to continue."
          : "Something went wrong. Please try again."
      );
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
      roundId: 0,
      projectIds: [], startTime: 0, endTime: 0,
      matchingPoolAvax: 0, matchingPoolUsd: 0,
      active: false, distributed: false,
      timeRemainingSeconds: 0,
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
