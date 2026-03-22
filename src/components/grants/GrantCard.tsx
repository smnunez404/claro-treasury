import { ExternalLink, Send } from "lucide-react";
import type { GrantFull } from "@/types/claro";

interface Props {
  grant: GrantFull;
  onDisburse: () => void;
  snowtraceUrl: string;
  orgContractAddress: string;
}

export default function GrantCard({ grant, onDisburse, snowtraceUrl, orgContractAddress }: Props) {
  const pct = grant.depositedAvax > 0
    ? (grant.disbursedAvax / grant.depositedAvax * 100)
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{grant.projectName}</p>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{grant.projectId}</p>
        </div>
        {grant.availableAvax > 0 ? (
          <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
            {grant.availableUsd} available
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
            Fully disbursed
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { value: grant.depositedUsd, label: "Total Raised" },
          { value: grant.disbursedUsd, label: "Disbursed" },
          { value: grant.availableUsd, label: "Available" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">{s.value}</span>
            <span className="text-xs text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Disbursed</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div
            className="h-2 bg-[#057A55] rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <a
          href={`${snowtraceUrl}/address/${orgContractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600"
        >
          <ExternalLink style={{ width: 10, height: 10 }} />
          View on Snowtrace
        </a>

        {grant.availableAvax > 0 ? (
          <button
            onClick={onDisburse}
            className="bg-[#057A55] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            <Send style={{ width: 12, height: 12 }} />
            Disburse Funds
          </button>
        ) : (
          <button disabled className="bg-gray-100 text-gray-400 text-xs px-3 py-1.5 rounded-md cursor-not-allowed">
            No funds available
          </button>
        )}
      </div>
    </div>
  );
}
