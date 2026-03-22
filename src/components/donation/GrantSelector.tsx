import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ActiveGrant } from "@/types/claro";

interface Props {
  orgContract: string;
  selectedProjectId: string | null;
  onChange: (projectId: string | null, projectName: string) => void;
  disabled?: boolean;
}

export default function GrantSelector({ orgContract, selectedProjectId, onChange, disabled }: Props) {
  const { data: grants, isLoading } = useQuery({
    queryKey: ["donation-grants", orgContract],
    queryFn: async (): Promise<ActiveGrant[]> => {
      const { data, error } = await supabase
        .from("claro_projects")
        .select("onchain_project_id, name, status")
        .eq("org_contract", orgContract.toLowerCase())
        .eq("is_active", true)
        .eq("status", "active")
        .not("onchain_project_id", "is", null);
      if (error) throw error;
      return (data ?? [])
        .filter((p): p is { onchain_project_id: string; name: string; status: string } => !!p.onchain_project_id)
        .map((p) => ({ projectId: p.onchain_project_id, name: p.name }));
    },
  });

  if (isLoading) {
    return <div className="h-10 animate-pulse bg-muted rounded-md" />;
  }

  if (!grants || grants.length === 0) return null;

  const options = [
    { id: null, name: "General Treasury", sub: "Supports the organization overall" },
    ...grants.map((g) => ({ id: g.projectId, name: g.name, sub: "Project grant" })),
  ];

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Destination</label>
      <div className="space-y-2 mt-1">
        {options.map((opt) => {
          const isSelected = opt.id === selectedProjectId;
          return (
            <button
              key={opt.id ?? "general"}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id, opt.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30 hover:bg-accent"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                }`}
              >
                {isSelected && <div className="w-full h-full rounded-full bg-primary ring-2 ring-background ring-inset" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{opt.name}</p>
                <p className="text-xs text-muted-foreground">{opt.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
