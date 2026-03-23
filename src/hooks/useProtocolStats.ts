import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import { MATCHING_ADDRESS, RPC_URL, AVAX_TO_USD } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import type { ProtocolFullStats } from "@/types/claro";

/** Supabase-only stats — fast, no blockchain dependency */
function useSupabaseStats() {
  return useQuery({
    queryKey: ["protocol-stats-supabase"],
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
        dailyVolume,
        // defaults — will be overridden by QF query
        qfRoundActive: false,
        qfMatchingPool: 0,
      } satisfies ProtocolFullStats;
    },
  });
}

/** QF round data from blockchain — slow, isolated so it never blocks rendering */
function useQfRound() {
  return useQuery({
    queryKey: ["protocol-qf-round"],
    staleTime: 5 * 60 * 1000,
    retry: 0,
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL, undefined, {
          staticNetwork: true,
        });
        const matching = new ethers.Contract(
          MATCHING_ADDRESS,
          CLARO_MATCHING_ABI,
          provider
        );
        const roundCount = await matching.roundCount();
        const count = Number(roundCount);
        if (count === 0) {
          clearTimeout(timeout);
          return { qfRoundActive: false, qfMatchingPool: 0 };
        }
        const round = await matching.getRound(count);
        clearTimeout(timeout);

        const endTime = Number(round[2]);
        const matchingPool = round[3];
        const distributed = round[4];
        const active = round[5] && !distributed && endTime > Math.floor(Date.now() / 1000);
        const pool = Number(ethers.formatEther(matchingPool ?? 0n));
        return { qfRoundActive: active, qfMatchingPool: pool };
      } catch {
        clearTimeout(timeout);
        return { qfRoundActive: false, qfMatchingPool: 0 };
      }
    },
  });
}

export function useProtocolStats() {
  const { data: supabaseStats, isLoading: isLoadingDb, isError } = useSupabaseStats();
  const { data: qfData } = useQfRound();

  // Merge: show Supabase data immediately, overlay QF when ready
  const stats: ProtocolFullStats | undefined = supabaseStats
    ? {
        ...supabaseStats,
        qfRoundActive: qfData?.qfRoundActive ?? false,
        qfMatchingPool: qfData?.qfMatchingPool ?? 0,
      }
    : undefined;

  return { stats, isLoading: isLoadingDb, isError };
}
