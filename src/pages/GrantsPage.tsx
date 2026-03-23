import { useState, useMemo } from "react";
import { Plus, Gift } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTreasury } from "@/hooks/useTreasury";
import { useGrants } from "@/hooks/useGrants";
import { SNOWTRACE_URL } from "@/lib/constants";
import type { GrantFull, GrantOnChain } from "@/types/claro";

import GrantsSkeleton from "@/components/grants/GrantsSkeleton";
import GrantCard from "@/components/grants/GrantCard";
import CreateGrantSheet from "@/components/grants/CreateGrantSheet";
import DisburseModal from "@/components/grants/DisburseModal";
import QFRoundCard from "@/components/grants/QFRoundCard";
import AIReportPanel from "@/components/grants/AIReportPanel";
import HypercertPanel from "@/components/grants/HypercertPanel";

export default function GrantsPage() {
  const { orgContractAddress } = useAuth();
  const queryClient = useQueryClient();
  const { treasuryData } = useTreasury();

  const {
    grants, projects, qfRound, reports,
    isGrantsLoading, isQfLoading,
    createGrant, disburseGrant,
    createStep, createError,
    disburseStep, disburseError, disburseTxHash,
    reset, refetchGrants, refetchReports,
  } = useGrants();

  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [disburseTarget, setDisburseTarget] = useState<GrantOnChain | null>(null);

  const mergedGrants: GrantFull[] = useMemo(() => {
    const projectMap = new Map(projects.map((p) => [p.onchain_project_id, p]));
    return grants.map((g) => ({
      ...g,
      projectName: projectMap.get(g.projectId)?.name ?? g.name,
      supabaseProjectId: projectMap.get(g.projectId)?.id ?? null,
    }));
  }, [grants, projects]);

  if (isGrantsLoading) return <GrantsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Grants</h1>
          <p className="text-sm text-gray-500 mt-1">Transparent funding for your projects</p>
        </div>
        <button
          onClick={() => setCreateSheetOpen(true)}
          className="bg-[#1A56DB] text-white text-sm px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.97] w-full sm:w-auto"
        >
          <Plus style={{ width: 14, height: 14 }} />
          Create Grant
        </button>
      </div>

      {/* Grants List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold text-gray-900">Active Grants</p>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {mergedGrants.length} grant{mergedGrants.length !== 1 ? "s" : ""}
          </span>
        </div>

        {mergedGrants.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Gift className="text-gray-300 mx-auto" style={{ width: 40, height: 40 }} />
            <p className="text-sm font-semibold text-gray-900 mt-4">No grants created yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Create a grant to start receiving targeted donations for your projects.
            </p>
            <button
              onClick={() => setCreateSheetOpen(true)}
              className="bg-[#1A56DB] text-white mt-4 text-sm px-4 py-2 rounded-md hover:opacity-90 active:scale-[0.97]"
            >
              Create Grant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mergedGrants.map((g) => (
              <GrantCard
                key={g.projectId}
                grant={g}
                onDisburse={() => setDisburseTarget(g)}
                snowtraceUrl={SNOWTRACE_URL}
                orgContractAddress={orgContractAddress!}
              />
            ))}
          </div>
        )}
      </section>

      {/* QF Round */}
      <QFRoundCard qfRound={qfRound} isLoading={isQfLoading} orgGrants={mergedGrants} />

      {/* AI Reports */}
      <AIReportPanel
        reports={reports}
        orgContract={orgContractAddress!}
        onReportGenerated={refetchReports}
      />

      {/* Hypercerts */}
      <HypercertPanel grants={mergedGrants} orgContract={orgContractAddress!} />
    </div>

      <CreateGrantSheet
        isOpen={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        projects={projects}
        createGrant={createGrant}
        createStep={createStep}
        createError={createError}
        reset={reset}
        onSuccess={() => { setCreateSheetOpen(false); reset(); refetchGrants(); }}
      />

      <DisburseModal
        grant={disburseTarget as GrantFull | null}
        isOpen={disburseTarget !== null}
        onClose={() => { setDisburseTarget(null); reset(); }}
        disburseGrant={disburseGrant}
        disburseStep={disburseStep}
        disburseError={disburseError}
        disburseTxHash={disburseTxHash}
        reset={reset}
        treasuryBalanceAvax={treasuryData?.balanceAvax ?? 0}
        onSuccess={() => {
          setDisburseTarget(null);
          reset();
          refetchGrants();
          queryClient.invalidateQueries({ queryKey: ["dashboard-activity", orgContractAddress] });
        }}
      />
    </div>
  );
}
