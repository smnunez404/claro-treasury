import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Lock, Database, Link as LinkIcon, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { SNOWTRACE_URL } from "@/lib/constants";
import type { AuditEntry, AuditFiltersState, AuditStats as AuditStatsType } from "@/types/claro";
import AuditStatsComponent from "@/components/audit/AuditStats";
import AuditFilters from "@/components/audit/AuditFilters";
import AuditLogTable from "@/components/audit/AuditLogTable";
import AuditSkeleton from "@/components/audit/AuditSkeleton";

const EMPTY_FILTERS: AuditFiltersState = { orgContract: "", actionType: "exclude_sync", dateFrom: "", dateTo: "" };

export default function AuditPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AuditFiltersState>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);

  // Fetch org names for mapping
  const { data: orgMap } = useQuery({
    queryKey: ["audit-org-map"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("claro_organizations")
        .select("contract_address, name, verified")
        .eq("is_active", true);
      const map = new Map<string, { name: string; verified: boolean }>();
      (data ?? []).forEach((o) => map.set(o.contract_address, { name: o.name, verified: o.verified ?? false }));
      return map;
    },
  });

  const { data: logData, isLoading, isError } = useQuery({
    queryKey: ["audit-log", filters, page],
    queryFn: async () => {
      let query = supabase
        .from("claro_audit_log")
        .select("id, org_contract, action, actor_address, target_address, amount_avax, amount_usd, tx_hash, metadata, occurred_at", { count: "exact" })
        .order("occurred_at", { ascending: false })
        .range(page * 50, (page + 1) * 50 - 1);

      if (filters.orgContract) {
        // Find matching contract addresses by name from orgMap
        const term = filters.orgContract.toLowerCase();
        const matchingContracts: string[] = [];
        orgMap?.forEach((org, addr) => {
          if (org.name.toLowerCase().includes(term)) {
            matchingContracts.push(addr);
          }
        });
        // Also match by contract address directly
        if (matchingContracts.length > 0) {
          query = query.in("org_contract", matchingContracts);
        } else {
          query = query.ilike("org_contract", `%${filters.orgContract}%`);
        }
      }
      if (filters.actionType) {
        query = query.eq("action", filters.actionType);
      }
      if (filters.dateFrom) {
        query = query.gte("occurred_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("occurred_at", filters.dateTo + "T23:59:59");
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const entries: AuditEntry[] = (data ?? []).map((row) => {
        const org = orgMap?.get(row.org_contract);
        return {
          id: row.id,
          org_contract: row.org_contract,
          org_name: org?.name ?? null,
          org_verified: org?.verified ?? false,
          action: row.action,
          actor_address: row.actor_address,
          target_address: row.target_address,
          amount_avax: row.amount_avax ? Number(row.amount_avax) : null,
          amount_usd: row.amount_usd ? Number(row.amount_usd) : null,
          tx_hash: row.tx_hash,
          metadata: row.metadata as Record<string, unknown> | null,
          occurred_at: row.occurred_at ?? new Date().toISOString(),
        };
      });

      return { entries, total: count ?? 0 };
    },
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["audit-stats"],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const [countRes, usdRes, orgRes] = await Promise.all([
        supabase.from("claro_audit_log").select("id", { count: "exact", head: true }),
        supabase.from("claro_audit_log").select("amount_usd"),
        supabase.from("claro_organizations").select("contract_address, verified", { count: "exact" }).eq("is_active", true),
      ]);
      const totalUsd = (usdRes.data ?? []).reduce((sum, r) => sum + (Number(r.amount_usd) || 0), 0);
      return {
        totalEntries: countRes.count ?? 0,
        totalOrgs: orgRes.count ?? 0,
        totalVerified: (orgRes.data ?? []).filter((o) => o.verified).length,
        totalUsd,
      } satisfies AuditStatsType;
    },
  });

  if (isLoading && page === 0 && !logData) {
    return <AuditSkeleton />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0A0E1A] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck style={{ width: 32, height: 32 }} className="text-[#1A56DB]" />
              <div>
                <h1 className="text-2xl font-bold text-white">Public Audit Log</h1>
                <p className="text-gray-400 text-sm mt-1">Immutable record of all CLARO Protocol actions</p>
              </div>
            </div>
            <div className="bg-green-900/40 border border-green-700 text-green-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
              <Lock style={{ width: 10, height: 10 }} />
              Immutable · No records can be deleted or modified
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-2">
              <Database style={{ width: 10, height: 10 }} /> Supabase PostgreSQL · RLS protected
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-2">
              <LinkIcon style={{ width: 10, height: 10 }} /> On-chain actions verified on Snowtrace
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-2">
              <Clock style={{ width: 10, height: 10 }} /> Real-time · Updates on every action
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AuditStatsComponent stats={stats} isLoading={isStatsLoading} />
        <AuditFilters
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(0); }}
        />
        <AuditLogTable
          entries={logData?.entries ?? []}
          total={logData?.total ?? 0}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["audit-log"] })}
          page={page}
          onPageChange={setPage}
          snowtraceUrl={SNOWTRACE_URL}
        />
      </div>
    </div>
  );
}
