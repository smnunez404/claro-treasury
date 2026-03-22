import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import type { Project } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  orgContractAddress: string;
}

const CATEGORIES = [
  { value: "", label: "Select category" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "agriculture", label: "Agriculture" },
  { value: "technology", label: "Technology" },
  { value: "culture", label: "Culture" },
  { value: "animals", label: "Animal Welfare" },
  { value: "community", label: "Community" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ProjectForm({ isOpen, onClose, project, orgContractAddress }: Props) {
  const { mutate, isLoading, error, clearError } = useOrgWrite();

  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [status, setStatus] = useState(project?.status ?? "active");
  const [target_usd, setTargetUsd] = useState(project?.target_usd?.toString() ?? "");
  const [start_date, setStartDate] = useState(project?.start_date ?? "");
  const [end_date, setEndDate] = useState(project?.end_date ?? "");
  const [website_url, setWebsiteUrl] = useState(project?.website_url ?? "");
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset form when project changes
  useState(() => {
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setCategory(project?.category ?? "");
    setStatus(project?.status ?? "active");
    setTargetUsd(project?.target_usd?.toString() ?? "");
    setStartDate(project?.start_date ?? "");
    setEndDate(project?.end_date ?? "");
    setWebsiteUrl(project?.website_url ?? "");
    setNameError(null);
    clearError();
  });

  async function handleSubmit() {
    if (!name.trim()) {
      setNameError("Project name is required");
      return;
    }
    setNameError(null);

    const payload: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim() || null,
      category: category || null,
      status,
      target_usd: target_usd ? Number(target_usd) : null,
      start_date: start_date || null,
      end_date: end_date || null,
      website_url: website_url.trim() || null,
    };
    if (project) payload.id = project.id;

    const action = project ? "update_project" : "create_project";
    const result = await mutate(action, payload, [["my-projects", orgContractAddress]]);
    if (result.success) {
      onClose();
      clearError();
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) { onClose(); clearError(); } }}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{project ? "Edit Project" : "New Project"}</SheetTitle>
          <SheetDescription>{project ? "Update project details." : "Add a project to your organization."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <Field label="Project Name *">
            <input
              value={name}
              onChange={e => { setName(e.target.value); setNameError(null); }}
              placeholder="AI for Education Bolivia"
              className={`${inputCls} ${nameError ? "border-red-400" : ""}`}
              aria-invalid={!!nameError}
            />
            {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
          </Field>
          <Field label="Category">
            <select value={category} onChange={e => setCategory(e.target.value)} className={selectCls}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as "active" | "completed" | "on_hold" | "cancelled")} className={selectCls}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Description">
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this project do and why does it matter?" className={inputCls} />
          </Field>
          <Field label="Funding Goal" desc="Target amount in USD">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input type="number" min="0" step="0.01" value={target_usd} onChange={e => setTargetUsd(e.target.value)} placeholder="5000.00" className={`${inputCls} pl-6`} />
            </div>
          </Field>
          <Field label="Start Date">
            <input type="date" value={start_date} onChange={e => setStartDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="End Date">
            <input type="date" value={end_date} onChange={e => setEndDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Project Website">
            <input type="url" value={website_url} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://github.com/yourproject" className={inputCls} />
          </Field>
        </div>

        <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { onClose(); clearError(); }} className="flex-1 py-2 rounded-md text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Project
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
