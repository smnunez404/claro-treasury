import { useState } from "react";
import { useTreasury } from "@/hooks/useTreasury";
import { useAuth } from "@/contexts/AuthContext";
import { SNOWTRACE_URL } from "@/lib/constants";
import TreasuryKPIs from "@/components/dashboard/TreasuryKPIs";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import EmployeesList from "@/components/dashboard/EmployeesList";
import GrantsList from "@/components/dashboard/GrantsList";
import DashboardQFCard from "@/components/dashboard/DashboardQFCard";
import OnramperModal from "@/components/dashboard/OnramperModal";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import TreasuryAnalytics from "@/components/dashboard/TreasuryAnalytics";

export default function DashboardPage() {
  const { orgContractAddress, address } = useAuth();
  const {
    treasuryData, employees, grants, qfRound, recentActivity, financials,
    isTreasuryLoading, isEmployeesLoading, isGrantsLoading,
    isActivityLoading, isActivityError, isTreasuryError, refetchTreasury,
  } = useTreasury();

  const [onramperOpen, setOnramperOpen] = useState(false);
  const [onramperMode, setOnramperMode] = useState<"buy" | "sell">("buy");

  if (isTreasuryLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Treasury overview for your organization</p>
        </div>
        <QuickActions
          onBuy={() => { setOnramperMode("buy"); setOnramperOpen(true); }}
          onWithdraw={() => { setOnramperMode("sell"); setOnramperOpen(true); }}
          balanceUsd={treasuryData?.balanceUsd ?? "$0.00"}
        />
      </div>

      {/* Content */}
      <TreasuryKPIs
        treasuryData={treasuryData}
        financials={financials}
        isLoading={isTreasuryLoading}
        isError={isTreasuryError}
        onRetry={() => refetchTreasury()}
      />

      {qfRound?.isActive && <DashboardQFCard qfRound={qfRound} />}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity
            transactions={recentActivity}
            isLoading={isActivityLoading}
            isError={isActivityError}
            onRetry={() => {}}
            snowtraceUrl={SNOWTRACE_URL}
          />
          <GrantsList grants={grants} isLoading={isGrantsLoading} />
        </div>
        <div>
          <EmployeesList employees={employees} isLoading={isEmployeesLoading} />
        </div>
      </div>

      <OnramperModal
        isOpen={onramperOpen}
        onClose={() => setOnramperOpen(false)}
        mode={onramperMode}
        walletAddress={address ?? ""}
      />
    </div>
  );
}
