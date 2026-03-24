import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import type { QFAdminRound } from "@/types/claro";

interface Props {
  rounds: QFAdminRound[];
  isLoading: boolean;
  onDistribute: (round: QFAdminRound) => void;
}

export default function QFRoundHistory({ rounds, isLoading, onDistribute }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
      <p className="text-sm font-semibold text-gray-900 mb-3">Round History</p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : rounds.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No rounds yet</p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {rounds.slice(0, 5).map((round) => (
            <div
              key={round.roundId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="text-xs font-semibold text-gray-900">Round #{round.roundId}</p>
                <p className="text-xs text-gray-400">
                  {new Date(round.startTime * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {round.distributed ? (
                  <CheckCircle2 className="text-[#057A55]" style={{ width: 12, height: 12 }} />
                ) : round.canDistribute ? (
                  <AlertCircle className="text-amber-500" style={{ width: 12, height: 12 }} />
                ) : round.active && !round.hasEnded ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                ) : (
                  <Circle className="text-gray-300" style={{ width: 12, height: 12 }} />
                )}
                <span className="text-xs text-gray-500">${round.matchingPoolUsd.toFixed(2)}</span>
                {round.canDistribute && (
                  <button
                    onClick={() => onDistribute(round)}
                    className="text-xs text-amber-600 underline cursor-pointer"
                  >
                    Distribute
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
