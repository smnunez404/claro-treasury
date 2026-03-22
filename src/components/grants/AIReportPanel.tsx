import { useState } from "react";
import { Sparkles, FileText, Calendar, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AIReport } from "@/types/claro";

interface Props {
  reports: AIReport[];
  orgContract: string;
  onReportGenerated: () => void;
}

export default function AIReportPanel({ reports, orgContract, onReportGenerated }: Props) {
  const [generateState, setGenerateState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerateState("loading");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ org_contract: orgContract }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setGenerateState("success");
      onReportGenerated();
      toast.success("Transparency report generated successfully.");
      setTimeout(() => setGenerateState("idle"), 3000);
    } catch {
      setGenerateState("error");
      toast.error("Report generation failed. Try again.");
      setTimeout(() => setGenerateState("idle"), 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#E3A008]" style={{ width: 20, height: 20 }} />
          <p className="text-base font-semibold text-gray-900">AI Transparency Reports</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generateState === "loading"}
          className="bg-[#0A0E1A] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 active:scale-[0.97]"
        >
          {generateState === "loading" ? (
            <Loader2 className="animate-spin" style={{ width: 10, height: 10 }} />
          ) : (
            <Sparkles style={{ width: 10, height: 10 }} />
          )}
          Generate
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-6">
          <FileText className="text-gray-200 mx-auto" style={{ width: 28, height: 28 }} />
          <p className="text-sm text-gray-400 mt-2">No reports yet · Generate your first report above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const expanded = expandedId === r.id;
            return (
              <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" style={{ width: 12, height: 12 }} />
                    <span className="text-xs text-gray-500">
                      {new Date(r.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">{r.model_used}</span>
                    {r.total_usd != null && r.total_usd > 0 && (
                      <span className="text-xs text-gray-500">${r.total_usd.toFixed(2)} total</span>
                    )}
                  </div>
                </div>

                <p className={`text-sm text-gray-700 leading-relaxed ${expanded ? "whitespace-pre-wrap" : "line-clamp-3"}`}>
                  {r.report_text}
                </p>

                <button
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                  className="text-xs text-[#1A56DB] mt-2 flex items-center gap-1 hover:underline"
                >
                  {expanded ? (
                    <>Collapse <ChevronUp style={{ width: 12, height: 12 }} /></>
                  ) : (
                    <>Read full report <ChevronDown style={{ width: 12, height: 12 }} /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
