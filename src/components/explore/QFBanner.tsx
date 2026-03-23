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
      <div className="bg-gradient-to-r from-[#1A56DB] to-[#057A55] rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          {/* Left — Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-blue-100 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
              Quadratic Funding — Round Active
            </span>
            <span className="text-white text-lg sm:text-xl font-bold leading-tight">
              Community Matching Round
            </span>
            <span className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
              Donate to any project and your contribution gets matched from the pool.
              Unique donors matter more than donation size.
            </span>
          </div>

          {/* Right — Stats */}
          <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end md:gap-1 md:shrink-0">
            <div className="flex items-baseline gap-2 md:flex-col md:items-end">
              <span className="text-white text-2xl sm:text-3xl font-bold">
                ${round.matchingPoolUsd.toFixed(2)}
              </span>
              <span className="text-blue-100 text-xs sm:text-sm">Matching Pool</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:flex-col md:items-end">
              <span className="text-blue-100 text-xs sm:text-sm flex items-center gap-1">
                <Clock style={{ width: 12, height: 12 }} className="shrink-0" />
                {formatTimeRemaining(round.timeRemainingSeconds)}
              </span>
              <span className="text-blue-100 text-xs">
                {round.projectIds.length} projects participating
              </span>
            </div>

            {onScrollToOrgs && (
              <button
                onClick={onScrollToOrgs}
                className="mt-1 sm:mt-2 bg-white/20 text-white text-xs px-4 py-1.5 rounded-md hover:bg-white/30 transition-colors flex items-center gap-1 w-full sm:w-auto justify-center"
              >
                <Zap style={{ width: 10, height: 10 }} className="shrink-0" />
                Contribute to QF Round
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
