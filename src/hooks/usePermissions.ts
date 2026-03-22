import { useAuth } from "@/contexts/AuthContext";

export const usePermissions = () => {
  const { role } = useAuth();
  return {
    canViewDashboard:    role === "org_owner",
    canViewOrganization: role === "org_owner",
    canViewPayroll:      role === "org_owner",
    canViewGrants:       role === "org_owner",
    canViewAdmin:        role === "protocol_admin",
    canDonate:           role === "donor" || role === "org_owner",
    isProtocolAdmin:     role === "protocol_admin",
    isOrgOwner:          role === "org_owner",
    isDonor:             role === "donor",
    isVisitor:           role === "visitor",
  };
};
