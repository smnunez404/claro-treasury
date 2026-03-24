import {
  Zap,
  TrendingUp,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";
import type { QFAdminRound } from "@/types/claro";

interface Props {
  round: QFAdminRound | null;
  isLoading: boolean;
  onDistribute: (round: QFAdminRound) => void;
}

export default function QFRoundStatus({ round, isLoading, onDistribute }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!round) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-center py-6">
          <Zap className="text-gray-300 mx-auto" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-semibold text-gray-900 mt-3">No QF rounds yet</p>
          <p className="text-xs text-gray-400 mt-1">Create a round to start Quadratic Funding.</p>
        </div>
      </div>
    );
  }

  const isActive = round.active && !round.hasEnded && !round.distributed;
  const isEnded = round.hasEnded && !round.distributed && round.canDistribute;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-gray-900">Round #{round.roundId}</p>
          {isActive && (
            <span className="bg-green-50 border border-green-200 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Active
            </span>
          )}
          {isEnded && (
            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2 py-0.5 rounded-full">
              Ended · Ready to distribute
            </span>
          )}
          {round.distributed && (
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
              Distributed
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="text-[#057A55]" style={{ width: 14, height: 14 }} />
            <span className="text-xs text-gray-500">Matching Pool</span>
          </div>
          <p className="text-lg font-bold text-gray-900">${round.matchingPoolUsd.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <FolderOpen className="text-[#1A56DB]" style={{ width: 14, height: 14 }} />
            <span className="text-xs text-gray-500">Projects</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{round.projectIds.length}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          {!round.hasEnded ? (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="text-[#E3A008]" style={{ width: 14, height: 14 }} />
                <span className="text-xs text-gray-500">Time Left</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatTimeRemaining(round.timeRemainingSeconds)}
              </p>
            </>
          ) : round.distributed ? (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="text-[#057A55]" style={{ width: 14, height: 14 }} />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Completed</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className="text-amber-500" style={{ width: 14, height: 14 }} />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Round ended</p>
            </>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Projects in this round
        </p>
        <div className="flex flex-wrap gap-2">
          {round.projectIds.map((pid) => (
            <span
              key={pid}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md font-mono"
            >
              {pid}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <span>Started: {new Date(round.startTime * 1000).toLocaleDateString()}</span>
        <span>·</span>
        <span>Ends: {new Date(round.endTime * 1000).toLocaleDateString()}</span>
      </div>

      {/* Action */}
      {round.canDistribute && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" style={{ width: 16, height: 16 }} />
            <div>
              <p className="text-sm font-semibold text-amber-800">Ready to distribute</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The round has ended. Distribute the matching pool to projects.
              </p>
            </div>
          </div>
          <button
            onClick={() => onDistribute(round)}
            className="bg-amber-500 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 hover:bg-amber-600 active:scale-[0.97] transition-all shrink-0"
          >
            <Zap style={{ width: 14, height: 14 }} />
            Distribute
          </button>
        </div>
      )}

      {round.distributed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 className="text-[#057A55]" style={{ width: 16, height: 16 }} />
          <p className="text-sm text-green-800">Matching pool distributed successfully.</p>
        </div>
      )}
    </div>
  );
}
