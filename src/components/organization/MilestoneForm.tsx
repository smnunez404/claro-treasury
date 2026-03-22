import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import type { Milestone, Project } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  projects: Project[];
  orgContractAddress: string;
}

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "delayed", label: "Delayed" },
];

const EVIDENCE_TYPES = [
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "github", label: "GitHub" },
  { value: "publication", label: "Publication" },
  { value: "other", label: "Other" },
];

export default function MilestoneForm({ isOpen, onClose, milestone, projects, orgContractAddress }: Props) {
  const { mutate, isLoading, error, clearError } = useOrgWrite();

  const [project_id, setProjectId] = useState(milestone?.project_id ?? projects[0]?.id ?? "");
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [description, setDescription] = useState(milestone?.description ?? "");
  const [status, setStatus] = useState(milestone?.status ?? "pending");
  const [target_date, setTargetDate] = useState(milestone?.target_date ?? "");
  const [completed_date, setCompletedDate] = useState(milestone?.completed_date ?? "");
  const [evidence_url, setEvidenceUrl] = useState(milestone?.evidence_url ?? "");
  const [evidence_type, setEvidenceType] = useState(milestone?.evidence_type ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);

  useState(() => {
    setProjectId(milestone?.project_id ?? projects[0]?.id ?? "");
    setTitle(milestone?.title ?? "");
    setDescription(milestone?.description ?? "");
    setStatus(milestone?.status ?? "pending");
    setTargetDate(milestone?.target_date ?? "");
    setCompletedDate(milestone?.completed_date ?? "");
    setEvidenceUrl(milestone?.evidence_url ?? "");
    setEvidenceType(milestone?.evidence_type ?? "");
    setTitleError(null);
    clearError();
  });

  async function handleSubmit() {
    if (!title.trim() || !project_id) {
      if (!title.trim()) setTitleError("Title is required");
      return;
    }
    setTitleError(null);

    const action = milestone ? "update_milestone" : "create_milestone";
    const payload: Record<string, unknown> = {
      project_id,
      title: title.trim(),
      description: description.trim() || null,
      status,
      target_date: target_date || null,
      completed_date: completed_date || null,
      evidence_url: evidence_url.trim() || null,
      evidence_type: evidence_type || null,
    };
    if (milestone) payload.id = milestone.id;

    const result = await mutate(action, payload, [
      ["my-milestones", orgContractAddress],
      ["org-score", orgContractAddress],
    ]);
    if (result.success) {
      onClose();
      clearError();
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) { onClose(); clearError(); } }}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{milestone ? "Edit Milestone" : "New Milestone"}</SheetTitle>
          <SheetDescription>{milestone ? "Update milestone details." : "Add a milestone to track progress."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <Field label="Project *">
            <select value={project_id} onChange={e => setProjectId(e.target.value)} disabled={projects.length === 0} className={selectCls}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Title *">
            <input value={title} onChange={e => { setTitle(e.target.value); setTitleError(null); }} placeholder="Launch pilot program" className={`${inputCls} ${titleError ? "border-red-400" : ""}`} />
            {titleError && <p className="text-xs text-red-600 mt-1">{titleError}</p>}
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as "pending" | "in_progress" | "completed" | "delayed")} className={selectCls}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Description">
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this milestone achieve?" className={inputCls} />
          </Field>
          <Field label="Target Date">
            <input type="date" value={target_date} onChange={e => setTargetDate(e.target.value)} className={inputCls} />
          </Field>
          {status === "completed" && (
            <Field label="Completed Date" desc="Leave empty to use today's date">
              <input type="date" value={completed_date} onChange={e => setCompletedDate(e.target.value)} className={inputCls} />
            </Field>
          )}
          {(status === "completed" || evidence_url) && (
            <Field label="Evidence URL">
              <input type="url" value={evidence_url} onChange={e => setEvidenceUrl(e.target.value)} placeholder="https://github.com/... or https://drive.google.com/..." className={inputCls} />
            </Field>
          )}
          {evidence_url && (
            <Field label="Evidence Type">
              <select value={evidence_type} onChange={e => setEvidenceType(e.target.value)} className={selectCls}>
                <option value="">Select type</option>
                {EVIDENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          )}
        </div>

        <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { onClose(); clearError(); }} className="flex-1 py-2 rounded-md text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Milestone
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const inputCls = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
const selectCls = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {children}
      {desc && <p className="text-xs text-gray-400 mt-1">{desc}</p>}
    </div>
  );
}
