import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Shield, Compass, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { RPC_URL, MATCHING_ADDRESS, avaxToUsd } from "@/lib/constants";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import type { OrgCard as OrgCardType, QFRound, ProtocolStats as ProtocolStatsType } from "@/types/claro";
import OrgCard from "@/components/explore/OrgCard";
import OrgCardSkeleton from "@/components/explore/OrgCardSkeleton";
import QFBanner from "@/components/explore/QFBanner";
import ProtocolStatsBar from "@/components/explore/ProtocolStats";

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

  // Query 4 — QF round from blockchain
  const qfQuery = useQuery({
    queryKey: ["qf-round"],
    queryFn: async (): Promise<QFRound | null> => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, provider);
        const roundId: bigint = await matching.currentRoundId();
        const round = await matching.getRound(roundId);
        const [matchingPool, , endTime, active] = round;
        const poolAvax = Number(ethers.formatEther(matchingPool));
        const hoursRemaining = Math.max(0, Math.floor((Number(endTime) - Date.now() / 1000) / 3600));
        return {
          matchingPoolAvax: poolAvax,
          matchingPoolUsd: avaxToUsd(poolAvax),
          endTime: Number(endTime),
          hoursRemaining,
          isActive: active && hoursRemaining > 0,
        };
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

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
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Shield style={{ width: 14, height: 14 }} />
            Secured by Avalanche blockchain · All transactions publicly verifiable
          </div>
        </div>
      </section>

      {/* SECTION 2 — QF BANNER */}
      <QFBanner round={qfQuery.data} isLoading={qfQuery.isLoading} />

      {/* SECTION 3 — PROTOCOL STATS */}
      <ProtocolStatsBar stats={statsQuery.data} isLoading={statsQuery.isLoading} isError={statsQuery.isError} />

      {/* SECTION 4 — ORGANIZATIONS GRID */}
      <section id="organizations" className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Registered Organizations</h2>
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
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
              {mergedOrgs.map((org) => (
                <OrgCard
                  key={org.contract_address}
                  org={org}
                  logoUrl={orgMeta.get(org.contract_address)?.logo_url ?? null}
                  website={orgMeta.get(org.contract_address)?.website ?? null}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
