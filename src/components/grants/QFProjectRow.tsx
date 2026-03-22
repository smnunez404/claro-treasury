import { Users } from "lucide-react";
import type { QFProjectStat } from "@/types/claro";

interface Props {
  stat: QFProjectStat;
  grantName: string;
}

export default function QFProjectRow({ stat, grantName }: Props) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
      <p className="text-sm font-medium text-gray-900 truncate">{grantName}</p>

      <div className="flex items-center gap-1">
        <Users className="text-gray-400" style={{ width: 12, height: 12 }} />
        <span className="text-sm text-gray-700">{stat.uniqueDonors}</span>
      </div>

      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">{stat.totalContribUsd}</p>
        {stat.totalContribAvax > 0 && (
          <p className="text-xs text-gray-400">{stat.totalContribAvax.toFixed(4)} AVAX</p>
        )}
      </div>

      <div>
        {stat.projectedMatchingAvax > 0 ? (
          <>
            <p className="text-sm font-semibold text-[#057A55]">{stat.projectedMatchingUsd}</p>
            <p className="text-xs text-gray-400">{stat.projectedMatchingAvax.toFixed(4)} AVAX</p>
          </>
        ) : (
          <p className="text-sm text-gray-400">—</p>
        )}
      </div>
    </div>
  );
}
