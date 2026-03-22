import { Activity, AlertCircle } from "lucide-react";
import TransactionRow from "@/components/org/TransactionRow";
import type { Transaction } from "@/types/claro";

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  snowtraceUrl: string;
}

export default function RecentActivity({ transactions, isLoading, isError, onRetry, snowtraceUrl }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-destructive shrink-0" style={{ width: 20, height: 20 }} />
          <p className="text-sm text-foreground flex-1">Could not load transactions.</p>
          <button onClick={onRetry} className="text-sm font-medium text-primary hover:underline">Retry</button>
        </div>
      )}

      {!isLoading && !isError && transactions.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <Activity className="text-muted-foreground/40" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-medium text-foreground mt-3">No transactions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Transactions will appear after your first deposit or payroll.</p>
        </div>
      )}

      {!isLoading && !isError && transactions.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden space-y-1 p-1">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} snowtraceUrl={snowtraceUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
