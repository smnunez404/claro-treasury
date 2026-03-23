import { useProtocolStats } from "@/hooks/useProtocolStats";
import StatsSkeleton from "@/components/stats/StatsSkeleton";
import ProtocolHero from "@/components/stats/ProtocolHero";
import ActivityChart from "@/components/stats/ActivityChart";
import OrgBreakdown from "@/components/stats/OrgBreakdown";
import ImpactSummary from "@/components/stats/ImpactSummary";

export default function StatsPage() {
  const { stats, isLoading } = useProtocolStats();

  if (isLoading) return <StatsSkeleton />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="bg-[#0A0E1A] py-10 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-medium text-[#1A56DB] uppercase tracking-widest mb-2">
            CLARO Protocol
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Live Protocol Statistics
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-3 max-w-2xl">
            Real-time data from Avalanche blockchain and verified organizations
            across Latin America.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">
              Live · Updates in real time
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ProtocolHero stats={stats} />
        <ActivityChart data={stats?.dailyVolume ?? []} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrgBreakdown stats={stats} />
          <ImpactSummary stats={stats} />
        </div>
      </div>
    </div>
  );
}
