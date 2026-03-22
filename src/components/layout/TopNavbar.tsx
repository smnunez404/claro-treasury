import { Link } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/contexts/AuthContext";
import { truncateAddress } from "@/lib/constants";
import { Shield } from "lucide-react";

export default function TopNavbar() {
  const { login } = usePrivy();
  const { address, role, disconnect } = useAuth();
  const connected = role === "donor";

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 sticky top-0 z-10">
      <Link to="/explore" className="flex items-center gap-2">
        <Shield className="text-primary" strokeWidth={1.5} />
        <span className="text-foreground font-semibold text-base">CLARO Protocol</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Explore
        </Link>

        {!connected && (
          <>
            <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Register Organization
            </Link>
            <button
              onClick={login}
              className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          </>
        )}

        {connected && address && (
          <>
            <span className="text-muted-foreground text-sm font-mono bg-muted px-2 py-1 rounded">
              {truncateAddress(address)}
            </span>
            <button
              onClick={disconnect}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </header>
  );
}
