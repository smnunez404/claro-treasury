import { formatUsd } from "@/lib/constants";
import type { ProtocolGlobalStats } from "@/types/claro";

interface Props {
  stats: ProtocolGlobalStats | undefined;
  isLoading: boolean;
}

export default function AdminStatsBar({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const cells = [
    { value: stats?.totalOrgs ?? 0, label: "Total Organizations", color: "text-gray-900" },
    { value: stats?.verifiedOrgs ?? 0, label: "Verified", color: "text-[#057A55]" },
    { value: stats?.pendingOrgs ?? 0, label: "Pending Verification", color: "text-amber-600" },
    { value: stats?.totalTransactions ?? 0, label: "On-chain Transactions", color: "text-gray-900" },
    { value: formatUsd(stats?.totalRaisedUsd ?? 0), label: "Total Raised", color: "text-gray-900" },
    { value: stats?.totalDonors ?? 0, label: "Unique Donors", color: "text-gray-900" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col">
            <span className={`text-2xl font-bold ${cell.color}`}>{cell.value}</span>
            <span className="text-sm text-gray-500 mt-1">{cell.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
