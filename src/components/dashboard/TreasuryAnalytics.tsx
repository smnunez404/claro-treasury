import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, BarChart3 } from "lucide-react";
import { useTreasuryAnalytics } from "@/hooks/useTreasuryAnalytics";
import TreasuryActivityChart from "./TreasuryActivityChart";
import TreasuryBreakdown from "./TreasuryBreakdown";
import TreasuryAnalyticsSkeleton from "./TreasuryAnalyticsSkeleton";

interface Props {
  orgContract: string;
}

export default function TreasuryAnalytics({ orgContract }: Props) {
  const { analytics, isLoading, isError } = useTreasuryAnalytics(orgContract);
  const [activeTab, setActiveTab] = useState<"chart" | "breakdown">("chart");

  const tabClass = (active: boolean) =>
    active
      ? "text-sm font-medium text-[#1A56DB] border-b-2 border-[#1A56DB] pb-3"
      : "text-sm text-gray-500 hover:text-gray-700 pb-3 cursor-pointer";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 pt-5 pb-0 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Treasury Analytics</h2>
          <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <ArrowDownLeft size={12} className="text-[#057A55]" />
            <span className="text-[#057A55] font-semibold">
              ${(analytics?.totalIncomeUsd ?? 0).toFixed(2)}
            </span>
            <span className="text-gray-400">in</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpRight size={12} className="text-red-400" />
            <span className="text-red-500 font-semibold">
              ${(analytics?.totalExpenseUsd ?? 0).toFixed(2)}
            </span>
            <span className="text-gray-400">out</span>
          </div>
        </div>
      </div>

      {/* Tab row */}
      <div className="px-6 pt-4 flex items-center gap-1 border-b border-gray-100">
        <button className={tabClass(activeTab === "chart")} onClick={() => setActiveTab("chart")}>
          Activity
        </button>
        <button className={`ml-4 ${tabClass(activeTab === "breakdown")}`} onClick={() => setActiveTab("breakdown")}>
          Breakdown
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <TreasuryAnalyticsSkeleton />
        ) : isError ? (
          <div className="text-sm text-red-500 bg-red-50 rounded-lg p-4">Could not load analytics</div>
        ) : !analytics || analytics.txCount === 0 ? (
          <div className="text-center py-8">
            <BarChart3 size={32} className="text-gray-300 mx-auto" />
            <p className="text-sm text-gray-400 mt-3">No transaction activity in the last 30 days</p>
          </div>
        ) : activeTab === "chart" ? (
          <TreasuryActivityChart data={analytics.dailyVolume} />
        ) : (
          <TreasuryBreakdown
            breakdown={analytics.breakdown}
            total={analytics.totalIncomeUsd + analytics.totalExpenseUsd}
          />
        )}
      </div>
    </div>
  );
}
