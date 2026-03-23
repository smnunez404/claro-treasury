import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/contexts/AuthContext";
import { truncateAddress } from "@/lib/constants";
import claroLogoDark from "/claro-logo-dark.png";

export default function TopNavbar() {
  const { login } = usePrivy();
  const { address, role, disconnect } = useAuth();
  const connected = role === "donor";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16">
        <Link to="/explore" className="flex items-center gap-2 shrink-0">
          <img src={claroLogoDark} alt="CLARO Protocol" className="h-6 w-6 sm:h-7 sm:w-7 object-contain" />
          <span className="text-foreground font-semibold text-sm sm:text-base">CLARO</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
          <Link to="/explore" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            Explore
          </Link>
          <Link to="/audit" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ShieldCheck style={{ width: 12, height: 12 }} />
            <span className="hidden sm:inline">Audit Log</span>
            <span className="sm:hidden">Audit</span>
          </Link>

          {!connected && (
            <>
              <Link to="/register" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
                Register Organization
              </Link>
              <button
                onClick={login}
                className="bg-primary text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                Connect
              </button>
            </>
          )}

          {connected && address && (
            <>
              <span className="text-muted-foreground text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-[100px] sm:max-w-none">
                {truncateAddress(address)}
              </span>
              <button
                onClick={disconnect}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors active:scale-[0.97]"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
