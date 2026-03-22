import { Wallet, Users, AlertCircle } from "lucide-react";

interface Props {
  balanceUsd: string;
  balanceAvax: number;
  employeeCount: number;
}

export default function TreasuryBalanceBar({ balanceUsd, balanceAvax, employeeCount }: Props) {
  const isLow = balanceAvax < 0.05;

  return (
    <div
      className={`bg-white rounded-xl p-4 ${
        isLow ? "border border-amber-200" : "border border-gray-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Wallet className="text-[hsl(224,76%,48%)]" style={{ width: 20, height: 20 }} />
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="text-xl font-bold text-foreground">{balanceUsd}</p>
            <p className="text-xs text-muted-foreground">{balanceAvax.toFixed(4)} AVAX</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground" style={{ width: 16, height: 16 }} />
          <span className="text-sm text-muted-foreground">
            {employeeCount} employee{employeeCount !== 1 ? "s" : ""} on payroll
          </span>
        </div>
      </div>

      {isLow && (
        <div className="border-t border-amber-100 mt-3 pt-3 flex items-center gap-2">
          <AlertCircle className="text-amber-500 flex-shrink-0" style={{ width: 14, height: 14 }} />
          <p className="text-sm text-amber-700">
            Low balance — add funds before executing payroll.
          </p>
        </div>
      )}
    </div>
  );
}
