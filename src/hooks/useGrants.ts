import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { YAIS_TREASURY_ABI, CLARO_MATCHING_ABI } from "@/lib/abis";
import {
  RPC_URL,
  CHAIN_ID,
  AVAX_TO_USD,
  MATCHING_ADDRESS,
  avaxToUsd,
} from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type {
  GrantOnChain,
  AIReport,
  QFProjectStat,
  QFRoundFull,
  CreateGrantStep,
  DisburseStep,
} from "@/types/claro";

const provider = new ethers.JsonRpcProvider(RPC_URL);

export function useGrants() {
  const { orgContractAddress } = useAuth();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  // Write states
  const [createStep, setCreateStep] = useState<CreateGrantStep>("idle");
  const [createError, setCreateError] = useState<string | null>(null);
  const [disburseStep, setDisburseStep] = useState<DisburseStep>("idle");
  const [disburseError, setDisburseError] = useState<string | null>(null);
  const [disburseTxHash, setDisburseTxHash] = useState<string | null>(null);

  // QUERY 1 — grants from blockchain
  const {
    data: grants = [],
    isLoading: isGrantsLoading,
  } = useQuery({
    queryKey: ["grants-onchain", orgContractAddress],
    enabled: !!orgContractAddress,
    staleTime: 30_000,
    queryFn: async (): Promise<GrantOnChain[]> => {
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, provider);
      const count = Number(await contract.getGrantCount());
      if (count === 0) return [];

      const projectIds: string[] = await Promise.all(
        Array.from({ length: count }, (_, i) => contract.grantList(i))
      );

      const results = await Promise.all(
        projectIds.map(async (projectId) => {
          const [name, deposited, disbursed, active] = await contract.getGrant(projectId);
          const depositedAvax = Number(ethers.formatEther(deposited));
          const disbursedAvax = Number(ethers.formatEther(disbursed));
          const availableAvax = depositedAvax - disbursedAvax;
          return {
            projectId,
            name,
            depositedAvax,
            depositedUsd: avaxToUsd(depositedAvax),
            disbursedAvax,
            disbursedUsd: avaxToUsd(disbursedAvax),
            availableAvax,
            availableUsd: avaxToUsd(availableAvax),
            active,
          } satisfies GrantOnChain;
        })
      );
      return results.filter((g) => g.active);
    },
  });

  // QUERY 2 — supabase projects
  const { data: projects = [] } = useQuery({
    queryKey: ["grants-projects", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_projects")
        .select("id, name, onchain_project_id, category, status")
        .eq("org_contract", orgContractAddress!)
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  // QUERY 3 — QF round full
  const {
    data: qfRound = null,
    isLoading: isQfLoading,
  } = useQuery({
    queryKey: ["qf-round-full", orgContractAddress],
    staleTime: 60_000,
    queryFn: async (): Promise<QFRoundFull | null> => {
      try {
        const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, provider);
        const roundCount = Number(await matching.roundCount());
        if (roundCount === 0) return null;

        const round = await matching.getRound(roundCount);
        const [id, , endTime, matchingPool, distributed, active] = round;

        const secondsRemaining = Number(await matching.getTimeRemaining(Number(id)));
        const hoursRemaining = Math.floor(secondsRemaining / 3600);
        const minutesRemaining = Math.floor((secondsRemaining % 3600) / 60);
        const isActive = active && !distributed && secondsRemaining > 0;
        if (!isActive) return null;

        const poolAvax = Number(ethers.formatEther(matchingPool));
        const roundProjects: string[] = await matching.getRoundProjects(Number(id));

        let matchingProjectIds: string[] = [];
        let matchingAmounts: bigint[] = [];
        try {
          const calc = await matching.calculateMatching(Number(id));
          matchingProjectIds = calc[0];
          matchingAmounts = calc[1];
        } catch {
          /* calculateMatching may fail if no contributions */
        }

        const matchingMap = new Map<string, number>();
        matchingProjectIds.forEach((pid: string, i: number) => {
          matchingMap.set(pid, Number(ethers.formatEther(matchingAmounts[i] ?? 0n)));
        });

        const projectStats: QFProjectStat[] = await Promise.all(
          roundProjects.map(async (projectId) => {
            const [totalAmount, uniqueDonors] = await matching.getProjectStats(Number(id), projectId);
            const contribAvax = Number(ethers.formatEther(totalAmount));
            const projectedAvax = matchingMap.get(projectId) ?? 0;
            return {
              projectId,
              projectName: projectId,
              totalContribAvax: contribAvax,
              totalContribUsd: avaxToUsd(contribAvax),
              uniqueDonors: Number(uniqueDonors),
              projectedMatchingAvax: projectedAvax,
              projectedMatchingUsd: avaxToUsd(projectedAvax),
            };
          })
        );

        return {
          roundId: Number(id),
          endTime: Number(endTime),
          hoursRemaining,
          minutesRemaining,
          matchingPoolAvax: poolAvax,
          matchingPoolUsd: avaxToUsd(poolAvax),
          isActive: true,
          distributed: false,
          projects: projectStats,
        } satisfies QFRoundFull;
      } catch {
        return null;
      }
    },
  });

  // QUERY 4 — AI reports
  const {
    data: reports = [],
    isLoading: isReportsLoading,
  } = useQuery({
    queryKey: ["grants-reports", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async (): Promise<AIReport[]> => {
      const { data, error } = await supabase
        .from("claro_reports")
        .select("id, report_text, generated_at, model_used, total_usd, tx_count")
        .eq("org_contract", orgContractAddress!)
        .eq("is_public", true)
        .order("generated_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as AIReport[];
    },
  });

  // WRITE — createGrant
  const createGrant = useCallback(
    async (projectId: string, projectName: string): Promise<boolean> => {
      setCreateStep("confirming");
      setCreateError(null);
      try {
        const privyWallet = wallets[0];
        await privyWallet.switchChain(CHAIN_ID);
        const eip1193 = await privyWallet.getEthereumProvider();
        const browserProvider = new ethers.BrowserProvider(eip1193);
        const signer = await browserProvider.getSigner();
        const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, signer);
        const tx = await contract.createGrant(projectId, projectName);
        await tx.wait(1);

        // Log non-blocking
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-grant-action`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                action: "grant_created",
                org_contract: orgContractAddress,
                executed_by: await signer.getAddress(),
                onchain_project_id: projectId,
                project_name: projectName,
              }),
            }
          );
        } catch (logErr) {
          console.error("log-grant-action failed (non-blocking):", logErr);
        }

        setCreateStep("success");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isRejected = /rejected|denied|cancelled/i.test(msg);
        setCreateError(isRejected ? "Transaction cancelled." : "Failed to create grant.");
        setCreateStep("error");
        return false;
      }
    },
    [wallets, orgContractAddress]
  );

  // WRITE — disburseGrant
  const disburseGrant = useCallback(
    async (
      projectId: string,
      projectName: string,
      recipientAddress: string,
      amountWei: bigint,
      amountAvax: number
    ): Promise<boolean> => {
      setDisburseStep("confirming");
      setDisburseError(null);
      try {
        const privyWallet = wallets[0];
        await privyWallet.switchChain(CHAIN_ID);
        const ethersProvider = await privyWallet.getEthersProvider() as ethers.BrowserProvider;
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, signer);
        const tx = await contract.disburseGrant(projectId, recipientAddress, amountWei);
        const receipt = await tx.wait(1);
        const txHash = receipt?.hash ?? tx.hash;
        setDisburseTxHash(txHash);

        // Log non-blocking
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-grant-action`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                action: "grant_disbursed",
                org_contract: orgContractAddress,
                executed_by: await signer.getAddress(),
                onchain_project_id: projectId,
                project_name: projectName,
                recipient: recipientAddress,
                amount_avax: amountAvax,
                amount_usd: amountAvax * AVAX_TO_USD,
                tx_hash: txHash,
              }),
            }
          );
        } catch (logErr) {
          console.error("log-grant-action failed (non-blocking):", logErr);
        }

        setDisburseStep("success");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isRejected = /rejected|denied|cancelled/i.test(msg);
        setDisburseError(isRejected ? "Transaction cancelled." : "Failed to disburse funds.");
        setDisburseStep("error");
        return false;
      }
    },
    [wallets, orgContractAddress]
  );

  const reset = useCallback(() => {
    setCreateStep("idle");
    setCreateError(null);
    setDisburseStep("idle");
    setDisburseError(null);
    setDisburseTxHash(null);
  }, []);

  const refetchGrants = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["grants-onchain", orgContractAddress] });
  }, [queryClient, orgContractAddress]);

  const refetchReports = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["grants-reports", orgContractAddress] });
  }, [queryClient, orgContractAddress]);

  return {
    grants,
    projects,
    qfRound,
    reports,
    isGrantsLoading,
    isQfLoading,
    isReportsLoading,
    createStep,
    createError,
    disburseStep,
    disburseError,
    disburseTxHash,
    createGrant,
    disburseGrant,
    reset,
    refetchGrants,
    refetchReports,
  };
}
