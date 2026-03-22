import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { truncateAddress, SNOWTRACE_URL } from "@/lib/constants";
import { Building2, AlertCircle, ExternalLink } from "lucide-react";

interface AdminOrg {
  contract_address: string;
  name: string;
  country: string;
  verified: boolean;
  owner_address: string;
  created_at: string | null;
}

export default function AdminPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_organizations")
        .select("contract_address, name, country, verified, owner_address, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdminOrg[];
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
      <p className="text-sm text-muted-foreground">All organizations registered in CLARO Protocol</p>

      {isLoading && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="animate-pulse h-4 rounded bg-muted flex-1" />
              ))}
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3 mt-6">
          <AlertCircle className="text-destructive" style={{ width: 20, height: 20 }} />
          <span className="text-sm">Could not load organizations.</span>
          <button onClick={() => refetch()} className="ml-auto text-sm font-medium text-primary hover:underline">
            Retry
          </button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Building2 className="text-gray-300" style={{ width: 48, height: 48 }} />
          <p className="text-sm font-semibold text-foreground mt-4">No organizations registered yet on-chain.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full">
            <thead>
              <tr className="bg-muted border-b border-border">
                {["Organization", "Contract", "Owner", "Status", "Registered"].map((h) => (
                  <th key={h} className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((org) => (
                <tr key={org.contract_address} className="border-b border-muted hover:bg-muted/50 text-sm">
                  <td className="px-6 py-3">
                    <p className="font-medium text-foreground">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.country}</p>
                  </td>
                  <td className="px-6 py-3">
                    <a
                      href={`${SNOWTRACE_URL}/address/${org.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      {truncateAddress(org.contract_address)}
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {truncateAddress(org.owner_address)}
                  </td>
                  <td className="px-6 py-3">
                    {org.verified ? (
                      <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">Verified</span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
