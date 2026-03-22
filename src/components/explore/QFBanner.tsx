import { Clock } from "lucide-react";
import type { QFRound } from "@/types/claro";

interface Props {
  round: QFRound | null | undefined;
  isLoading: boolean;
}

export default function QFBanner({ round, isLoading }: Props) {
  if (isLoading || !round?.isActive) return null;

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
          <span className="text-white text-3xl font-bold">{round.matchingPoolUsd}</span>
          <span className="text-blue-100 text-sm">Matching Pool</span>
          <span className="text-blue-100 text-sm flex items-center gap-1">
            <Clock style={{ width: 12, height: 12 }} />
            {round.hoursRemaining}h remaining
          </span>
        </div>
      </div>
    </section>
  );
}
