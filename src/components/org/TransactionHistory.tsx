import { ArrowLeftRight, AlertCircle, ExternalLink } from "lucide-react";
import { SNOWTRACE_URL } from "@/lib/constants";
import TransactionRow from "./TransactionRow";
import type { Transaction } from "@/types/claro";

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  orgContract: string;
}

export default function TransactionHistory({ transactions, isLoading, isError, onRetry, orgContract }: Props) {
  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        <a
          href={`${SNOWTRACE_URL}/address/${orgContract}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline"
        >
          View all on Snowtrace <ExternalLink style={{ width: 10, height: 10 }} />
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-12 animate-pulse bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto" style={{ width: 24, height: 24 }} />
          <p className="text-sm text-gray-700 mt-2">Could not load transactions.</p>
          <button onClick={onRetry} className="mt-4 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-xs font-medium active:scale-[0.97] transition-all">
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <ArrowLeftRight className="text-gray-300" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-semibold text-gray-900 mt-4">No transactions yet</p>
          <p className="text-sm text-gray-500">Transactions will appear once this organization starts using their treasury.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {transactions.map(tx => (
              <TransactionRow key={tx.id} tx={tx} snowtraceUrl={SNOWTRACE_URL} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Showing last 20 transactions · All transactions are publicly verifiable on Avalanche
          </p>
        </>
      )}
    </div>
  );
}
