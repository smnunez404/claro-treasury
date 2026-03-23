import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TreasuryAnalyticsData } from "@/types/claro";

export function useTreasuryAnalytics(orgContract: string) {
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ["treasury-analytics", orgContract],
    enabled: !!orgContract,
    staleTime: 2 * 60 * 1000,
    queryFn: async (): Promise<TreasuryAnalyticsData> => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [txRes, donationsRes] = await Promise.all([
        supabase
          .from("claro_transactions")
          .select("tx_type, amount_usd, block_timestamp, created_at")
          .eq("org_contract", orgContract.toLowerCase())
          .or(`block_timestamp.gte.${thirtyDaysAgo},and(block_timestamp.is.null,created_at.gte.${thirtyDaysAgo})`)
          .order("block_timestamp", { ascending: true, nullsFirst: false }),
        supabase
          .from("claro_donations")
          .select("donor_address")
          .eq("org_contract", orgContract.toLowerCase()),
      ]);

      if (txRes.error) throw txRes.error;
      const txs = txRes.data ?? [];
      const donations = donationsRes.data ?? [];

      const INCOME_TYPES = ["grant_deposit", "treasury_deposit"];
      const EXPENSE_TYPES = ["grant_disburse", "payroll"];

      const volumeMap = new Map<string, { income_usd: number; expense_usd: number }>();
      for (const tx of txs) {
        const ts = tx.block_timestamp ?? tx.created_at;
        if (!ts) continue;
        const date = ts.slice(0, 10);
        const existing = volumeMap.get(date) ?? { income_usd: 0, expense_usd: 0 };
        const amount = Number(tx.amount_usd) || 0;
        if (INCOME_TYPES.includes(tx.tx_type ?? "")) {
          existing.income_usd += amount;
        } else if (EXPENSE_TYPES.includes(tx.tx_type ?? "")) {
          existing.expense_usd += amount;
        }
        volumeMap.set(date, existing);
      }

      const dailyVolume = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().slice(0, 10);
        const entry = volumeMap.get(dateStr) ?? { income_usd: 0, expense_usd: 0 };
        dailyVolume.push({ date: dateStr, ...entry });
      }

      const totalIncomeUsd = txs
        .filter(t => INCOME_TYPES.includes(t.tx_type ?? ""))
        .reduce((s, t) => s + (Number(t.amount_usd) || 0), 0);

      const totalExpenseUsd = txs
        .filter(t => EXPENSE_TYPES.includes(t.tx_type ?? ""))
        .reduce((s, t) => s + (Number(t.amount_usd) || 0), 0);

      const typeMap = new Map<string, { amount_usd: number; count: number }>();
      for (const tx of txs) {
        const key = tx.tx_type ?? "unknown";
        const existing = typeMap.get(key) ?? { amount_usd: 0, count: 0 };
        typeMap.set(key, {
          amount_usd: existing.amount_usd + (Number(tx.amount_usd) || 0),
          count: existing.count + 1,
        });
      }

      const TYPE_META: Record<string, { label: string; color: string }> = {
        grant_deposit:    { label: "Donations",      color: "#057A55" },
        treasury_deposit: { label: "Direct Deposits", color: "#1A56DB" },
        grant_disburse:   { label: "Grant Payouts",   color: "#E3A008" },
        payroll:          { label: "Payroll",          color: "#9333EA" },
      };

      const breakdown = Array.from(typeMap.entries())
        .map(([type, data]) => ({
          type,
          label: TYPE_META[type]?.label ?? type.replace(/_/g, " "),
          color: TYPE_META[type]?.color ?? "#9CA3AF",
          ...data,
        }))
        .sort((a, b) => b.amount_usd - a.amount_usd);

      return {
        dailyVolume,
        totalIncomeUsd,
        totalExpenseUsd,
        netUsd: totalIncomeUsd - totalExpenseUsd,
        uniqueDonors: new Set(donations.map(d => d.donor_address)).size,
        txCount: txs.length,
        breakdown,
      } satisfies TreasuryAnalyticsData;
    },
  });

  return { analytics, isLoading, isError };
}
