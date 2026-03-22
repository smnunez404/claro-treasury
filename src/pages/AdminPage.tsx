import { useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import AdminStatsBar from "@/components/admin/AdminStatsBar";
import OrgAdminTable from "@/components/admin/OrgAdminTable";
import VerifyOrgModal from "@/components/admin/VerifyOrgModal";
import AdminSkeleton from "@/components/admin/AdminSkeleton";
import type { AdminOrgRow } from "@/types/claro";

export default function AdminPage() {
  const {
    orgs,
    globalStats,
    isOrgsLoading,
    isStatsLoading,
    verifyStep,
    verifyError,
    verifyingAddress,
    verifyOrganization,
    resetVerify,
    isSyncing,
    syncOrganizations,
  } = useAdmin();

  const [verifyTarget, setVerifyTarget] = useState<AdminOrgRow | null>(null);

  if (isOrgsLoading) return <AdminSkeleton />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 md:px-8 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">CLARO Protocol Admin</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncOrganizations}
            disabled={isSyncing}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm flex items-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Blockchain"}
          </button>

          <div className="bg-[#0A0E1A] text-white text-xs px-3 py-2 rounded-md flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#1A56DB]" />
            Protocol Admin
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8 md:px-8 space-y-6 mt-4">
        <AdminStatsBar stats={globalStats} isLoading={isStatsLoading} />

        <OrgAdminTable
          orgs={orgs ?? []}
          isLoading={isOrgsLoading}
          verifyingAddress={verifyingAddress}
          onVerify={(org) => setVerifyTarget(org)}
        />
      </div>

      <VerifyOrgModal
        org={verifyTarget}
        isOpen={verifyTarget !== null}
        onClose={() => {
          setVerifyTarget(null);
          resetVerify();
        }}
        verifyStep={verifyStep}
        verifyError={verifyError}
        onConfirm={() => verifyOrganization(verifyTarget!.contract_address)}
        onSuccess={() => {
          setVerifyTarget(null);
          resetVerify();
        }}
      />
    </div>
  );
}
