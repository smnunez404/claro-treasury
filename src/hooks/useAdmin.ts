import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { useAuth } from "@/contexts/AuthContext";
import { CLARO_FACTORY_ABI } from "@/lib/abis";
import { FACTORY_ADDRESS, CHAIN_ID } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import type {
  AdminOrgRow,
  ProtocolGlobalStats,
  VerifyStep,
} from "@/types/claro";

export function useAdmin() {
  const { address } = useAuth();
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  const [verifyStep, setVerifyStep] = useState<VerifyStep>("idle");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyingAddress, setVerifyingAddress] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // QUERY 1 — org list
  const {
    data: orgs,
    isLoading: isOrgsLoading,
  } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const [orgsRes, scoresRes] = await Promise.all([
        supabase
          .from("claro_organizations")
          .select("contract_address, owner_address, name, country, description, verified, verified_at, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("v_transparency_score")
          .select("contract_address, transparency_score"),
      ]);
      if (orgsRes.error) throw orgsRes.error;
      if (scoresRes.error) throw scoresRes.error;

      const scoreMap = new Map(
        (scoresRes.data ?? []).map((s) => [s.contract_address, s.transparency_score ?? 0])
      );

      return (orgsRes.data ?? []).map((org) => ({
        ...org,
        created_at: org.created_at ?? new Date().toISOString(),
        transparency_score: scoreMap.get(org.contract_address) ?? 0,
        total_received_usd: 0,
        total_donors: 0,
      })) as AdminOrgRow[];
    },
  });

  // QUERY 2 — protocol global stats
  const {
    data: globalStats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["admin-global-stats"],
    queryFn: async () => {
      const [orgsRes, txRes, donorsRes] = await Promise.all([
        supabase
          .from("claro_organizations")
          .select("contract_address, verified", { count: "exact" })
          .eq("is_active", true),
        supabase
          .from("claro_transactions")
          .select("amount_usd", { count: "exact" }),
        supabase
          .from("claro_donations")
          .select("donor_address"),
      ]);
      if (orgsRes.error) throw orgsRes.error;

      const orgsList = orgsRes.data ?? [];
      const txs = txRes.data ?? [];
      const donations = donorsRes.data ?? [];

      const totalRaisedUsd = txs.reduce(
        (sum, t) => sum + (Number(t.amount_usd) || 0),
        0
      );
      const uniqueDonors = new Set(donations.map((d) => d.donor_address)).size;

      return {
        totalOrgs: orgsRes.count ?? 0,
        verifiedOrgs: orgsList.filter((o) => o.verified).length,
        pendingOrgs: orgsList.filter((o) => !o.verified).length,
        totalTransactions: txRes.count ?? 0,
        totalRaisedUsd,
        totalDonors: uniqueDonors,
      } satisfies ProtocolGlobalStats;
    },
  });

  // WRITE — verify organization on-chain
  async function verifyOrganization(contractAddress: string): Promise<boolean> {
    setVerifyStep("confirming");
    setVerifyingAddress(contractAddress);

    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(CHAIN_ID);
      const ethersProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethersProvider);
      const signer = await provider.getSigner();

      const factory = new ethers.Contract(FACTORY_ADDRESS, CLARO_FACTORY_ABI, signer);
      const tx = await factory.verifyOrganization(contractAddress);
      await tx.wait(1);

      // Update Supabase to reflect verified = true
      await supabase
        .from("claro_organizations")
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("contract_address", contractAddress.toLowerCase());

      // Audit log (best effort)
      try {
        await supabase.from("claro_audit_log").insert({
          org_contract: contractAddress.toLowerCase(),
          action: "org_verified",
          actor_address: (await signer.getAddress()).toLowerCase(),
          metadata: { verified_by: "protocol_admin" },
        });
      } catch {
        /* non-blocking */
      }

      queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-global-stats"] });

      setVerifyStep("success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      const isRejected =
        message.toLowerCase().includes("rejected") ||
        message.toLowerCase().includes("denied") ||
        message.toLowerCase().includes("cancelled");
      setVerifyError(
        isRejected ? "Transaction cancelled." : "Verification failed. Try again."
      );
      setVerifyStep("error");
      return false;
    }
  }

  function resetVerify() {
    setVerifyStep("idle");
    setVerifyError(null);
    setVerifyingAddress(null);
  }

  // SYNC — trigger sync-organizations
  async function syncOrganizations(): Promise<void> {
    setIsSyncing(true);
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-organizations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-global-stats"] });
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }

  return {
    orgs,
    globalStats,
    isOrgsLoading,
    isStatsLoading,
    verifyStep,
    verifyError,
    verifyingAddress,
    verifyOrganization,
    resetVerify,
    isSyncing,
    syncOrganizations,
  };
}
