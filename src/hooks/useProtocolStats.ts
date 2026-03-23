import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import { MATCHING_ADDRESS, RPC_URL, AVAX_TO_USD } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import type { ProtocolFullStats } from "@/types/claro";

export function useProtocolStats() {
  const { data: stats, isLoading, isError } = useQuery<ProtocolFullStats>({
    queryKey: ["protocol-stats"],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const [orgsRes, txRes, donationsRes, projectsRes, reportsRes, auditRes, dailyRes] =
        await Promise.all([
          supabase
            .from("claro_organizations")
            .select("contract_address, verified, country")
            .eq("is_active", true),
          supabase.from("claro_transactions").select("tx_type, amount_usd"),
          supabase.from("claro_donations").select("donor_address"),
          supabase
            .from("claro_projects")
            .select("id, hypercert_tx_hash")
            .eq("is_active", true),
          supabase
            .from("claro_reports")
            .select("id", { count: "exact", head: true })
            .eq("is_public", true),
          supabase
            .from("claro_audit_log")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("claro_transactions")
            .select("block_timestamp, created_at, amount_usd, tx_type")
            .gte(
              "created_at",
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            )
            .order("created_at", { ascending: true }),
        ]);

      const orgs = orgsRes.data ?? [];
      const txs = txRes.data ?? [];
      const donations = donationsRes.data ?? [];
      const projects = projectsRes.data ?? [];
      const dailyTxs = dailyRes.data ?? [];

      const totalRaisedUsd = txs
        .filter(
          (t) => t.tx_type === "grant_deposit" || t.tx_type === "treasury_deposit"
        )
        .reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);

      const totalDisbursedUsd = txs
        .filter(
          (t) => t.tx_type === "grant_disburse" || t.tx_type === "payroll"
        )
        .reduce((sum, t) => sum + (Number(t.amount_usd) || 0), 0);

      const uniqueDonors = new Set(donations.map((d) => d.donor_address)).size;
      const countries = [
        ...new Set(orgs.map((o) => o.country).filter(Boolean)),
      ] as string[];
      const hypercertsMinted = projects.filter(
        (p) => p.hypercert_tx_hash
      ).length;

      const volumeMap = new Map<
        string,
        { amount_usd: number; count: number }
      >();
      for (const tx of dailyTxs) {
        const ts = tx.block_timestamp ?? tx.created_at;
        if (!ts) continue;
        const date = ts.slice(0, 10);
        const existing = volumeMap.get(date) ?? { amount_usd: 0, count: 0 };
        volumeMap.set(date, {
          amount_usd: existing.amount_usd + (Number(tx.amount_usd) || 0),
          count: existing.count + 1,
        });
      }

      const dailyVolume: { date: string; amount_usd: number; count: number }[] =
        [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().slice(0, 10);
        const entry = volumeMap.get(dateStr) ?? { amount_usd: 0, count: 0 };
        dailyVolume.push({ date: dateStr, ...entry });
      }

      let qfRoundActive = false;
      let qfMatchingPool = 0;
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const matching = new ethers.Contract(
          MATCHING_ADDRESS,
          CLARO_MATCHING_ABI,
          provider
        );
        const currentId = await matching.currentRoundId();
        const round = await matching.getRound(currentId);
        qfRoundActive =
          round && Number(round.endTime) > Math.floor(Date.now() / 1000);
        qfMatchingPool = Number(
          ethers.formatEther(round?.matchingPool ?? 0n)
        );
      } catch {
        /* silent fail */
      }

      return {
        totalOrgs: orgs.length,
        verifiedOrgs: orgs.filter((o) => o.verified).length,
        pendingOrgs: orgs.filter((o) => !o.verified).length,
        countries,
        totalRaisedUsd,
        totalDisbursedUsd,
        totalTransactions: txs.length,
        uniqueDonors,
        activeProjects: projects.length,
        hypercertsMinted,
        reportsGenerated: reportsRes.count ?? 0,
        auditEntries: auditRes.count ?? 0,
        qfRoundActive,
        qfMatchingPool,
        dailyVolume,
      } satisfies ProtocolFullStats;
    },
  });

  return { stats, isLoading, isError };
}
