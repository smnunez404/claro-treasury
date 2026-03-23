import type { TreasuryAnalyticsData } from "@/types/claro";

interface Props {
  breakdown: TreasuryAnalyticsData["breakdown"];
  total: number;
}

export default function TreasuryBreakdown({ breakdown, total }: Props) {
  if (!breakdown.length) {
    return <p className="text-sm text-gray-400 text-center py-8">No transactions to break down</p>;
  }

  return (
    <div className="space-y-3">
      {breakdown.map((item) => (
        <div key={item.type} className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: item.color }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">${item.amount_usd.toFixed(2)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: total > 0 ? `${(item.amount_usd / total) * 100}%` : "0%",
                  background: item.color,
                }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 w-10 text-right">
            {item.count} tx
          </span>
        </div>
      ))}

      <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between">
        <span className="text-xs text-gray-500">Total activity</span>
        <span className="text-xs font-semibold text-gray-700">
          ${total.toFixed(2)} · {breakdown.reduce((s, b) => s + b.count, 0)} transactions
        </span>
      </div>
    </div>
  );
}
