import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { truncateAddress, SNOWTRACE_URL } from "@/lib/constants";
import claroLogoLight from "/claro-logo-light.png";
import {
  LayoutDashboard,
  Building,
  Users,
  Gift,
  Compass,
  Building2,
  MapPin,
  LogOut,
} from "lucide-react";

const orgOwnerItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Organization", url: "/organization", icon: Building },
  { title: "Payroll", url: "/payroll", icon: Users },
  { title: "Grants", url: "/grants", icon: Gift },
  { title: "Explore", url: "/explore", icon: Compass },
];

const adminItems = [
  { title: "Organizations", url: "/admin", icon: Building2 },
  { title: "Explore", url: "/explore", icon: Compass },
];

export default function Sidebar() {
  const { address, role, orgContractAddress, disconnect } = useAuth();
  const location = useLocation();
  const items = role === "protocol_admin" ? adminItems : orgOwnerItems;

  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ["sidebar-org", orgContractAddress],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_organizations")
        .select("name, country, verified, logo_url")
        .eq("contract_address", orgContractAddress?.toLowerCase() ?? "")
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: role === "org_owner" && !!orgContractAddress,
  });

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col h-screen fixed left-0 top-0 z-20" style={{ backgroundColor: "#0A0E1A" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800 flex items-center gap-2">
        <img src={claroLogoLight} alt="CLARO Protocol" className="h-7 w-7 object-contain" />
        <span className="text-white font-bold text-lg">CLARO</span>
        <span className="text-gray-400 text-xs">Protocol</span>
      </div>

      {/* Org info */}
      {role === "org_owner" && (
        <div className="px-4 py-3 border-b border-gray-800">
          {orgLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse h-3 bg-gray-700 rounded w-3/4" />
              <div className="animate-pulse h-2 bg-gray-700 rounded w-1/2" />
            </div>
          ) : orgData ? (
            <div>
              <p className="text-white text-sm font-semibold truncate">{orgData.name}</p>
              <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                <MapPin style={{ width: 12, height: 12 }} />
                {orgData.country}
              </p>
              <div className="mt-1">
                {orgData.verified ? (
                  <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full">Verified</span>
                ) : (
                  <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">Pending</span>
                )}
              </div>
            </div>
          ) : orgContractAddress ? (
            <p className="text-gray-500 text-xs font-mono">{truncateAddress(orgContractAddress)}</p>
          ) : null}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {items.map((item) => {
          const active = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <item.icon strokeWidth={1.5} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-gray-800 p-4">
        {address && (
          <p className="text-gray-400 text-xs font-mono mb-2">{truncateAddress(address)}</p>
        )}
        <button
          onClick={disconnect}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors"
        >
          <LogOut strokeWidth={1.5} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
