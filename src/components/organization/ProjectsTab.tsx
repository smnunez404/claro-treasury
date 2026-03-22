import { useState } from "react";
import { Plus, Pencil, Trash2, Folder, Link } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import { formatUsd } from "@/lib/constants";
import ProjectForm from "./ProjectForm";
import type { Project } from "@/types/claro";

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  on_hold: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

interface Props {
  projects: Project[];
  isLoading: boolean;
  orgContractAddress: string;
}

export default function ProjectsTab({ projects, isLoading, orgContractAddress }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const { mutate } = useOrgWrite();

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Projects</h3>
        <button
          onClick={() => { setEditing(null); setSheetOpen(true); }}
          className="bg-[#1A56DB] text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#1648c0] active:scale-[0.97] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Project
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map(i => <div key={i} className="h-20 animate-pulse bg-white border border-gray-200 rounded-xl" />)}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Folder className="mx-auto text-gray-300" style={{ width: 40, height: 40 }} strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-900 mt-4">No projects yet</p>
          <p className="text-sm text-gray-500 mt-2">Add your first project to start receiving targeted grants.</p>
          <button
            onClick={() => { setEditing(null); setSheetOpen(true); }}
            className="bg-[#1A56DB] text-white mt-4 px-4 py-2 rounded-md text-sm"
          >
            Add Project
          </button>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  {p.category && (
                    <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded capitalize mt-1">{p.category}</span>
                  )}
                  {p.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{p.description}</p>
                  )}
                  {p.onchain_project_id && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-mono">
                      <Link className="w-2.5 h-2.5" /> On-chain ID: {p.onchain_project_id}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[p.status] ?? statusColors.active}`}>
                    {p.status.replace("_", " ")}
                  </span>
                  {p.target_usd != null && (
                    <span className="text-xs text-gray-500">{formatUsd(p.target_usd)}</span>
                  )}
                  <button onClick={() => { setEditing(p); setSheetOpen(true); }} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-gray-100" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This will hide the project from your public profile. All associated data is preserved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                if (deleteTarget) {
                  await mutate("delete_project", { id: deleteTarget.id }, [["my-projects", orgContractAddress]]);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProjectForm
        isOpen={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditing(null); }}
        project={editing}
        orgContractAddress={orgContractAddress}
      />
    </div>
  );
}
