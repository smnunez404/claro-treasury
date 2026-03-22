import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardQFRound } from "@/types/claro";

interface Props {
  qfRound: DashboardQFRound;
}

export default function DashboardQFCard({ qfRound }: Props) {
  return (
    <div className="bg-gradient-to-r from-[#0A0E1A] to-[#1A56DB] rounded-xl p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-blue-200 text-xs uppercase tracking-wider">Quadratic Funding — Active Round</p>
          <p className="text-white text-base font-bold mt-1">Round #{qfRound.roundId} is live</p>
          <p className="text-blue-200 text-xs mt-1">
            {qfRound.projectCount} projects · {qfRound.hoursRemaining}h remaining
          </p>
        </div>
        <div className="text-right">
          <p className="text-white text-2xl font-bold">{qfRound.matchingPoolUsd}</p>
          <p className="text-blue-200 text-xs">Matching Pool</p>
        </div>
      </div>
      <div className="mt-3 border-t border-blue-800 pt-3">
        <Link to="/grants" className="text-blue-200 text-xs flex items-center gap-1 hover:text-white transition-colors">
          Go to Grants to participate
          <ArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>
    </div>
  );
}
