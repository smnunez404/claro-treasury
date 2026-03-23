import { Clock, Layers, Info, Users, TrendingUp } from "lucide-react";
import type { QFRoundFull2, QFProjectData } from "@/types/claro";

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Round ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

interface Props {
  round: QFRoundFull2;
  projects: QFProjectData[];
  isLoading: boolean;
}

export default function QFRoundCard({ round, projects, isLoading }: Props) {
  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />;
  }

  if (!round.active) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-base font-semibold text-gray-900 mb-4">Quadratic Funding</p>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Layers className="text-gray-300 mx-auto" style={{ width: 32, height: 32 }} />
          <p className="text-sm text-gray-600 mt-2">No active QF round</p>
          <p className="text-xs text-gray-400 mt-1">Quadratic Funding rounds are created by CLARO Protocol.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#057A55] w-2 h-2 rounded-full animate-pulse" />
          <p className="text-base font-semibold text-gray-900">
            Quadratic Funding Round
          </p>
        </div>
        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Clock style={{ width: 10, height: 10 }} />
          {formatTimeRemaining(round.timeRemainingSeconds)}
        </span>
      </div>

      <div className="bg-gradient-to-r from-[#0A0E1A] to-[#1A56DB] rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs uppercase">Matching Pool</p>
          <p className="text-white text-2xl font-bold">${round.matchingPoolUsd.toFixed(2)}</p>
        </div>
        <p className="text-blue-200 text-xs">
          {round.projectIds.length} projects · {formatTimeRemaining(round.timeRemainingSeconds)}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
        <Info className="text-blue-500 shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
        <p className="text-xs text-blue-700">
          More unique donors = more matching. 10 donors of $0.18 beats 1 donor of $5.00
        </p>
      </div>

      <div className="hidden sm:grid grid-cols-4 gap-2 px-3 mb-2">
        {["Project", "Donors", "Raised", "Projected Match"].map((h) => (
          <p key={h} className="text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No projects in this round yet.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <div
              key={p.projectId}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{p.projectName}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600">
                <Users style={{ width: 12, height: 12 }} className="text-gray-400" />
                {p.uniqueDonors}
              </div>
              <div className="hidden sm:block text-sm text-gray-600">
                ${p.totalContributedUsd.toFixed(2)}
              </div>
              <div className="text-right sm:text-left">
                <span className="text-sm font-semibold text-[#057A55] flex items-center gap-1 justify-end sm:justify-start">
                  <TrendingUp style={{ width: 12, height: 12 }} />
                  ${p.projectedMatchingUsd.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
