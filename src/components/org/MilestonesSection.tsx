import { useMemo } from "react";
import { CheckCircle2, Clock, AlertCircle, Circle, Calendar, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project, Milestone } from "@/types/claro";

interface Props {
  projects: Project[];
  isLoading: boolean;
}

const statusIcons: Record<string, { Icon: typeof Circle; color: string }> = {
  completed: { Icon: CheckCircle2, color: "text-[#057A55]" },
  in_progress: { Icon: Clock, color: "text-[#1A56DB]" },
  delayed: { Icon: AlertCircle, color: "text-[#E3A008]" },
  pending: { Icon: Circle, color: "text-gray-300" },
};

export default function MilestonesSection({ projects, isLoading: projectsLoading }: Props) {
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["org-milestones", projectIds.join(",")],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const { data, error } = await supabase
        .from("claro_milestones")
        .select("id, project_id, title, description, status, target_date, completed_date, evidence_url, evidence_type")
        .in("project_id", projectIds)
        .eq("is_public", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Milestone[];
    },
    enabled: projectIds.length > 0,
  });

  const loading = projectsLoading || isLoading;

  if (!loading && (!milestones || milestones.length === 0)) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>

      {loading ? (
        <div className="space-y-2">
          {[0, 1].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {milestones!.map(ms => {
            const si = statusIcons[ms.status] ?? statusIcons.pending;
            return (
              <div key={ms.id} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <si.Icon className={si.color} style={{ width: 16, height: 16, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{ms.title}</p>
                  {ms.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ms.description}</p>}
                  <div className="flex gap-3 mt-1">
                    {ms.target_date && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar style={{ width: 10, height: 10 }} />
                        {new Date(ms.target_date).toLocaleDateString()}
                      </span>
                    )}
                    {ms.evidence_url && (
                      <a href={ms.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline">
                        Evidence <ExternalLink style={{ width: 10, height: 10 }} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
