import { Activity, Building2, CheckCircle2, TrendingUp } from "lucide-react";
import { formatUsd } from "@/lib/constants";
import type { AuditStats as AuditStatsType } from "@/types/claro";

interface Props {
  stats: AuditStatsType | undefined;
  isLoading: boolean;
}

export default function AuditStats({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const items = [
    {
      icon: <Activity style={{ width: 16, height: 16 }} className="text-[#1A56DB]" />,
      value: (stats?.totalEntries ?? 0).toLocaleString(),
      label: "Total Actions",
      color: "text-gray-900",
    },
    {
      icon: <Building2 style={{ width: 16, height: 16 }} className="text-gray-400" />,
      value: stats?.totalOrgs ?? 0,
      label: "Organizations",
      color: "text-gray-900",
    },
    {
      icon: <CheckCircle2 style={{ width: 16, height: 16 }} className="text-[#057A55]" />,
      value: stats?.totalVerified ?? 0,
      label: "Verified",
      color: "text-[#057A55]",
    },
    {
      icon: <TrendingUp style={{ width: 16, height: 16 }} className="text-[#E3A008]" />,
      value: formatUsd(stats?.totalUsd ?? 0),
      label: "Total Moved",
      color: "text-gray-900",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {item.icon}
              <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
