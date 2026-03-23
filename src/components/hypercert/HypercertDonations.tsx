import { Heart, TrendingUp, Send, Wallet, ShieldCheck, ExternalLink } from "lucide-react";
import { SNOWTRACE_URL } from "@/lib/constants";
import type { HypercertData } from "@/types/claro";

interface Props {
  cert: HypercertData;
}

export default function HypercertDonations({ cert }: Props) {
  const available = cert.totalRaisedUsd - cert.totalDisbursedUsd;
  const usagePct = cert.totalRaisedUsd > 0
    ? ((cert.totalDisbursedUsd / cert.totalRaisedUsd) * 100).toFixed(0)
    : "0";

  const stats = [
    { label: "Total Raised", value: `$${cert.totalRaisedUsd.toFixed(2)}`, Icon: TrendingUp, color: "text-[#057A55]" },
    { label: "Disbursed", value: `$${cert.totalDisbursedUsd.toFixed(2)}`, Icon: Send, color: "text-[#1A56DB]" },
    { label: "Available", value: `$${available.toFixed(2)}`, Icon: Wallet, color: "text-[#E3A008]" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="text-red-400" style={{ width: 16, height: 16 }} />
          <p className="text-base font-semibold text-gray-900">Funding</p>
        </div>
        <span className="text-xs text-gray-500">{cert.uniqueDonors} donors</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
            <Icon className={`${color} mx-auto mb-1`} style={{ width: 16, height: 16 }} />
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {cert.totalRaisedUsd > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Funds used</span>
            <span>{usagePct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-[#1A56DB] rounded-full transition-all"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="text-[#057A55]" style={{ width: 12, height: 12 }} />
        <span>All transactions publicly verifiable on Avalanche</span>
        <a
          href={`${SNOWTRACE_URL}/address/${cert.orgContract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1A56DB] flex items-center gap-1 hover:underline"
        >
          View on Snowtrace
          <ExternalLink style={{ width: 10, height: 10 }} />
        </a>
      </div>
    </div>
  );
}
