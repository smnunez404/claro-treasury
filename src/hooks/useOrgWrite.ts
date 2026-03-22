import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

type OrgWriteAction =
  | "create_project" | "update_project" | "delete_project"
  | "create_milestone" | "update_milestone" | "delete_milestone"
  | "create_metric" | "delete_metric"
  | "create_team_member" | "update_team_member" | "delete_team_member";

export function useOrgWrite() {
  const { orgContractAddress, address } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    action: OrgWriteAction,
    payload: Record<string, unknown>,
    invalidateKeys?: string[][]
  ): Promise<{ success: boolean; data?: unknown }> => {
    if (!orgContractAddress || !address) {
      setError("No organization or wallet connected");
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/org-write`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action,
            org_contract: orgContractAddress.toLowerCase(),
            wallet_address: address.toLowerCase(),
            payload,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Operation failed");
        return { success: false };
      }

      if (invalidateKeys) {
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      return { success: true, data: result.data };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { mutate, isLoading, error, clearError };
}
