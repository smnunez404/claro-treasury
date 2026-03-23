import { useState } from "react";
import { UserPlus, Receipt } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTreasury } from "@/hooks/useTreasury";
import { supabase } from "@/integrations/supabase/client";
import { SNOWTRACE_URL } from "@/lib/constants";
import TreasuryBalanceBar from "@/components/payroll/TreasuryBalanceBar";
import EmployeeTable from "@/components/payroll/EmployeeTable";
import AddEmployeeSheet from "@/components/payroll/AddEmployeeSheet";
import PayEmployeeModal from "@/components/payroll/PayEmployeeModal";
import PayrollSkeleton from "@/components/payroll/PayrollSkeleton";
import TransactionRow from "@/components/org/TransactionRow";
import type { EmployeeOnChain, Transaction } from "@/types/claro";

export default function PayrollPage() {
  const { orgContractAddress } = useAuth();
  const queryClient = useQueryClient();
  const { treasuryData, employees, isTreasuryLoading, refetchTreasury } = useTreasury();

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [payModalEmployee, setPayModalEmployee] = useState<EmployeeOnChain | null>(null);

  const {
    data: payrollHistory,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["payroll-history", orgContractAddress],
    enabled: !!orgContractAddress,
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("claro_transactions")
        .select(
          "id, tx_hash, tx_type, to_address, amount_avax, amount_usd, block_timestamp, employee_name, from_address, onchain_project_id, network"
        )
        .eq("org_contract", orgContractAddress!)
        .eq("tx_type", "payroll")
        .order("block_timestamp", { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
  });

  if (isTreasuryLoading) return <PayrollSkeleton />;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
          <p className="text-sm text-muted-foreground mt-1">On-chain salary management</p>
        </div>
        <button
          onClick={() => setAddSheetOpen(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground text-sm px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.97]"
        >
          <UserPlus style={{ width: 14, height: 14 }} />
          Add Employee
        </button>
      </div>

      <div className="space-y-6 mt-4">
        <TreasuryBalanceBar
          balanceUsd={treasuryData?.balanceUsd ?? "$0.00"}
          balanceAvax={treasuryData?.balanceAvax ?? 0}
          employeeCount={employees?.length ?? 0}
        />

        <EmployeeTable
          employees={employees ?? []}
          isLoading={isTreasuryLoading}
          onPayEmployee={(emp) => setPayModalEmployee(emp)}
          snowtraceUrl={SNOWTRACE_URL}
        />

        {/* Payment History */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Payment History</h2>

          {isHistoryLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-white border border-border/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : isHistoryError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-700">Failed to load payment history.</p>
              <button
                onClick={() => refetchHistory()}
                className="text-sm text-[hsl(224,76%,48%)] mt-2 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : !payrollHistory || payrollHistory.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center">
              <Receipt className="text-muted-foreground/30 mx-auto" style={{ width: 32, height: 32 }} />
              <p className="text-sm text-muted-foreground mt-2">No payments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Payments appear here after executing payroll.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payrollHistory.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} snowtraceUrl={SNOWTRACE_URL} />
              ))}
              <p className="text-xs text-muted-foreground text-center py-3">
                Showing last 15 payments · All verifiable on Avalanche
              </p>
            </div>
          )}
        </div>
      </div>

      <AddEmployeeSheet
        isOpen={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSuccess={() => {
          setAddSheetOpen(false);
          refetchTreasury();
        }}
      />

      <PayEmployeeModal
        employee={payModalEmployee}
        isOpen={payModalEmployee !== null}
        onClose={() => setPayModalEmployee(null)}
        treasuryBalanceAvax={treasuryData?.balanceAvax ?? 0}
        onSuccess={() => {
          setPayModalEmployee(null);
          refetchTreasury();
          queryClient.invalidateQueries({ queryKey: ["payroll-history", orgContractAddress] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-activity", orgContractAddress] });
        }}
      />
    </div>
  );
}
