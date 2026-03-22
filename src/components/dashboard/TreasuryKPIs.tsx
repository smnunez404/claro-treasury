import { Wallet, TrendingUp, Users, Gift, AlertCircle } from "lucide-react";
import { formatUsd } from "@/lib/constants";
import type { TreasuryData } from "@/types/claro";

interface Props {
  treasuryData: TreasuryData | undefined;
  financials: { total_received_usd: number | null; total_donors: number | null } | null | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function TreasuryKPIs({ treasuryData, financials, isLoading, isError, onRetry }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="text-destructive shrink-0" style={{ width: 20, height: 20 }} />
        <p className="text-sm text-foreground flex-1">Could not load treasury data.</p>
        <button onClick={onRetry} className="text-sm font-medium text-primary hover:underline">Retry</button>
      </div>
    );
  }

  const cards = [
    {
      label: "Treasury Balance",
      icon: Wallet,
      iconBg: "bg-blue-50",
      iconColor: "text-[#1A56DB]",
      value: treasuryData?.balanceUsd ?? "$0.00",
      sub: (treasuryData?.balanceAvax ?? 0).toFixed(4) + " AVAX",
    },
    {
      label: "Total Raised",
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-[#057A55]",
      value: formatUsd(financials?.total_received_usd ?? 0),
      sub: (financials?.total_donors ?? 0) + " donors",
    },
    {
      label: "Team Members",
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      value: (treasuryData?.employeeCount ?? 0).toString(),
      sub: "Active on payroll",
    },
    {
      label: "Active Grants",
      icon: Gift,
      iconBg: "bg-amber-50",
      iconColor: "text-[#E3A008]",
      value: (treasuryData?.grantCount ?? 0).toString(),
      sub: "Funding rounds",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.iconBg}`}>
              <c.icon className={c.iconColor} style={{ width: 18, height: 18 }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-3">{c.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
