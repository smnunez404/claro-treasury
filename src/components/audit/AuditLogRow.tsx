import {
  Heart, Award, Users, Gift, Send, ShieldCheck, RefreshCw, Sparkles,
  Folder, CheckCircle2, BarChart3, UserPlus, Activity, ExternalLink,
} from "lucide-react";
import { truncateAddress, formatUsd } from "@/lib/constants";
import type { AuditEntry } from "@/types/claro";

interface Props {
  entry: AuditEntry;
  snowtraceUrl: string;
}

const ACTION_MAP: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
  grant_deposit: { label: "Donation Received", icon: <Heart style={{ width: 14, height: 14 }} className="text-green-500" />, bg: "bg-green-50" },
  grant_certified: { label: "Impact Certified", icon: <Award style={{ width: 14, height: 14 }} className="text-amber-500" />, bg: "bg-green-50" },
  payroll_executed: { label: "Payroll Payment", icon: <Users style={{ width: 14, height: 14 }} className="text-blue-500" />, bg: "bg-blue-50" },
  grant_created: { label: "Grant Created", icon: <Gift style={{ width: 14, height: 14 }} className="text-purple-500" />, bg: "bg-gray-100" },
  grant_disbursed: { label: "Funds Disbursed", icon: <Send style={{ width: 14, height: 14 }} className="text-emerald-500" />, bg: "bg-emerald-50" },
  org_verified: { label: "Org Verified", icon: <ShieldCheck style={{ width: 14, height: 14 }} className="text-[#057A55]" />, bg: "bg-green-50" },
  org_synced_from_blockchain: { label: "Org Synced", icon: <RefreshCw style={{ width: 14, height: 14 }} className="text-gray-400" />, bg: "bg-gray-100" },
  report_generated: { label: "Report Generated", icon: <Sparkles style={{ width: 14, height: 14 }} className="text-[#E3A008]" />, bg: "bg-amber-50" },
  create_project: { label: "Project Created", icon: <Folder style={{ width: 14, height: 14 }} className="text-blue-400" />, bg: "bg-gray-100" },
  create_milestone: { label: "Milestone Added", icon: <CheckCircle2 style={{ width: 14, height: 14 }} className="text-blue-400" />, bg: "bg-gray-100" },
  create_metric: { label: "Metric Added", icon: <BarChart3 style={{ width: 14, height: 14 }} className="text-blue-400" />, bg: "bg-gray-100" },
  create_team_member: { label: "Team Member Added", icon: <UserPlus style={{ width: 14, height: 14 }} className="text-blue-400" />, bg: "bg-gray-100" },
};

export default function AuditLogRow({ entry, snowtraceUrl }: Props) {
  const mapped = ACTION_MAP[entry.action] ?? {
    label: entry.action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    icon: <Activity style={{ width: 14, height: 14 }} className="text-gray-400" />,
    bg: "bg-gray-100",
  };

  const hypercertTx = entry.metadata?.hypercert_tx as string | undefined;
  const occurredDate = new Date(entry.occurred_at);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Action */}
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${mapped.bg}`}>
            {mapped.icon}
          </div>
          <span className="text-sm font-medium text-gray-900">{mapped.label}</span>
        </div>
      </td>

      {/* Organization */}
      <td className="px-6 py-4 text-sm">
        <div className="flex flex-col gap-0.5">
          {entry.org_name ? (
            <span className="text-sm text-gray-900 truncate max-w-[140px] flex items-center gap-1">
              {entry.org_name}
              {entry.org_verified && <CheckCircle2 style={{ width: 10, height: 10 }} className="text-[#057A55] flex-shrink-0" />}
            </span>
          ) : (
            <span className="text-xs font-mono text-gray-500">{truncateAddress(entry.org_contract)}</span>
          )}
        </div>
      </td>

      {/* Amount */}
      <td className="px-6 py-4 text-sm hidden md:table-cell">
        {entry.amount_usd && entry.amount_usd > 0 ? (
          <div>
            <span className="text-sm font-semibold text-gray-900">{formatUsd(entry.amount_usd)}</span>
            {entry.amount_avax && (
              <span className="text-xs text-gray-400 block">{entry.amount_avax.toFixed(4)} AVAX</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Actor */}
      <td className="px-6 py-4 text-sm hidden md:table-cell">
        {entry.actor_address ? (
          <span className="text-xs font-mono text-gray-500">{truncateAddress(entry.actor_address)}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>

      {/* Time */}
      <td className="px-6 py-4 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{occurredDate.toLocaleDateString()}</span>
          <span className="text-xs text-gray-400">{occurredDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </td>

      {/* Verify */}
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center gap-2">
          {entry.tx_hash && (
            <button
              title="View on Snowtrace"
              onClick={() => window.open(`${snowtraceUrl}/tx/${entry.tx_hash}`, "_blank")}
              className="text-gray-400 hover:text-[#1A56DB] transition-colors"
            >
              <ExternalLink style={{ width: 14, height: 14 }} />
            </button>
          )}
          {hypercertTx && (
            <button
              title="View Hypercert on Basescan"
              onClick={() => window.open(`https://sepolia.basescan.org/tx/${hypercertTx}`, "_blank")}
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <Award style={{ width: 14, height: 14 }} />
            </button>
          )}
          {!entry.tx_hash && !hypercertTx && (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
