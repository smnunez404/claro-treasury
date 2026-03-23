import { TrendingUp, ArrowUpRight, Heart, ArrowLeftRight, Clock } from "lucide-react";
import { formatUsd } from "@/lib/constants";
import type { OrgFinancials } from "@/types/claro";

interface Props {
  financials: OrgFinancials | null | undefined;
  isLoading: boolean;
}

const kpis = [
  { key: "total_received_usd", label: "Total Raised", Icon: TrendingUp, iconColor: "text-[#057A55]", format: true },
  { key: "total_disbursed_usd", label: "Disbursed to Projects", Icon: ArrowUpRight, iconColor: "text-[#E3A008]", format: true },
  { key: "total_donors", label: "Unique Donors", Icon: Heart, iconColor: "text-[#1A56DB]", format: false },
  { key: "total_transactions", label: "On-chain Transactions", Icon: ArrowLeftRight, iconColor: "text-gray-400", format: false },
] as const;

export default function OrgFinancialSummary({ financials, isLoading }: Props) {
  return (
    <div className="bg-[#0A0E1A] text-white py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-700 animate-pulse rounded h-16" />
              ))
            : kpis.map(({ key, label, Icon, iconColor, format }) => {
                const raw = financials?.[key] ?? 0;
                const value = format ? formatUsd(Number(raw)) : String(raw);
                return (
                  <div key={key}>
                    <p className="text-2xl sm:text-3xl font-bold text-white break-all">{value}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon className={iconColor} style={{ width: 20, height: 20 }} />
                      <span className="text-gray-400 text-sm">{label}</span>
                    </div>
                  </div>
                );
              })}
        </div>

        {financials?.last_transaction_at && (
          <div className="border-t border-gray-800 mt-6 pt-4 text-xs text-gray-500 flex items-center gap-2">
            <Clock style={{ width: 12, height: 12 }} />
            Last transaction: {new Date(financials.last_transaction_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
