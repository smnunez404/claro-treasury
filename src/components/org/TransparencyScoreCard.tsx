import { ShieldCheck } from "lucide-react";
import type { ScoreBreakdown } from "@/types/claro";

interface Props {
  score: ScoreBreakdown | null | undefined;
  isLoading: boolean;
}

const criteria = [
  { key: "projects", label: "Projects created", max: 15 },
  { key: "transactions", label: "On-chain transactions", max: 20 },
  { key: "milestones_done", label: "Milestones with evidence", max: 15 },
  { key: "documents", label: "Public documents", max: 10 },
  { key: "impact_metrics", label: "Impact metrics", max: 10 },
] as const;

export default function TransparencyScoreCard({ score, isLoading }: Props) {
  const value = score?.transparency_score ?? 0;
  const strokeColor = value >= 80 ? "#057A55" : value >= 50 ? "#E3A008" : "#9CA3AF";
  const dashArray = (value / 100) * 283;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900">Transparency Score</span>
        <ShieldCheck className="text-[#057A55]" style={{ width: 20, height: 20 }} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* SVG circle */}
          <div className="relative w-32 h-32 mx-auto mt-2 mb-6">
            <svg viewBox="0 0 128 128" className="w-full h-full">
              <circle cx="64" cy="64" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle
                cx="64" cy="64" r="45"
                fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={`${dashArray} 283`}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3">
            {criteria.map(({ key, label, max }) => {
              const count = Number(score?.[key] ?? 0);
              const earned = count > 0 ? max : 0;
              const pct = (earned / max) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400">{earned}/{max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[#1A56DB]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Score updates as you add projects, transactions, and evidence
          </p>
        </>
      )}
    </div>
  );
}
