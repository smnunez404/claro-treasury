import { AlertCircle, ShieldCheck } from "lucide-react";
import AuditLogRow from "./AuditLogRow";
import type { AuditEntry } from "@/types/claro";

interface Props {
  entries: AuditEntry[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page: number;
  onPageChange: (p: number) => void;
  snowtraceUrl: string;
}

export default function AuditLogTable({
  entries, total, isLoading, isError, onRetry,
  page, onPageChange, snowtraceUrl,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-white border border-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle style={{ width: 16, height: 16 }} className="text-red-500" />
        <span className="text-sm text-red-700">Could not load audit log.</span>
        <button onClick={onRetry} className="text-sm text-red-700 underline ml-2">Retry</button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <ShieldCheck style={{ width: 40, height: 40 }} className="text-gray-300 mx-auto" />
        <p className="text-sm font-semibold text-gray-900 mt-4">No audit entries yet</p>
        <p className="text-sm text-gray-500 mt-2">Actions will appear here as organizations use CLARO Protocol.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-semibold text-gray-900">Audit Log</span>
        <span className="text-sm text-gray-500">{total.toLocaleString()} entries</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Action</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Organization</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left hidden md:table-cell">Amount</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left hidden md:table-cell">Actor</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Time</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Verify</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <AuditLogRow key={entry.id} entry={entry} snowtraceUrl={snowtraceUrl} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-col sm:flex-row gap-2">
          <span className="text-sm text-gray-500">
            Showing {page * 50 + 1}–{Math.min((page + 1) * 50, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {page + 1}</span>
            <button
              disabled={(page + 1) * 50 >= total}
              onClick={() => onPageChange(page + 1)}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
