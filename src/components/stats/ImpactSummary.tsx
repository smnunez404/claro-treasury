import { Award, Sparkles, ShieldCheck, FolderOpen } from "lucide-react";
import type { ProtocolFullStats } from "@/types/claro";

interface Props {
  stats: ProtocolFullStats | undefined;
}

export default function ImpactSummary({ stats }: Props) {
  const items = [
    {
      icon: Award,
      bg: "bg-amber-50",
      color: "text-amber-500",
      value: stats?.hypercertsMinted ?? 0,
      label: "Hypercerts minted on Base Sepolia",
      sub: "Permanent impact certification · cross-chain",
      showSub: (stats?.hypercertsMinted ?? 0) > 0,
    },
    {
      icon: Sparkles,
      bg: "bg-blue-50",
      color: "text-[#1A56DB]",
      value: stats?.reportsGenerated ?? 0,
      label: "AI transparency reports generated",
      sub: "Powered by Gemini 2.0 Flash",
      showSub: (stats?.reportsGenerated ?? 0) > 0,
    },
    {
      icon: ShieldCheck,
      bg: "bg-green-50",
      color: "text-[#057A55]",
      value: stats?.auditEntries ?? 0,
      label: "Immutable audit log entries",
      sub: "No records can be deleted or modified",
      showSub: true,
    },
    {
      icon: FolderOpen,
      bg: "bg-purple-50",
      color: "text-purple-500",
      value: stats?.activeProjects ?? 0,
      label: "Active projects across all organizations",
    },
  ];

  const techStack = [
    "Avalanche C-Chain",
    "Base Sepolia",
    "Supabase",
    "Gemini 2.0 Flash",
    "Privy",
    "Onramper",
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm h-full">
      <p className="text-base font-semibold text-gray-900 mb-4">
        Impact &amp; Transparency
      </p>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}
            >
              <item.icon style={{ width: 20, height: 20 }} className={item.color} />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
              {item.sub && item.showSub && (
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-2">Built on:</p>
        <div className="flex flex-wrap gap-2">
          {techStack.map((t) => (
            <span
              key={t}
              className="bg-gray-50 border border-gray-200 text-xs text-gray-600 px-2 py-1 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
