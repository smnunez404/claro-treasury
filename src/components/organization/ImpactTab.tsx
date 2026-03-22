import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, Clock, AlertCircle, Circle, ExternalLink, BarChart3, Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import MilestoneForm from "./MilestoneForm";
import MetricForm from "./MetricForm";
import type { Project, Milestone, ImpactMetric } from "@/types/claro";

const msStatusColors: Record<string, string> = {
  completed: "bg-green-50 text-green-700 border-green-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  delayed: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-gray-100 text-gray-500 border-gray-200",
};

const msStatusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-[#057A55]" />,
  in_progress: <Clock className="w-4 h-4 text-[#1A56DB]" />,
  delayed: <AlertCircle className="w-4 h-4 text-[#E3A008]" />,
  pending: <Circle className="w-4 h-4 text-gray-300" />,
};

interface Props {
  projects: Project[];
  milestones: Milestone[];
  metrics: ImpactMetric[];
  isLoading: boolean;
  orgContractAddress: string;
}

export default function ImpactTab({ projects, milestones, metrics, isLoading, orgContractAddress }: Props) {
  const [milestoneSheetOpen, setMilestoneSheetOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [metricSheetOpen, setMetricSheetOpen] = useState(false);
  const [deleteMs, setDeleteMs] = useState<Milestone | null>(null);
  const [deleteMetric, setDeleteMetricTarget] = useState<ImpactMetric | null>(null);
  const { mutate } = useOrgWrite();

  // Group milestones by project
  const grouped = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    const key = m.project_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? "Unknown Project";

  return (
    <div className="mt-4">
      {/* MILESTONES */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Milestones</h3>
          <button
            onClick={() => { setEditingMilestone(null); setMilestoneSheetOpen(true); }}
            className="border border-gray-200 text-sm px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 active:scale-[0.97] transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Milestone
          </button>
        </div>

        {projects.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700 ml-2">Create a project first in the Projects tab before adding milestones.</p>
          </div>
        )}

        {projects.length > 0 && milestones.length === 0 && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <CheckCircle2 className="mx-auto text-gray-300" style={{ width: 36, height: 36 }} strokeWidth={1.5} />
            <p className="text-sm font-semibold text-gray-900 mt-3">No milestones yet</p>
            <p className="text-sm text-gray-500 mt-1">Track your project progress and add evidence links.</p>
          </div>
        )}

        {Object.entries(grouped).map(([pid, ms]) => (
          <div key={pid}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{projectName(pid)}</p>
            <div className="space-y-2">
              {ms.map(m => (
                <div key={m.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
                  {msStatusIcons[m.status] ?? msStatusIcons.pending}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${msStatusColors[m.status] ?? msStatusColors.pending}`}>
                        {m.status.replace("_", " ")}
                      </span>
                      {m.evidence_url && (
                        <a href={m.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline">
                          <ExternalLink className="w-2.5 h-2.5" /> Evidence
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditingMilestone(m); setMilestoneSheetOpen(true); }} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                      <Pencil className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteMs(m)} className="p-1.5 rounded hover:bg-gray-100" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-200 my-6" />

      {/* IMPACT METRICS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Impact Metrics</h3>
          <button
            onClick={() => setMetricSheetOpen(true)}
            className="border border-gray-200 text-sm px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 active:scale-[0.97] transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Metric
          </button>
        </div>

        {metrics.length === 0 && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <BarChart3 className="mx-auto text-gray-300" style={{ width: 36, height: 36 }} strokeWidth={1.5} />
            <p className="text-sm font-semibold text-gray-900 mt-3">No impact metrics yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Record measurable outcomes — people helped, animals rescued, students trained.</p>
          </div>
        )}

        {metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.metric_name}</p>
                  {m.metric_unit && <p className="text-xs text-gray-400">{m.metric_unit}</p>}
                  {(m.period_start || m.period_end) && (
                    <p className="text-xs text-gray-400">{m.period_start} → {m.period_end}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-[#1A56DB]">{m.metric_value.toLocaleString()}</p>
                  {m.verified && (
                    <span className="flex items-center gap-1 text-xs text-[#057A55] justify-end mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <button onClick={() => setDeleteMetricTarget(m)} className="p-1 rounded hover:bg-gray-100 mt-1" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete milestone dialog */}
      <AlertDialog open={!!deleteMs} onOpenChange={open => { if (!open) setDeleteMs(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete milestone?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteMs?.title}" will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={async () => {
              if (deleteMs) {
                await mutate("delete_milestone", { id: deleteMs.id }, [["my-milestones", orgContractAddress], ["org-score", orgContractAddress]]);
                setDeleteMs(null);
              }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete metric dialog */}
      <AlertDialog open={!!deleteMetric} onOpenChange={open => { if (!open) setDeleteMetricTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete metric?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteMetric?.metric_name}" will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={async () => {
              if (deleteMetric) {
                await mutate("delete_metric", { id: deleteMetric.id }, [["my-metrics", orgContractAddress], ["org-score", orgContractAddress]]);
                setDeleteMetricTarget(null);
              }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MilestoneForm
        isOpen={milestoneSheetOpen}
        onClose={() => { setMilestoneSheetOpen(false); setEditingMilestone(null); }}
        milestone={editingMilestone}
        projects={projects}
        orgContractAddress={orgContractAddress}
      />
      <MetricForm
        isOpen={metricSheetOpen}
        onClose={() => setMetricSheetOpen(false)}
        projects={projects}
        orgContractAddress={orgContractAddress}
      />
    </div>
  );
}
