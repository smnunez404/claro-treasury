import { useState } from "react";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { useAuth } from "@/contexts/AuthContext";
import { YAIS_TREASURY_ABI } from "@/lib/abis";
import { CHAIN_ID, AVAX_TO_USD, avaxToUsd } from "@/lib/constants";
import type { PayrollStep, PayrollTx } from "@/types/claro";

export function usePayroll() {
  const { orgContractAddress } = useAuth();
  const { wallets } = useWallets();

  const [step, setStep] = useState<PayrollStep>("idle");
  const [lastTx, setLastTx] = useState<PayrollTx | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function getSigner() {
    const privyWallet = wallets[0];
    await privyWallet.switchChain(CHAIN_ID);
    const ethersProvider = await privyWallet.getEthereumProvider();
    const provider = new ethers.BrowserProvider(ethersProvider);
    return provider.getSigner();
  }

  function handleError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isRejected =
      message.includes("rejected") ||
      message.includes("denied") ||
      message.includes("cancelled");
    setErrorMessage(isRejected ? "Transaction cancelled." : message);
    setStep("error");
  }

  async function addEmployee(
    wallet: string,
    name: string,
    salaryCents: number
  ): Promise<boolean> {
    try {
      setStep("confirming");
      const signer = await getSigner();
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, signer);
      const tx = await contract.addEmployee(wallet, name, salaryCents);
      await tx.wait(1);
      setStep("idle");
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  async function removeEmployee(wallet: string): Promise<boolean> {
    try {
      setStep("confirming");
      const signer = await getSigner();
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, signer);
      const tx = await contract.removeEmployee(wallet);
      await tx.wait(1);
      setStep("idle");
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  async function executePayroll(
    employeeWallet: string,
    employeeName: string,
    amountWei: bigint,
    amountAvax: number
  ): Promise<boolean> {
    try {
      setStep("confirming");
      const signer = await getSigner();
      const contract = new ethers.Contract(orgContractAddress!, YAIS_TREASURY_ABI, signer);
      const tx = await contract.executePayroll(employeeWallet, amountWei);
      const receipt = await tx.wait(1);
      const txHash = receipt?.hash ?? tx.hash;
      const amountUsdStr = avaxToUsd(amountAvax);

      // Log to Supabase via Edge Function (non-blocking)
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-payroll`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              tx_hash: txHash,
              org_contract: orgContractAddress,
              employee_address: employeeWallet,
              employee_name: employeeName,
              amount_avax: amountAvax,
              amount_usd: amountAvax * AVAX_TO_USD,
              executed_by: await signer.getAddress(),
            }),
          }
        );
      } catch (logErr) {
        console.error("log-payroll failed (non-blocking):", logErr);
      }

      setLastTx({ txHash, employeeName, amountUsd: amountUsdStr, amountAvax });
      setStep("success");
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }

  function reset() {
    setStep("idle");
    setLastTx(null);
    setErrorMessage(null);
  }

  return { step, lastTx, errorMessage, addEmployee, removeEmployee, executePayroll, reset };
}
