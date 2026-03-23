import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Shield, Compass, AlertCircle, Zap } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { RPC_URL, MATCHING_ADDRESS, avaxToUsd } from "@/lib/constants";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import type { OrgCard as OrgCardType, QFRound, ProtocolStats as ProtocolStatsType, QFProjectData } from "@/types/claro";
import OrgCard from "@/components/explore/OrgCard";
import OrgCardSkeleton from "@/components/explore/OrgCardSkeleton";
import QFBanner from "@/components/explore/QFBanner";
import ProtocolStatsBar from "@/components/explore/ProtocolStats";
import QFContributeModal from "@/components/explore/QFContributeModal";
import { useQFRound } from "@/hooks/useQFRound";

export default function ExplorePage() {
  // Query 1 — org cards combined data
  const orgsQuery = useQuery({
    queryKey: ["explore-orgs"],
    queryFn: async () => {
      const [scoreRes, orgRes] = await Promise.all([
        supabase
          .from("v_transparency_score")
          .select("contract_address, name, transparency_score, projects, transactions, milestones_done, documents, impact_metrics")
          .order("transparency_score", { ascending: false }),
        supabase
          .from("v_org_transparency")
          .select("contract_address, country, description, org_type, verified, total_received_usd, total_donors, last_transaction_at"),
      ]);
      if (scoreRes.error) throw scoreRes.error;
      if (orgRes.error) throw orgRes.error;
      const orgMap = new Map(orgRes.data?.map((o) => [o.contract_address, o]) ?? []);
      return (scoreRes.data ?? []).map((s) => ({
        ...s,
        ...(orgMap.get(s.contract_address) ?? {}),
      }));
    },
  });

  // Query 2 — logo and extras per org
  const metaQuery = useQuery({
    queryKey: ["explore-orgs-meta"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_organizations")
        .select("contract_address, logo_url, org_type, website, social_twitter, social_instagram")
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Query 3 — protocol stats
  const statsQuery = useQuery({
    queryKey: ["protocol-stats"],
    queryFn: async () => {
      const [orgRes, txRes] = await Promise.all([
        supabase
          .from("claro_organizations")
          .select("contract_address, verified", { count: "exact" })
          .eq("is_active", true),
        supabase
          .from("claro_transactions")
          .select("id", { count: "exact" }),
      ]);
      if (orgRes.error) throw orgRes.error;
      if (txRes.error) throw txRes.error;
      return {
        totalOrgs: orgRes.count ?? 0,
        verifiedOrgs: (orgRes.data ?? []).filter((o) => o.verified).length,
        totalTransactions: txRes.count ?? 0,
      } satisfies ProtocolStatsType;
    },
  });

  // QF Round from useQFRound hook
  const {
    round: qfRound,
    projects: qfProjects,
    isLoading: isQfLoading,
    contribute,
    contributeStep,
    contributeError,
    resetContribute,
  } = useQFRound();

  const [contributeTargets, setContributeTargets] = useState<QFProjectData[] | null>(null);

  // Merge org data
  const metaData = metaQuery.data;
  const orgMeta = useMemo(() => {
    const map = new Map<string, (typeof metaData extends (infer U)[] ? U : never)>();
    (metaData ?? []).forEach((m) => map.set(m.contract_address, m));
    return map;
  }, [metaData]);

  const mergedOrgs: OrgCardType[] = useMemo(() => {
    return (orgsQuery.data ?? []).map((org) => ({
      contract_address: org.contract_address ?? "",
      name: org.name ?? "",
      country: (org as any).country ?? "",
      description: (org as any).description ?? null,
      org_type: (org as any).org_type ?? orgMeta.get(org.contract_address ?? "")?.org_type ?? null,
      verified: (org as any).verified ?? false,
      transparency_score: org.transparency_score ?? 0,
      projects: org.projects ?? 0,
      transactions: org.transactions ?? 0,
      milestones_done: org.milestones_done ?? 0,
      total_received_usd: (org as any).total_received_usd ?? 0,
      total_donors: (org as any).total_donors ?? 0,
      logo_url: orgMeta.get(org.contract_address ?? "")?.logo_url ?? null,
    }));
  }, [orgsQuery.data, orgMeta]);

  // Build a map of org contract -> QF projects for that org
  const qfByOrg = useMemo(() => {
    const map = new Map<string, QFProjectData[]>();
    for (const p of qfProjects) {
      if (!p.orgContract) continue;
      const existing = map.get(p.orgContract) ?? [];
      existing.push(p);
      map.set(p.orgContract, existing);
    }
    return map;
  }, [qfProjects]);

  const scrollToOrgs = () => {
    document.getElementById("organizations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* SECTION 1 — HERO */}
      <section className="py-12 md:py-20 px-4" style={{ backgroundColor: "#0A0E1A" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            Transparent Treasury for Latin American Organizations
          </h1>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Every fund movement publicly verifiable on Avalanche.
            No crypto knowledge required — donate in USD with a card.
          </p>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <button
              onClick={scrollToOrgs}
              className="bg-[#1A56DB] text-white px-8 py-3 rounded-md font-medium text-sm hover:bg-[#1A56DB]/90 active:scale-[0.97] transition-all w-full sm:w-auto"
            >
              Explore Organizations
            </button>
            <Link
              to="/register"
              className="border border-gray-600 text-white px-8 py-3 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors w-full sm:w-auto text-center"
            >
              Register Your Organization
            </Link>
          </div>
          <div className="mt-8 flex flex-col items-center gap-1 text-gray-500 text-xs text-center px-4">
            <div className="flex items-center gap-1.5">
              <Shield className="shrink-0" style={{ width: 14, height: 14 }} />
              <span>Secured by Avalanche blockchain</span>
            </div>
            <span>All transactions publicly verifiable</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 — QF BANNER */}
      <QFBanner round={qfRound} isLoading={isQfLoading} onScrollToOrgs={scrollToOrgs} />

      {/* SECTION 3 — PROTOCOL STATS */}
      <ProtocolStatsBar stats={statsQuery.data} isLoading={statsQuery.isLoading} isError={statsQuery.isError} />

      {/* SECTION 4 — ORGANIZATIONS GRID */}
      <section id="organizations" className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Registered Organizations</h2>
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full w-fit">
              {statsQuery.data?.totalOrgs ?? 0} total
            </span>
          </div>

          {/* Loading */}
          {orgsQuery.isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <OrgCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {orgsQuery.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="text-red-500 mx-auto" style={{ width: 24, height: 24 }} />
              <p className="text-sm text-gray-700 mt-2">Could not load organizations. Please try again.</p>
              <button
                onClick={() => orgsQuery.refetch()}
                className="mt-4 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {orgsQuery.isSuccess && mergedOrgs.length === 0 && (
            <div className="flex flex-col items-center py-20">
              <Compass className="text-gray-300" style={{ width: 48, height: 48 }} />
              <p className="text-sm font-semibold text-gray-900 mt-4">No organizations yet</p>
              <p className="text-sm text-gray-500 mt-2">Be the first to register your organization on CLARO Protocol.</p>
              <Link
                to="/register"
                className="mt-6 bg-[#1A56DB] text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-[#1A56DB]/90 transition-colors"
              >
                Register Organization
              </Link>
            </div>
          )}

          {/* With data */}
          {orgsQuery.isSuccess && mergedOrgs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mergedOrgs.map((org) => {
                const orgQfProjects = qfByOrg.get(org.contract_address) ?? [];
                return (
                  <div key={org.contract_address} className="flex flex-col">
                    <OrgCard
                      org={org}
                      logoUrl={orgMeta.get(org.contract_address)?.logo_url ?? null}
                      website={orgMeta.get(org.contract_address)?.website ?? null}
                    />
                    {qfRound.active && orgQfProjects.length > 0 && (
                      <div className="bg-amber-50 border border-amber-100 border-t-0 rounded-b-xl px-4 py-2 flex items-center justify-between -mt-1">
                        <span className="flex items-center gap-1 text-xs text-amber-700">
                          <Zap className="text-amber-500" style={{ width: 12, height: 12 }} />
                          QF Round Active
                        </span>
                        <button
                          onClick={() => setContributeTargets(orgQfProjects)}
                          className="bg-amber-500 text-white text-xs px-3 py-1 rounded-md hover:bg-amber-600 transition-colors"
                        >
                          Contribute
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* QF Contribute Modal */}
      {contributeTargets && contributeTargets.length > 0 && (
        <QFContributeModal
          isOpen
          onClose={() => { setContributeTargets(null); resetContribute(); }}
          projects={contributeTargets}
          round={qfRound}
          onContribute={contribute}
          contributeStep={contributeStep}
          contributeError={contributeError}
          onReset={resetContribute}
        />
      )}
    </div>
  );
}
