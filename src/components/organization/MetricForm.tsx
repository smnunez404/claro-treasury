import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import type { Project } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  orgContractAddress: string;
}

export default function MetricForm({ isOpen, onClose, projects, orgContractAddress }: Props) {
  const { mutate, isLoading, error, clearError } = useOrgWrite();

  const [project_id, setProjectId] = useState("");
  const [metric_name, setMetricName] = useState("");
  const [metric_value, setMetricValue] = useState("");
  const [metric_unit, setMetricUnit] = useState("");
  const [period_start, setPeriodStart] = useState("");
  const [period_end, setPeriodEnd] = useState("");
  const [evidence_url, setEvidenceUrl] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!metric_name.trim() || !metric_value) {
      if (!metric_name.trim()) setNameError("Metric name is required");
      return;
    }
    setNameError(null);

    const result = await mutate("create_metric", {
      project_id: project_id || null,
      metric_name: metric_name.trim(),
      metric_value: Number(metric_value),
      metric_unit: metric_unit.trim() || null,
      period_start: period_start || null,
      period_end: period_end || null,
      evidence_url: evidence_url.trim() || null,
    }, [
      ["my-metrics", orgContractAddress],
      ["org-score", orgContractAddress],
    ]);
    if (result.success) {
      onClose();
      clearError();
      setMetricName("");
      setMetricValue("");
      setMetricUnit("");
      setPeriodStart("");
      setPeriodEnd("");
      setEvidenceUrl("");
      setProjectId("");
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) { onClose(); clearError(); } }}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>New Impact Metric</SheetTitle>
          <SheetDescription>Record a measurable outcome for your organization.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <Field label="Project (optional)">
            <select value={project_id} onChange={e => setProjectId(e.target.value)} className={selectCls}>
              <option value="">Organization-wide</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Metric Name *">
            <input value={metric_name} onChange={e => { setMetricName(e.target.value); setNameError(null); }} placeholder="Students trained, Animals rescued, Trees planted..." className={`${inputCls} ${nameError ? "border-red-400" : ""}`} />
            {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
          </Field>
          <Field label="Value *">
            <input type="number" min="0" step="0.01" value={metric_value} onChange={e => setMetricValue(e.target.value)} placeholder="150" className={inputCls} />
          </Field>
          <Field label="Unit">
            <input value={metric_unit} onChange={e => setMetricUnit(e.target.value)} placeholder="people, animals, hectares, kg, hours..." className={inputCls} />
          </Field>
          <Field label="Period Start">
            <input type="date" value={period_start} onChange={e => setPeriodStart(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Period End">
            <input type="date" value={period_end} onChange={e => setPeriodEnd(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Evidence URL">
            <input type="url" value={evidence_url} onChange={e => setEvidenceUrl(e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
        </div>

        <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { onClose(); clearError(); }} className="flex-1 py-2 rounded-md text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Metric
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const inputCls = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";
const selectCls = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {children}
    </div>
  );
}
