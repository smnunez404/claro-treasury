import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { AuditFiltersState } from "@/types/claro";

interface Props {
  filters: AuditFiltersState;
  onChange: (f: AuditFiltersState) => void;
}

const ACTION_OPTIONS = [
  { value: "exclude_sync", label: "All meaningful actions" },
  { value: "", label: "All actions (including syncs)" },
  { value: "grant_deposit", label: "Donation Received" },
  { value: "grant_certified", label: "Impact Certified" },
  { value: "payroll_executed", label: "Payroll Payment" },
  { value: "grant_created", label: "Grant Created" },
  { value: "grant_disbursed", label: "Funds Disbursed" },
  { value: "org_verified", label: "Org Verified" },
  { value: "org_synced_from_blockchain", label: "Org Synced" },
  { value: "report_generated", label: "Report Generated" },
];

export default function AuditFilters({ filters, onChange }: Props) {
  const [orgInput, setOrgInput] = useState(filters.orgContract);
  const hasFilters = filters.orgContract || filters.actionType !== "exclude_sync" || filters.dateFrom || filters.dateTo;

  // Debounce org input — wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orgInput !== filters.orgContract) {
        onChange({ ...filters, orgContract: orgInput });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [orgInput]);

  // Sync external resets (e.g. "Clear" button)
  useEffect(() => {
    if (filters.orgContract !== orgInput && filters.orgContract === "") {
      setOrgInput("");
    }
  }, [filters.orgContract]);

  const update = (patch: Partial<AuditFiltersState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Organization</label>
          <input
            type="text"
            placeholder="Filter by name or contract address..."
            value={orgInput}
            onChange={(e) => setOrgInput(e.target.value)}
            className="w-64 text-sm border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Action</label>
          <select
            value={filters.actionType}
            onChange={(e) => update({ actionType: e.target.value })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="text-sm border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setOrgInput("");
              onChange({ orgContract: "", actionType: "exclude_sync", dateFrom: "", dateTo: "" });
            }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 pb-2"
          >
            <X style={{ width: 12, height: 12 }} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
