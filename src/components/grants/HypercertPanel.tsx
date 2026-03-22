import { useState } from "react";
import { Award, CheckCircle2, ExternalLink, Info, Loader2, XCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HYPERCERTS_ABI } from "@/lib/abis";
import {
  BASE_SEPOLIA_CHAIN_ID,
  HYPERCERTS_CONTRACT_ADDRESS,
  CHAIN_ID,
} from "@/lib/constants";
import type { GrantFull } from "@/types/claro";

interface Props {
  grants: GrantFull[];
  orgContract: string;
}

export default function HypercertPanel({ grants, orgContract }: Props) {
  const { address } = useAuth();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();
  const [selectedGrantId, setSelectedGrantId] = useState("");
  const [certifyState, setCertifyState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [certifyTx, setCertifyTx] = useState<string | null>(null);
  const [certifyError, setCertifyError] = useState<string | null>(null);

  const { data: certifiedProjects = [] } = useQuery({
    queryKey: ["hypercerts", orgContract],
    enabled: !!orgContract,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_projects")
        .select("id, name, onchain_project_id, hypercert_tx_hash")
        .eq("org_contract", orgContract.toLowerCase())
        .eq("is_active", true)
        .not("hypercert_tx_hash", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  const certifiedOnchainIds = new Set(
    certifiedProjects.map((cp) => cp.onchain_project_id)
  );
  const uncertifiedGrants = grants.filter(
    (g) => !certifiedOnchainIds.has(g.projectId)
  );

  const selectedGrant = grants.find((g) => g.projectId === selectedGrantId);

  const handleCertify = async () => {
    if (!selectedGrantId) return;

    const grantData = grants.find(g => g.projectId === selectedGrantId);
    if (!grantData) return;

    setCertifyState("loading");

    try {
      // 1. Get Privy wallet
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      // 2. Switch to Base Sepolia (Chain ID 84532)
      await wallet.switchChain(BASE_SEPOLIA_CHAIN_ID);

      // 3. Get signer on Base Sepolia
      const provider = new ethers.BrowserProvider(await wallet.getEthereumProvider());
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // 4. Build metadata URI (base64 JSON — no IPFS needed for testnet)
      const metadata = {
        name: grantData.projectName,
        description: `Impact certificate for "${grantData.projectName}". Verified by CLARO Protocol on Avalanche Fuji. All transactions publicly verifiable.`,
        external_url: `${window.location.origin}/org/${orgContract}`,
        image: "https://treasury.yaislab.org/logo.png",
        properties: {
          org_contract: orgContract,
          onchain_project_id: grantData.projectId,
          total_raised_usd: grantData.depositedUsd,
          certified_by: signerAddress,
          certified_at: new Date().toISOString(),
          network: "avalanche-fuji",
        },
      };
      const uri = `data:application/json;base64,${btoa(
        unescape(encodeURIComponent(JSON.stringify(metadata)))
      )}`;

      // 5. Call mintClaim on Hypercerts contract (Base Sepolia)
      const contract = new ethers.Contract(
        HYPERCERTS_CONTRACT_ADDRESS,
        HYPERCERTS_ABI,
        signer
      );

      const tx = await contract.mintClaim(
        signerAddress,
        1n,
        uri,
        0
      );

      const receipt = await tx.wait(1);
      const txHash = receipt?.hash ?? tx.hash;

      // 6. Switch back to Avalanche Fuji so the rest of the app works
      await wallet.switchChain(CHAIN_ID);

      // 7. Log to Supabase via log-grant-action (non-blocking)
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
              action: "grant_certified",
              org_contract: orgContract,
              executed_by: signerAddress,
              onchain_project_id: grantData.projectId,
              project_name: grantData.projectName,
              hypercert_tx: txHash,
            }),
          }
        );
      } catch (logErr) {
        console.error("log-grant-action failed (non-blocking):", logErr);
      }

      // 8. Persist TX hash to claro_projects via org-write (non-blocking)
      if (grantData.supabaseProjectId) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/org-write`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                action: "update_project",
                org_contract: orgContract,
                wallet_address: address,
                payload: {
                  id: grantData.supabaseProjectId,
                  name: grantData.projectName,
                  status: "active",
                  hypercert_tx_hash: txHash,
                },
              }),
            }
          );
          queryClient.invalidateQueries({ queryKey: ["hypercerts", orgContract] });
        } catch (saveErr) {
          console.error("Failed to persist hypercert TX (non-blocking):", saveErr);
        }
      }

      setCertifyTx(txHash);
      setCertifyState("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Certification failed";
      const isRejected =
        message.toLowerCase().includes("rejected") ||
        message.toLowerCase().includes("denied") ||
        message.toLowerCase().includes("cancelled");

      // If user rejected, switch back to Fuji anyway
      try { await wallets[0]?.switchChain(CHAIN_ID); } catch { /* ignore */ }

      setCertifyError(
        isRejected
          ? "Transaction cancelled."
          : message.includes("insufficient")
          ? "Insufficient ETH for gas on Base Sepolia. Get testnet ETH at coinbase.com/faucets"
          : "Certification failed. Please try again."
      );
      setCertifyState("error");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="text-[#E3A008]" style={{ width: 20, height: 20 }} />
          <p className="text-base font-semibold text-gray-900">Impact Certification</p>
        </div>
        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
          Powered by Hypercerts
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <Award className="text-amber-600" style={{ width: 16, height: 16 }} />
          <p className="text-sm text-amber-800 font-medium">Certify your project impact on Base Sepolia</p>
        </div>
        <p className="text-xs text-amber-700 mt-1">
          Create an on-chain certificate that proves your project's real-world impact.
          Visible to donors worldwide and permanently recorded on Base blockchain.
        </p>
      </div>

      {/* Certified Grants */}
      {certifiedProjects.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Certified Grants</p>
          <div className="space-y-2">
            {certifiedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-[#057A55]" style={{ width: 14, height: 14 }} />
                  <span className="text-sm font-medium text-gray-900">{project.name}</span>
                </div>
                <a
                  href={`https://sepolia.basescan.org/tx/${project.hypercert_tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline"
                >
                  View on Basescan
                  <ExternalLink style={{ width: 10, height: 10 }} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {grants.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Create a grant first to certify its impact.</p>
      ) : uncertifiedGrants.length === 0 && certifiedProjects.length > 0 ? (
        <div className="text-sm text-gray-500 text-center py-2 flex items-center justify-center gap-2">
          <CheckCircle2 className="text-[#057A55]" style={{ width: 14, height: 14 }} />
          All grants have been certified.
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700 mb-2">Select grant to certify</p>
          <Select value={selectedGrantId} onValueChange={setSelectedGrantId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a grant..." />
            </SelectTrigger>
            <SelectContent>
              {uncertifiedGrants.map((g) => (
                <SelectItem key={g.projectId} value={g.projectId}>
                  {g.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedGrant && (
            <div className="bg-gray-50 rounded-lg p-3 mt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">{selectedGrant.projectName}</span>
              <span className="text-sm text-[#057A55] font-bold">{selectedGrant.depositedUsd}</span>
            </div>
          )}

          <button
            onClick={handleCertify}
            disabled={!selectedGrantId || certifyState === "loading"}
            className="mt-3 w-full bg-[#E3A008] text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {certifyState === "loading" ? (
              <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
            ) : (
              <Award style={{ width: 14, height: 14 }} />
            )}
            {certifyState === "loading" ? "Minting on Base Sepolia..." : "Certify Impact on Base"}
          </button>

          {/* Idle: network info */}
          {certifyState === "idle" && (
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-2">
              <Info style={{ width: 10, height: 10 }} />
              Requires ETH on Base Sepolia for gas (~$0.001)
            </p>
          )}

          {/* Loading: chain indicator */}
          {certifyState === "loading" && (
            <p className="text-xs text-blue-500 flex items-center justify-center gap-1 mt-2">
              <Loader2 className="animate-spin" style={{ width: 10, height: 10 }} />
              Switching to Base Sepolia...
            </p>
          )}

          {/* Success state */}
          {certifyState === "success" && certifyTx && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-[#057A55]" style={{ width: 16, height: 16 }} />
                <span className="text-sm text-green-800 font-medium">Impact certified on Base Sepolia!</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                A new Hypercert was minted with your project metadata.
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${certifyTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1A56DB] flex items-center gap-1 mt-2 hover:underline"
              >
                View on Basescan
                <ExternalLink style={{ width: 10, height: 10 }} />
              </a>
              <button
                onClick={() => { setCertifyState("idle"); setCertifyTx(null); setSelectedGrantId(""); }}
                className="text-xs text-gray-400 mt-2 cursor-pointer underline"
              >
                Certify another grant
              </button>
            </div>
          )}

          {/* Error state */}
          {certifyState === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2">
                <XCircle className="text-red-500" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-red-700">{certifyError}</p>
              </div>
              {certifyError?.includes("faucet") && (
                <a
                  href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1A56DB] mt-1 inline-block hover:underline"
                >
                  Get free testnet ETH →
                </a>
              )}
              <button
                onClick={() => { setCertifyState("idle"); setCertifyError(null); }}
                className="text-xs text-gray-500 mt-2 underline cursor-pointer block"
              >
                Try again
              </button>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        Hypercerts minted on Base Sepolia · Metadata stored on-chain · Permanently verifiable
      </p>
    </div>
  );
}
