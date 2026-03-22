import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { AVAX_TO_USD, CHAIN_ID } from "@/lib/constants";
import { YAIS_TREASURY_ABI } from "@/lib/abis";
import type { DonationStep, DonationTarget } from "@/types/claro";

export function useDonation() {
  const { wallets } = useWallets();
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

      // Best-effort DB logging
      const donorAddress = (await signer.getAddress()).toLowerCase();

      try {
        await supabase.from("claro_transactions").insert({
          tx_hash: hash,
          tx_type: target.projectId ? "grant_deposit" : "treasury_deposit",
          from_address: donorAddress,
          to_address: target.orgContract.toLowerCase(),
          amount_avax: amountAvax,
          amount_usd: amountUsd,
          contract_address: target.orgContract.toLowerCase(),
          org_contract: target.orgContract.toLowerCase(),
          onchain_project_id: target.projectId ?? null,
          network: "avalanche-fuji",
        });
      } catch (dbError) {
        console.error("DB log failed (non-blocking):", dbError);
      }

      try {
        await supabase.from("claro_donations").insert({
          tx_hash: hash,
          org_contract: target.orgContract.toLowerCase(),
          onchain_project_id: target.projectId ?? null,
          donor_address: donorAddress,
          amount_avax: amountAvax,
          amount_usd: amountUsd,
          is_anonymous: false,
        });
      } catch (dbError) {
        console.error("Donations log failed (non-blocking):", dbError);
      }

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
