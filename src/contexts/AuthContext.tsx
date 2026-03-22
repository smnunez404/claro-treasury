import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { detectRole } from "@/hooks/useOrganization";
import type { UserRole } from "@/types/claro";

interface AuthContextType {
  address: string | null;
  role: UserRole;
  orgContractAddress: string | null;
  isLoading: boolean;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  address: null,
  role: "visitor",
  orgContractAddress: null,
  isLoading: false,
  disconnect: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();

  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("visitor");
  const [orgContractAddress, setOrgContractAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveRole = useCallback(async (walletAddr: string) => {
    setIsLoading(true);
    try {
      const result = await detectRole(walletAddr);
      setRole(result.role);
      setOrgContractAddress(result.orgContractAddress);
    } catch {
      setRole("visitor");
      setOrgContractAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated || wallets.length === 0) {
      setAddress(null);
      setRole("visitor");
      setOrgContractAddress(null);
      setIsLoading(false);
      return;
    }

    const wallet = wallets[0];
    const addr = wallet.address.toLowerCase();

    if (addr !== address) {
      setAddress(addr);
      resolveRole(addr);
    }
  }, [ready, authenticated, wallets, address, resolveRole]);

  const disconnect = useCallback(async () => {
    await logout();
    setAddress(null);
    setRole("visitor");
    setOrgContractAddress(null);
    setIsLoading(false);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ address, role, orgContractAddress, isLoading, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}
