import { BarChart3, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import type { HypercertData } from "@/types/claro";

interface Props {
  cert: HypercertData;
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-50 text-green-700",
  in_progress: "bg-blue-50 text-[#1A56DB]",
};

export default function HypercertImpactData({ cert }: Props) {
  const hasData = cert.metrics.length > 0 || cert.milestones.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-[#1A56DB]" style={{ width: 16, height: 16 }} />
        <p className="text-base font-semibold text-gray-900">Impact Data</p>
        <span className="bg-blue-50 text-[#1A56DB] text-xs px-2 py-0.5 rounded-full">
          {cert.metrics.length + cert.milestones.length} data points
        </span>
      </div>

      {!hasData && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">No impact data registered yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Impact metrics and milestones will appear here as the project progresses.
          </p>
        </div>
      )}

      {cert.metrics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Verified Metrics
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cert.metrics.map((m) => (
              <div key={m.id} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{m.metric_name}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {m.metric_value} {m.metric_unit ?? ""}
                </p>
                {m.verified && (
                  <p className="text-xs text-[#057A55] flex items-center gap-1 mt-1">
                    <CheckCircle2 style={{ width: 10, height: 10 }} />
                    Verified
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cert.milestones.length > 0 && (
        <div className={cert.metrics.length > 0 ? "mt-6" : ""}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Project Milestones
          </p>
          <div className="space-y-3">
            {cert.milestones.map((ms) => (
              <div key={ms.id} className="flex items-start gap-3">
                {ms.status === "completed" ? (
                  <CheckCircle2 className="text-[#057A55] flex-shrink-0 mt-0.5" style={{ width: 16, height: 16 }} />
                ) : (
                  <Circle className="text-gray-300 flex-shrink-0 mt-0.5" style={{ width: 16, height: 16 }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{ms.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        statusStyles[ms.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ms.status}
                    </span>
                    {ms.completed_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(ms.completed_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {ms.evidence_url && (
                  <a
                    href={ms.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline flex-shrink-0"
                  >
                    <ExternalLink style={{ width: 10, height: 10 }} />
                    View evidence
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
