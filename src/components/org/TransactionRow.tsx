import { Users, Heart, Gift, PlusCircle, MinusCircle, ExternalLink } from "lucide-react";
import { formatUsd, truncateAddress } from "@/lib/constants";
import type { Transaction } from "@/types/claro";

interface Props {
  tx: Transaction;
  snowtraceUrl: string;
}

const typeMap: Record<string, { label: string; Icon: typeof Users; iconColor: string; bg: string }> = {
  payroll: { label: "Team Payment", Icon: Users, iconColor: "text-blue-500", bg: "bg-blue-50" },
  grant_deposit: { label: "Donation Received", Icon: Heart, iconColor: "text-green-500", bg: "bg-green-50" },
  grant_disburse: { label: "Project Funded", Icon: Gift, iconColor: "text-purple-500", bg: "bg-purple-50" },
  treasury_deposit: { label: "Funds Added", Icon: PlusCircle, iconColor: "text-green-500", bg: "bg-green-50" },
  treasury_withdraw: { label: "Funds Withdrawn", Icon: MinusCircle, iconColor: "text-amber-500", bg: "bg-amber-50" },
};

const isOutflow = (t: string) => ["payroll", "grant_disburse", "treasury_withdraw"].includes(t);

export default function TransactionRow({ tx, snowtraceUrl }: Props) {
  const type = tx.tx_type ?? "";
  const mapped = typeMap[type] ?? {
    label: type ? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ") : "Transaction",
    Icon: PlusCircle,
    iconColor: "text-gray-400",
    bg: "bg-gray-50",
  };
  const { label, Icon, iconColor, bg } = mapped;

  const amountColor = isOutflow(type) ? "text-red-600" : "text-green-600";
  const amountPrefix = isOutflow(type) ? "-" : "+";

  let subLabel = "";
  if (tx.employee_name) subLabel = `To ${tx.employee_name}`;
  else if (tx.onchain_project_id) subLabel = `Project #${tx.onchain_project_id.slice(0, 8)}`;
  else if (tx.from_address) subLabel = `From ${truncateAddress(tx.from_address)}`;
  else if (tx.block_timestamp) subLabel = new Date(tx.block_timestamp).toLocaleDateString();

  return (
    <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg}`}>
        <Icon className={iconColor} style={{ width: 16, height: 16 }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate">{subLabel}</p>
      </div>

      <div className="text-right shrink-0">
        {tx.amount_usd ? (
          <p className={`text-sm font-semibold ${amountColor}`}>{amountPrefix}{formatUsd(tx.amount_usd)}</p>
        ) : tx.amount_avax ? (
          <p className="text-sm font-semibold text-gray-600">{amountPrefix}{formatUsd(tx.amount_avax * 18)} est.</p>
        ) : (
          <p className="text-sm text-gray-400">--</p>
        )}
        {tx.amount_avax != null && (
          <p className="text-xs text-gray-400 hidden md:block">{tx.amount_avax.toFixed(4)} AVAX</p>
        )}
        {tx.block_timestamp && (
          <p className="text-xs text-gray-400">{new Date(tx.block_timestamp).toLocaleDateString()}</p>
        )}
      </div>

      <a
        href={`${snowtraceUrl}/tx/${tx.tx_hash}`}
        target="_blank"
        rel="noopener noreferrer"
        title="View on Snowtrace"
        className="shrink-0"
      >
        <ExternalLink className="text-gray-400 hover:text-gray-600" style={{ width: 12, height: 12 }} />
      </a>
    </div>
  );
}
