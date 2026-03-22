import { useState, useMemo } from "react";
import { Building2 } from "lucide-react";
import OrgAdminRow from "./OrgAdminRow";
import type { AdminOrgRow } from "@/types/claro";

interface Props {
  orgs: AdminOrgRow[];
  isLoading: boolean;
  verifyingAddress: string | null;
  onVerify: (org: AdminOrgRow) => void;
}

type FilterTab = "all" | "pending" | "verified";

export default function OrgAdminTable({ orgs, isLoading, verifyingAddress, onVerify }: Props) {
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const filteredOrgs = useMemo(() => {
    if (filterTab === "pending") return orgs.filter((o) => !o.verified);
    if (filterTab === "verified") return orgs.filter((o) => o.verified);
    return orgs;
  }, [orgs, filterTab]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "verified", label: "Verified" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-white border border-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Registered Organizations</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                filterTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700 cursor-pointer"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrgs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Building2 className="text-gray-300 mx-auto" style={{ width: 40, height: 40 }} />
          <p className="text-sm font-semibold text-gray-900 mt-4">No organizations registered yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Organizations will appear here after registering via /register
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                    Organization
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left hidden md:table-cell">
                    Contract
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left hidden md:table-cell">
                    Owner
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left hidden md:table-cell">
                    Score
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                    Status
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left hidden md:table-cell">
                    Registered
                  </th>
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <OrgAdminRow
                    key={org.contract_address}
                    org={org}
                    isVerifying={verifyingAddress === org.contract_address}
                    onVerify={() => onVerify(org)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
