import { Clock, Layers, Info } from "lucide-react";
import type { QFRoundFull, GrantFull } from "@/types/claro";
import QFProjectRow from "./QFProjectRow";

interface Props {
  qfRound: QFRoundFull | null;
  isLoading: boolean;
  orgGrants: GrantFull[];
}

export default function QFRoundCard({ qfRound, isLoading, orgGrants }: Props) {
  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />;
  }

  const grantNameMap = new Map(orgGrants.map((g) => [g.projectId, g.projectName]));

  if (!qfRound) {
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
            Quadratic Funding Round #{qfRound.roundId}
          </p>
        </div>
        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Clock style={{ width: 10, height: 10 }} />
          {qfRound.hoursRemaining}h {qfRound.minutesRemaining}m remaining
        </span>
      </div>

      <div className="bg-gradient-to-r from-[#0A0E1A] to-[#1A56DB] rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs uppercase">Matching Pool</p>
          <p className="text-white text-2xl font-bold">{qfRound.matchingPoolUsd}</p>
        </div>
        <p className="text-blue-200 text-xs">
          {qfRound.projects.length} projects · {qfRound.hoursRemaining}h left
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
      <div className="grid grid-cols-2 sm:hidden gap-2 px-3 mb-2">
        {["Project", "Match"].map((h) => (
          <p key={h} className="text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</p>
        ))}
      </div>

      {qfRound.projects.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No projects in this round yet.</p>
      ) : (
        <div className="space-y-2">
          {qfRound.projects.map((stat) => (
            <QFProjectRow
              key={stat.projectId}
              stat={stat}
              grantName={grantNameMap.get(stat.projectId) ?? stat.projectName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
