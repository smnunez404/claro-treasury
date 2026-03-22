import { useState } from "react";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { CLARO_FACTORY_ABI } from "@/lib/abis";
import { FACTORY_ADDRESS, RPC_URL, CHAIN_ID } from "@/lib/constants";
import type { RegisterStep, RegisterFormData, DeployResult } from "@/types/claro";

const MIN_AVAX_REQUIRED = 0.02;

export function useRegister() {
  const { wallets } = useWallets();

  const [step, setStep] = useState<RegisterStep>("form");
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    country: "",
    description: "",
    contact_email: "",
    website: "",
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function checkBalance(walletAddress: string): Promise<number> {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const balanceWei = await provider.getBalance(walletAddress);
    const balanceAvax = Number(ethers.formatEther(balanceWei));
    setWalletBalance(balanceAvax);
    return balanceAvax;
  }

  async function proceedToBalance(data: RegisterFormData): Promise<void> {
    setFormData(data);
    setIsCheckingBalance(true);
    setStep("balance");
    const wallet = wallets[0];
    if (wallet) {
      await checkBalance(wallet.address);
    }
    setIsCheckingBalance(false);
  }

  async function deploy(): Promise<void> {
    setStep("deploying");
    setErrorMessage(null);

    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(CHAIN_ID);
      const provider = (await wallet.getEthersProvider()) as ethers.BrowserProvider;
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const factory = new ethers.Contract(FACTORY_ADDRESS, CLARO_FACTORY_ABI, signer);

      const tx = await factory.registerOrganization(
        formData.name.trim(),
        formData.country.trim(),
        formData.description.trim(),
        formData.website.trim() || "",
        { value: 0n }
      );

      const receipt = await tx.wait(1);
      const txHash: string = receipt?.hash ?? tx.hash;

      let contractAddress = "";
      try {
        const iface = new ethers.Interface(CLARO_FACTORY_ABI);
        for (const log of receipt?.logs ?? []) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed?.name === "OrganizationRegistered") {
              contractAddress = (parsed.args[0] as string).toLowerCase();
              break;
            }
          } catch {
            /* skip non-matching logs */
          }
        }
      } catch {
        /* fallback below */
      }

      if (!contractAddress) {
        const readProvider = new ethers.JsonRpcProvider(RPC_URL);
        const readFactory = new ethers.Contract(FACTORY_ADDRESS, CLARO_FACTORY_ABI, readProvider);
        contractAddress = ((await readFactory.getOrganizationByOwner(signerAddress)) as string).toLowerCase();
      }

      // Trigger sync to Supabase (non-blocking)
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-organizations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
      } catch {
        /* non-blocking */
      }

      // Save extra profile data (non-blocking)
      if (formData.contact_email.trim()) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-org-profile`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              contract_address: contractAddress,
              wallet_address: signerAddress,
              contact_email: formData.contact_email.trim(),
              website: formData.website.trim() || null,
            }),
          });
        } catch {
          /* non-blocking */
        }
      }

      setDeployResult({ contractAddress, txHash, orgName: formData.name.trim() });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Deployment failed";
      const isRejected =
        message.toLowerCase().includes("rejected") ||
        message.toLowerCase().includes("denied") ||
        message.toLowerCase().includes("cancelled");
      setErrorMessage(
        isRejected
          ? "Transaction cancelled."
          : message.includes("Already registered")
            ? "This wallet already has a registered organization."
            : "Deployment failed. Please try again."
      );
      setStep("error");
    }
  }

  function reset() {
    setStep("form");
    setFormData({ name: "", country: "", description: "", contact_email: "", website: "" });
    setWalletBalance(null);
    setDeployResult(null);
    setErrorMessage(null);
  }

  function goBackToBalance() {
    setStep("balance");
    setErrorMessage(null);
  }

  return {
    step,
    formData,
    walletBalance,
    isCheckingBalance,
    deployResult,
    errorMessage,
    proceedToBalance,
    deploy,
    reset,
    checkBalance,
    goBackToBalance,
    MIN_AVAX_REQUIRED,
  };
}
