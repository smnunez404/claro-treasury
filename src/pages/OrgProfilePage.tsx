import { useMemo, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchX, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type {
  OrgFull,
  OrgFinancials,
  ScoreBreakdown,
  Project,
  Transaction,
  TeamMember,
  AIReport,
} from "@/types/claro";
import OrgProfileHeader from "@/components/org/OrgProfileHeader";
import OrgFinancialSummary from "@/components/org/OrgFinancialSummary";
import TransparencyScoreCard from "@/components/org/TransparencyScoreCard";
import ProjectsList from "@/components/org/ProjectsList";
import TransactionHistory from "@/components/org/TransactionHistory";
import TeamSection from "@/components/org/TeamSection";
import MilestonesSection from "@/components/org/MilestonesSection";
import DocumentsSection from "@/components/org/DocumentsSection";
import AIReportSection from "@/components/org/AIReportSection";
import OrgProfileSkeleton from "@/components/org/OrgProfileSkeleton";

export default function OrgProfilePage() {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const normalizedAddress = useMemo(() => contractAddress?.toLowerCase() ?? "", [contractAddress]);
  const queryClient = useQueryClient();

  const orgQuery = useQuery({
    queryKey: ["org-profile", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_organizations")
        .select("contract_address, name, country, description, website, logo_url, cover_image_url, org_type, verified, verified_at, social_twitter, social_instagram")
        .eq("contract_address", normalizedAddress)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as OrgFull | null;
    },
    enabled: !!contractAddress,
  });

  const financialsQuery = useQuery({
    queryKey: ["org-financials", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_org_transparency")
        .select("contract_address, total_received_usd, total_disbursed_usd, total_donors, total_transactions, active_projects, milestones_completed, milestones_total, last_transaction_at")
        .eq("contract_address", normalizedAddress)
        .maybeSingle();
      if (error) throw error;
      return data as OrgFinancials | null;
    },
    enabled: !!contractAddress,
  });

  const scoreQuery = useQuery({
    queryKey: ["org-score", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_transparency_score")
        .select("contract_address, transparency_score, projects, transactions, milestones_done, documents, impact_metrics")
        .eq("contract_address", normalizedAddress)
        .maybeSingle();
      if (error) throw error;
      return data as ScoreBreakdown | null;
    },
    enabled: !!contractAddress,
  });

  const projectsQuery = useQuery({
    queryKey: ["org-projects", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_projects")
        .select("id, org_contract, name, description, category, status, target_usd, start_date, end_date, image_url, website_url, onchain_project_id")
        .eq("org_contract", normalizedAddress)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
    enabled: !!contractAddress,
  });

  const txQuery = useQuery({
    queryKey: ["org-transactions", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_transactions")
        .select("id, tx_hash, tx_type, from_address, to_address, amount_avax, amount_usd, block_timestamp, onchain_project_id, employee_name, network")
        .eq("org_contract", normalizedAddress)
        .order("block_timestamp", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
    enabled: !!contractAddress,
  });

  const teamQuery = useQuery({
    queryKey: ["org-team", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_team_members")
        .select("id, name, role, bio, avatar_url, wallet_address, sort_order")
        .eq("org_contract", normalizedAddress)
        .eq("is_public", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
    enabled: !!contractAddress,
  });

  const reportQuery = useQuery({
    queryKey: ["org-report", normalizedAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_reports")
        .select("id, report_text, generated_at, model_used, total_usd, tx_count")
        .eq("org_contract", normalizedAddress)
        .eq("is_public", true)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as AIReport | null;
    },
    enabled: !!contractAddress,
  });

  if (!contractAddress) return <Navigate to="/explore" replace />;

  if (orgQuery.isLoading) return <OrgProfileSkeleton />;

  if (!orgQuery.data) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4">
        <SearchX className="text-gray-300" style={{ width: 48, height: 48 }} />
        <p className="text-xl font-semibold text-gray-900 mt-4">Organization not found</p>
        <p className="text-sm text-gray-500 mt-2 text-center">This address is not registered in CLARO Protocol.</p>
        <Link
          to="/explore"
          className="mt-6 bg-[#1A56DB] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#1A56DB]/90 active:scale-[0.97] transition-all"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const org = orgQuery.data;

  return (
    <div className="bg-gray-50 min-h-screen">
      <OrgProfileHeader org={org} financials={financialsQuery.data} />
      <OrgFinancialSummary financials={financialsQuery.data} isLoading={financialsQuery.isLoading} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProjectsList
              projects={projectsQuery.data ?? []}
              isLoading={projectsQuery.isLoading}
              isError={projectsQuery.isError}
              onRetry={() => queryClient.invalidateQueries({ queryKey: ["org-projects", normalizedAddress] })}
            />
            <TransactionHistory
              transactions={txQuery.data ?? []}
              isLoading={txQuery.isLoading}
              isError={txQuery.isError}
              onRetry={() => queryClient.invalidateQueries({ queryKey: ["org-transactions", normalizedAddress] })}
              orgContract={normalizedAddress}
            />
            <MilestonesSection
              projects={projectsQuery.data ?? []}
              isLoading={projectsQuery.isLoading}
            />
          </div>

          <div className="space-y-6 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-4 space-y-6">
              <TransparencyScoreCard score={scoreQuery.data} isLoading={scoreQuery.isLoading} />
              <TeamSection team={teamQuery.data ?? []} isLoading={teamQuery.isLoading} />
              <DocumentsSection orgContract={normalizedAddress} />
              <AIReportSection
                report={reportQuery.data}
                isLoading={reportQuery.isLoading}
                orgContract={normalizedAddress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
