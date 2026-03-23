import { MapPin, Zap } from "lucide-react";
import type { ProtocolFullStats } from "@/types/claro";

interface Props {
  stats: ProtocolFullStats | undefined;
}

export default function OrgBreakdown({ stats }: Props) {
  const total = stats?.totalOrgs ?? 0;
  const verified = stats?.verifiedOrgs ?? 0;
  const pending = stats?.pendingOrgs ?? 0;
  const verifiedPct = total > 0 ? (verified / total) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm h-full">
      <p className="text-base font-semibold text-gray-900 mb-4">Organizations</p>

      {/* Verification */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Verification Status
        </p>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          <div
            className="bg-[#057A55] rounded-full transition-all"
            style={{ width: `${verifiedPct}%` }}
          />
          <div className="bg-amber-400 flex-1" />
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-[#057A55] font-medium">{verified} verified</span>
          <span className="text-amber-600 font-medium">{pending} pending</span>
        </div>
      </div>

      {/* Countries */}
      <div className="mt-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Countries
        </p>
        {(stats?.countries ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {stats!.countries.map((c) => (
              <span
                key={c}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md flex items-center gap-1"
              >
                <MapPin style={{ width: 10, height: 10 }} className="text-gray-400" />
                {c}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No organizations registered yet</p>
        )}
      </div>

      {/* QF */}
      {stats?.qfRoundActive && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Zap style={{ width: 20, height: 20 }} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Quadratic Funding Round Active
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Matching pool: {stats.qfMatchingPool.toFixed(4)} AVAX
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              More unique donors = more matching
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
