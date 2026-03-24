import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import { MATCHING_ADDRESS, RPC_URL, CHAIN_ID, AVAX_TO_USD } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import type { QFAdminRound, DistributeStep } from "@/types/claro";

export function useQFAdmin() {
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  const [distributeStep, setDistributeStep] = useState<DistributeStep>("idle");
  const [distributeError, setDistributeError] = useState<string | null>(null);
  const [distributingRoundId, setDistributingRoundId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["qf-admin-rounds"],
    staleTime: 30_000,
    queryFn: async () => {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, provider);

      const count = Number(await matching.roundCount());
      if (count === 0) return { rounds: [] as QFAdminRound[], activeRound: null };

      const now = Math.floor(Date.now() / 1000);

      const roundPromises = Array.from({ length: count }, (_, i) =>
        Promise.all([
          matching.getRound(i + 1),
          matching.getTimeRemaining(i + 1),
          matching.getRoundProjects(i + 1),
        ])
          .then(([raw, timeRemaining, projectIds]) => {
            const matchingPoolAvax = Number(ethers.formatEther(raw[3] ?? 0n));
            const endTime = Number(raw[2]);
            const hasEnded = endTime > 0 && now > endTime;
            const distributed = raw[4] as boolean;
            const canDistribute = hasEnded && !distributed && matchingPoolAvax > 0;

            return {
              roundId: i + 1,
              startTime: Number(raw[1]),
              endTime,
              matchingPoolAvax,
              matchingPoolUsd: matchingPoolAvax * AVAX_TO_USD,
              distributed,
              active: raw[5] as boolean,
              projectIds: (projectIds as string[]) ?? [],
              timeRemainingSeconds: Number(timeRemaining),
              hasEnded,
              canDistribute,
            } as QFAdminRound;
          })
          .catch(() => null)
      );

      const rounds = (await Promise.all(roundPromises)).filter(Boolean) as QFAdminRound[];

      const activeRound =
        rounds.find((r) => r.active && !r.hasEnded) ??
        rounds.find((r) => r.canDistribute) ??
        rounds[rounds.length - 1] ??
        null;

      return { rounds: [...rounds].reverse(), activeRound };
    },
  });

  async function distribute(roundId: number): Promise<boolean> {
    setDistributeStep("confirming");
    setDistributingRoundId(roundId);

    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(CHAIN_ID);
      const provider = (await wallet.getEthersProvider()) as unknown as ethers.BrowserProvider;
      const signer = await provider.getSigner();

      const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, signer);
      const tx = await matching.distributeMatching(BigInt(roundId));
      const receipt = await tx.wait(1);
      const txHash = receipt?.hash ?? tx.hash;

      try {
        const signerAddress = await signer.getAddress();
        await supabase.from("claro_audit_log").insert({
          org_contract: "protocol",
          action: "qf_distributed",
          actor_address: signerAddress.toLowerCase(),
          tx_hash: txHash,
          metadata: { round_id: roundId },
        });
      } catch {
        /* non-blocking */
      }

      queryClient.invalidateQueries({ queryKey: ["qf-admin-rounds"] });
      queryClient.invalidateQueries({ queryKey: ["qf-round"] });
      setDistributeStep("success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Distribution failed";
      const isRejected =
        message.toLowerCase().includes("rejected") || message.toLowerCase().includes("denied");
      const notEnded = message.toLowerCase().includes("not ended");
      setDistributeError(
        isRejected
          ? "Transaction cancelled."
          : notEnded
            ? "Round has not ended yet. Wait until the round expires."
            : "Distribution failed. Try again."
      );
      setDistributeStep("error");
      return false;
    }
  }

  function resetDistribute() {
    setDistributeStep("idle");
    setDistributeError(null);
    setDistributingRoundId(null);
  }

  return {
    rounds: data?.rounds ?? [],
    activeRound: data?.activeRound ?? null,
    isLoading,
    distributeStep,
    distributeError,
    distributingRoundId,
    distribute,
    resetDistribute,
  };
}
