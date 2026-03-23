import {
  Building2,
  Globe,
  TrendingUp,
  Users,
  FolderOpen,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { ProtocolFullStats } from "@/types/claro";

interface Props {
  stats: ProtocolFullStats | undefined;
}

export default function ProtocolHero({ stats }: Props) {
  const kpis = [
    {
      icon: Building2,
      color: "text-[#1A56DB]",
      value: stats?.totalOrgs ?? 0,
      label: "Organizations",
      sub: `${stats?.verifiedOrgs ?? 0} verified · ${stats?.pendingOrgs ?? 0} pending`,
    },
    {
      icon: Globe,
      color: "text-[#1A56DB]",
      value: stats?.countries.length ?? 0,
      label: "Countries",
      sub:
        (stats?.countries ?? []).length > 3
          ? stats!.countries.slice(0, 3).join(", ") + "…"
          : (stats?.countries ?? []).join(", ") || "—",
    },
    {
      icon: TrendingUp,
      color: "text-[#057A55]",
      value: "$" + (stats?.totalRaisedUsd ?? 0).toFixed(2),
      label: "Total Raised",
      sub: "Disbursed: $" + (stats?.totalDisbursedUsd ?? 0).toFixed(2),
    },
    {
      icon: Users,
      color: "text-[#1A56DB]",
      value: stats?.uniqueDonors ?? 0,
      label: "Unique Donors",
      sub: `${stats?.totalTransactions ?? 0} transactions`,
    },
    {
      icon: FolderOpen,
      color: "text-purple-500",
      value: stats?.activeProjects ?? 0,
      label: "Active Projects",
    },
    {
      icon: Award,
      color: "text-amber-500",
      value: stats?.hypercertsMinted ?? 0,
      label: "Hypercerts Minted",
      sub: "Base Sepolia",
    },
    {
      icon: Sparkles,
      color: "text-[#E3A008]",
      value: stats?.reportsGenerated ?? 0,
      label: "AI Reports",
      sub: "Gemini 2.0 Flash",
    },
    {
      icon: ShieldCheck,
      color: "text-[#057A55]",
      value: stats?.auditEntries ?? 0,
      label: "Audit Entries",
      sub: "Immutable log",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="text-base font-semibold text-gray-900">Protocol Overview</p>
        {stats?.qfRoundActive && (
          <span className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
            <Zap style={{ width: 10, height: 10 }} className="animate-pulse" />
            QF Round Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1">
            <k.icon style={{ width: 20, height: 20 }} className={k.color} />
            <p className="text-xl sm:text-3xl font-bold text-gray-900 truncate">
              {k.value}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mt-1">
              {k.label}
            </p>
            {k.sub && (
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">{k.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
