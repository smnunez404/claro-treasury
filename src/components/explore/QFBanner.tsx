import { Clock, Zap } from "lucide-react";
import type { QFRoundFull2 } from "@/types/claro";

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
  isLoading: boolean;
  onScrollToOrgs?: () => void;
}

export default function QFBanner({ round, isLoading, onScrollToOrgs }: Props) {
  if (isLoading || !round.active) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 -mt-6 mb-2 relative z-10">
      <div className="bg-gradient-to-r from-[#1A56DB] to-[#057A55] rounded-xl p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-blue-100 text-xs font-medium uppercase tracking-wider">
            Quadratic Funding — Round Active
          </span>
          <span className="text-white text-xl font-bold">Community Matching Round</span>
          <span className="text-blue-100 text-sm mt-1 max-w-lg">
            Donate to any project and your contribution gets matched from the pool.
            Unique donors matter more than donation size.
          </span>
        </div>
        <div className="flex flex-col md:items-end gap-1">
          <span className="text-white text-3xl font-bold">
            ${round.matchingPoolUsd.toFixed(2)}
          </span>
          <span className="text-blue-100 text-sm">Matching Pool</span>
          <span className="text-blue-100 text-sm flex items-center gap-1">
            <Clock style={{ width: 12, height: 12 }} />
            {formatTimeRemaining(round.timeRemainingSeconds)}
          </span>
          <span className="text-blue-100 text-xs mt-1">
            {round.projectIds.length} projects participating
          </span>
          {onScrollToOrgs && (
            <button
              onClick={onScrollToOrgs}
              className="mt-2 bg-white/20 text-white text-xs px-4 py-1.5 rounded-md hover:bg-white/30 transition-colors flex items-center gap-1"
            >
              <Zap style={{ width: 10, height: 10 }} />
              Contribute to QF Round
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
