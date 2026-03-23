import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { AVAX_TO_USD, CHAIN_ID } from "@/lib/constants";
import { YAIS_TREASURY_ABI } from "@/lib/abis";
import type { DonationStep, DonationTarget } from "@/types/claro";

export function useDonation() {
  const { wallets } = useWallets();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<DonationStep>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const donate = useCallback(async (amountUsd: number, target: DonationTarget): Promise<void> => {
    setStep("confirming");
    setTxHash(null);
    setErrorMessage(null);

    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(CHAIN_ID);

      const ethersProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethersProvider);
      const signer = await provider.getSigner();

      const amountAvax = amountUsd / AVAX_TO_USD;
      const amountWei = ethers.parseEther(amountAvax.toFixed(18));

      let txResponse: ethers.TransactionResponse;

      if (target.projectId) {
        const contract = new ethers.Contract(target.orgContract, YAIS_TREASURY_ABI, signer);
        txResponse = await contract.depositToGrant(target.projectId, { value: amountWei });
      } else {
        txResponse = await signer.sendTransaction({
          to: target.orgContract,
          value: amountWei,
        });
      }

      const receipt = await txResponse.wait(1);
      const hash = receipt?.hash ?? txResponse.hash;
      setTxHash(hash);

      // 6. Log to Supabase via Edge Function (service_role — always works)
      try {
        const donorAddress = await signer.getAddress();
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-donation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              tx_hash: hash,
              org_contract: target.orgContract,
              donor_address: donorAddress.toLowerCase(),
              amount_avax: amountAvax,
              amount_usd: amountUsd,
              onchain_project_id: target.projectId ?? null,
              is_anonymous: false,
            }),
          }
        );
      } catch (logError) {
        // Non-blocking — on-chain tx is confirmed regardless of logging
        console.error("log-donation Edge Function failed (non-blocking):", logError);
      }

      // Invalidate relevant queries so cards/stats refresh
      queryClient.invalidateQueries({ queryKey: ["explore-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["explore-orgs-meta"] });
      queryClient.invalidateQueries({ queryKey: ["protocol-stats"] });
      queryClient.invalidateQueries({ queryKey: ["org-profile"] });
      queryClient.invalidateQueries({ queryKey: ["treasury"] });

      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      const isRejected =
        message.toLowerCase().includes("rejected") ||
        message.toLowerCase().includes("denied") ||
        message.toLowerCase().includes("cancelled");
      setErrorMessage(isRejected ? "Transaction cancelled." : "Transaction failed. Please try again.");
      setStep("error");
    }
  }, [wallets]);

  const reset = useCallback(() => {
    setStep("idle");
    setTxHash(null);
    setErrorMessage(null);
  }, []);

  return { step, txHash, errorMessage, donate, reset };
}
