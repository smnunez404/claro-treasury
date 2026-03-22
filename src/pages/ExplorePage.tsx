import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { Compass, Folder, ArrowLeftRight, AlertCircle, Zap } from "lucide-react";

function ScoreBox({ score }: { score: number | null }) {
  const s = score ?? 0;
  let colors = "text-gray-700 bg-gray-100 border-gray-200";
  if (s >= 80) colors = "text-green-700 bg-green-50 border-green-200";
  else if (s >= 50) colors = "text-amber-700 bg-amber-50 border-amber-200";

  return (
    <div className={`rounded-lg px-3 py-2 border ${colors}`}>
      <span className="text-3xl font-bold">{s}</span>
      <span className="text-sm text-muted-foreground">/100</span>
      <p className="text-xs text-muted-foreground mt-0.5">Transparency Score</p>
    </div>
  );
}

interface OrgCardData {
  contract_address: string | null;
  name: string | null;
  transparency_score: number | null;
  projects: number | null;
  transactions: number | null;
}

function OrgCard({ org }: { org: OrgCardData }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <p className="text-base font-semibold text-foreground truncate">{org.name}</p>
      <div className="flex gap-4 mt-2 flex-wrap">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Folder style={{ width: 12, height: 12 }} /> {org.projects ?? 0} projects
        </span>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeftRight style={{ width: 12, height: 12 }} /> {org.transactions ?? 0} transactions
        </span>
      </div>
      <div className="mt-4">
        <ScoreBox score={org.transparency_score} />
      </div>
      <div className="mt-4">
        <Link
          to="/explore"
          className="border border-border bg-card text-foreground hover:bg-muted rounded-md px-4 py-2 text-sm w-full inline-block text-center transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const statsQuery = useQuery({
    queryKey: ["explore-stats"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("claro_organizations")
        .select("contract_address, verified", { count: "exact" })
        .eq("is_active", true);
      if (error) throw error;
      const totalOrgs = count ?? 0;
      const verifiedOrgs = (data ?? []).filter((o) => o.verified).length;
      return { totalOrgs, verifiedOrgs };
    },
  });

  const orgsQuery = useQuery({
    queryKey: ["explore-orgs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_transparency_score")
        .select("contract_address, name, transparency_score, projects, transactions")
        .order("transparency_score", { ascending: false });
      if (error) throw error;
      return data as OrgCardData[];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="py-16 px-4" style={{ backgroundColor: "#0A0E1A" }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white max-w-2xl" style={{ lineHeight: 1.1 }}>
            Transparent Treasury for Latin American Organizations
          </h1>
          <p className="text-gray-400 text-lg mt-4 max-w-xl">
            Every fund movement publicly verifiable on the Avalanche blockchain.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link
              to="/explore"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Explore Organizations
            </Link>
            <Link
              to="/register"
              className="border border-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Register Your Organization
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-b border-border py-4">
        <div className="max-w-7xl mx-auto flex justify-center gap-8 flex-wrap px-4">
          {statsQuery.isLoading ? (
            <>
              <div className="animate-pulse w-32 h-5 bg-muted rounded" />
              <div className="animate-pulse w-32 h-5 bg-muted rounded" />
              <div className="animate-pulse w-32 h-5 bg-muted rounded" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-foreground">
                {statsQuery.data?.totalOrgs ?? "--"} Organizations
              </span>
              <span className="text-sm font-medium text-foreground">
                {statsQuery.data?.verifiedOrgs ?? "--"} Verified
              </span>
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Zap style={{ width: 14, height: 14 }} /> Avalanche Fuji
              </span>
            </>
          )}
        </div>
      </section>

      {/* Orgs */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-foreground">Registered Organizations</h2>

        {orgsQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 h-48 animate-pulse" />
            ))}
          </div>
        )}

        {orgsQuery.isError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3 mt-6">
            <AlertCircle className="text-destructive" style={{ width: 20, height: 20 }} />
            <span className="text-sm text-foreground">Could not load organizations.</span>
            <button
              onClick={() => orgsQuery.refetch()}
              className="ml-auto text-sm font-medium text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {orgsQuery.isSuccess && orgsQuery.data.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Compass className="text-gray-300" style={{ width: 48, height: 48 }} />
            <p className="text-sm font-semibold text-foreground mt-4">No organizations registered yet</p>
            <Link
              to="/register"
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Register yours
            </Link>
          </div>
        )}

        {orgsQuery.isSuccess && orgsQuery.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {orgsQuery.data.map((org) => (
              <OrgCard key={org.contract_address} org={org} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
