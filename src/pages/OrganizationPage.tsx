import { useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import OrgPageSkeleton from "@/components/organization/OrgPageSkeleton";
import ProfileTab from "@/components/organization/ProfileTab";
import ProjectsTab from "@/components/organization/ProjectsTab";
import ImpactTab from "@/components/organization/ImpactTab";
import TeamTab from "@/components/organization/TeamTab";
import type { OrgFull, Project, Milestone, ImpactMetric, TeamMember } from "@/types/claro";

export default function OrganizationPage() {
  const { orgContractAddress } = useAuth();

  const orgProfileQuery = useQuery({
    queryKey: ["org-profile", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_organizations")
        .select("contract_address, name, country, description, website, logo_url, cover_image_url, org_type, contact_email, social_twitter, social_instagram, verified")
        .eq("contract_address", orgContractAddress!)
        .single();
      if (error) throw error;
      return data as OrgFull;
    },
  });

  const projectsQuery = useQuery({
    queryKey: ["my-projects", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_projects")
        .select("id, name, description, category, status, target_usd, start_date, end_date, website_url, onchain_project_id, created_at")
        .eq("org_contract", orgContractAddress!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const milestonesQuery = useQuery({
    queryKey: ["my-milestones", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_milestones")
        .select("id, project_id, title, description, status, target_date, completed_date, evidence_url, evidence_type, sort_order")
        .eq("org_contract", orgContractAddress!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Milestone[];
    },
  });

  const metricsQuery = useQuery({
    queryKey: ["my-metrics", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_impact_metrics")
        .select("id, project_id, metric_name, metric_value, metric_unit, period_start, period_end, evidence_url, verified")
        .eq("org_contract", orgContractAddress!)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ImpactMetric[];
    },
  });

  const teamQuery = useQuery({
    queryKey: ["my-team", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_team_members")
        .select("id, name, role, bio, avatar_url, wallet_address, sort_order")
        .eq("org_contract", orgContractAddress!)
        .eq("is_public", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TeamMember[];
    },
  });

  if (orgProfileQuery.isLoading) return <OrgPageSkeleton />;

  const org = orgProfileQuery.data;
  if (!org) return <p className="p-8 text-gray-500">Organization not found.</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-4 pt-6 pb-2 md:px-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Organization</h1>
            <p className="text-sm text-gray-500 mt-1">{org.name}</p>
          </div>
          <div className="mt-1">
            {org.verified ? (
              <span className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full">
                Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 mt-6 pb-8">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab org={org} orgContractAddress={orgContractAddress!} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab
              projects={projectsQuery.data ?? []}
              isLoading={projectsQuery.isLoading}
              orgContractAddress={orgContractAddress!}
            />
          </TabsContent>

          <TabsContent value="impact">
            <ImpactTab
              projects={projectsQuery.data ?? []}
              milestones={milestonesQuery.data ?? []}
              metrics={metricsQuery.data ?? []}
              isLoading={milestonesQuery.isLoading}
              orgContractAddress={orgContractAddress!}
            />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab
              team={teamQuery.data ?? []}
              isLoading={teamQuery.isLoading}
              orgContractAddress={orgContractAddress!}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
