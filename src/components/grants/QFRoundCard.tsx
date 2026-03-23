import { Clock, Layers, Info, Users, TrendingUp } from "lucide-react";
import type { QFRoundFull, GrantFull, QFRoundFull2, QFProjectData } from "@/types/claro";

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Round ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

/** Strip leading "$" if present so we can format consistently */
function stripDollar(v: string): string {
  return v.startsWith("$") ? v.slice(1) : v;
}

// Support both legacy props (from GrantsPage) and new props (from useQFRound)
interface LegacyProps {
  qfRound: QFRoundFull | null;
  isLoading: boolean;
  orgGrants: GrantFull[];
  round?: never;
  projects?: never;
}

interface NewProps {
  round: QFRoundFull2;
  projects: QFProjectData[];
  isLoading: boolean;
  qfRound?: never;
  orgGrants?: never;
}

type Props = LegacyProps | NewProps;

export default function QFRoundCard(props: Props) {
  const { isLoading } = props;

  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />;
  }

  // Normalize to common shape (all USD values are raw numbers, no "$" prefix)
  let active = false;
  let matchingPoolUsd = "0.00";
  let timeLabel = "";
  let projectCount = 0;
  let projectRows: { id: string; name: string; donors: number; raised: string; match: string }[] = [];

  if ("qfRound" in props && props.qfRound) {
    const qf = props.qfRound;
    active = qf.isActive;
    matchingPoolUsd = stripDollar(qf.matchingPoolUsd);
    timeLabel = `${qf.hoursRemaining}h ${qf.minutesRemaining}m remaining`;
    projectCount = qf.projects.length;
    const grantNameMap = new Map((props.orgGrants ?? []).map((g) => [g.projectId, g.projectName]));
    projectRows = qf.projects.map((s) => ({
      id: s.projectId,
      name: grantNameMap.get(s.projectId) ?? s.projectName,
      donors: s.uniqueDonors,
      raised: stripDollar(s.totalContribUsd),
      match: stripDollar(s.projectedMatchingUsd),
    }));
  } else if ("round" in props && props.round) {
    const r = props.round;
    active = r.active;
    matchingPoolUsd = r.matchingPoolUsd.toFixed(2);
    timeLabel = formatTimeRemaining(r.timeRemainingSeconds);
    projectCount = r.projectIds.length;
    projectRows = (props.projects ?? []).map((p) => ({
      id: p.projectId,
      name: p.projectName,
      donors: p.uniqueDonors,
      raised: p.totalContributedUsd.toFixed(2),
      match: p.projectedMatchingUsd.toFixed(2),
    }));
  }

  if (!active) {
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#057A55] w-2 h-2 rounded-full animate-pulse" />
          <p className="text-base font-semibold text-gray-900">Quadratic Funding Round</p>
        </div>
        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Clock style={{ width: 10, height: 10 }} />
          {timeLabel}
        </span>
      </div>

      <div className="bg-gradient-to-r from-[#0A0E1A] to-[#1A56DB] rounded-xl p-4 mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-blue-200 text-xs uppercase">Matching Pool</p>
          <p className="text-white text-2xl font-bold">${matchingPoolUsd}</p>
        </div>
        <p className="text-blue-200 text-xs">
          {projectCount} projects · {timeLabel}
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

      {projectRows.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No projects in this round yet.</p>
      ) : (
        <div className="space-y-2">
          {projectRows.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
              <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600">
                <Users style={{ width: 12, height: 12 }} className="text-gray-400" />
                {p.donors}
              </div>
              <p className="hidden sm:block text-sm text-gray-600">${p.raised}</p>
              <div className="text-right sm:text-left">
                <span className="text-sm font-semibold text-[#057A55] flex items-center gap-1 justify-end sm:justify-start">
                  <TrendingUp style={{ width: 12, height: 12 }} />
                  ${p.match}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
