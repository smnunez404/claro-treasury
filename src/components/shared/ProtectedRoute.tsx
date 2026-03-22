import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/claro";
import PageLoader from "@/components/layout/PageLoader";
import UnauthorizedPage from "@/components/shared/UnauthorizedPage";

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (role !== requiredRole) return <UnauthorizedPage />;

  return <>{children}</>;
}
