import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { HypercertData } from "@/types/claro";

export function useHypercert(txHash: string) {
  const { data: cert, isLoading, isError } = useQuery<HypercertData>({
    queryKey: ["hypercert", txHash],
    enabled: !!txHash && txHash.length > 10,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: project, error: projectError } = await supabase
        .from("claro_projects")
        .select(`
          id,
          org_contract,
          name,
          description,
          category,
          status,
          onchain_project_id,
          website_url,
          hypercert_tx_hash,
          created_at,
          claro_organizations!claro_projects_org_contract_fkey (
            name,
            country,
            verified,
            description,
            contract_address
          )
        `)
        .ilike("hypercert_tx_hash", `%${txHash.slice(0, 20)}%`)
        .eq("is_active", true)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!project) throw new Error("Certificate not found");

      const org = project.claro_organizations as {
        name: string; country: string; verified: boolean;
        description: string | null; contract_address: string;
      } | null;

      const [metricsRes, milestonesRes, txRes, donationsRes, scoreRes] =
        await Promise.all([
          supabase
            .from("claro_impact_metrics")
            .select("id, metric_name, metric_value, metric_unit, verified")
            .eq("org_contract", project.org_contract)
            .eq("project_id", project.id)
            .eq("is_public", true),
          supabase
            .from("claro_milestones")
            .select("id, title, status, completed_date, evidence_url")
            .eq("org_contract", project.org_contract)
            .eq("project_id", project.id)
            .eq("is_public", true)
            .order("completed_date", { ascending: false }),
          supabase
            .from("claro_transactions")
            .select("tx_type, amount_usd")
            .eq("org_contract", project.org_contract),
          supabase
            .from("claro_donations")
            .select("donor_address")
            .eq("org_contract", project.org_contract),
          supabase
            .from("v_transparency_score")
            .select("transparency_score")
            .eq("contract_address", project.org_contract)
            .maybeSingle(),
        ]);

      const txs = txRes.data ?? [];
      const totalRaisedUsd = txs
        .filter(t => t.tx_type === "grant_deposit" || t.tx_type === "treasury_deposit")
        .reduce((s, t) => s + (Number(t.amount_usd) || 0), 0);
      const totalDisbursedUsd = txs
        .filter(t => t.tx_type === "grant_disburse" || t.tx_type === "payroll")
        .reduce((s, t) => s + (Number(t.amount_usd) || 0), 0);
      const uniqueDonors = new Set(
        (donationsRes.data ?? []).map(d => d.donor_address)
      ).size;

      const { data: auditEntry } = await supabase
        .from("claro_audit_log")
        .select("actor_address, occurred_at")
        .eq("org_contract", project.org_contract)
        .eq("action", "grant_certified")
        .order("occurred_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        txHash,
        certifiedAt: auditEntry?.occurred_at ?? project.created_at,
        certifiedBy: auditEntry?.actor_address ?? null,
        projectId: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectCategory: project.category,
        projectStatus: project.status ?? "active",
        onchainProjectId: project.onchain_project_id,
        websiteUrl: project.website_url,
        orgContract: project.org_contract,
        orgName: org?.name ?? "Organization",
        orgCountry: org?.country ?? "",
        orgVerified: org?.verified ?? false,
        orgDescription: org?.description ?? null,
        totalRaisedUsd,
        totalDisbursedUsd,
        uniqueDonors,
        metrics: (metricsRes.data ?? []).map(m => ({
          ...m,
          metric_value: String(m.metric_value),
        })),
        milestones: milestonesRes.data ?? [],
        transparencyScore: scoreRes.data?.transparency_score ?? 0,
      } satisfies HypercertData;
    },
  });

  return { cert, isLoading, isError };
}
