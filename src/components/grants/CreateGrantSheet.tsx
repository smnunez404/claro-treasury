import { useState, useEffect } from "react";
import { Info, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateGrantStep } from "@/types/claro";

interface ProjectOption {
  id: string;
  name: string;
  onchain_project_id: string | null;
  status: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectOption[];
  createGrant: (projectId: string, projectName: string) => Promise<boolean>;
  createStep: CreateGrantStep;
  createError: string | null;
  reset: () => void;
  onSuccess: () => void;
}

export default function CreateGrantSheet({
  isOpen, onClose, projects, createGrant, createStep, createError, reset, onSuccess,
}: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customProjectId, setCustomProjectId] = useState("");
  const [customProjectName, setCustomProjectName] = useState("");
  const [useCustom, setUseCustom] = useState(projects.length === 0);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedProjectId("");
      setCustomProjectId("");
      setCustomProjectName("");
      setUseCustom(projects.length === 0);
      setValidationError(null);
    }
  }, [isOpen, projects.length]);

  const handleSubmit = async () => {
    if (useCustom || projects.length === 0) {
      if (!customProjectId.trim()) {
        setValidationError("Grant ID is required");
        return;
      }
      if (!customProjectName.trim()) {
        setValidationError("Grant Name is required");
        return;
      }
      setValidationError(null);
      await createGrant(
        customProjectId.trim().toLowerCase().replace(/\s+/g, "-"),
        customProjectName.trim()
      );
    } else {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (!project) {
        setValidationError("Please select a project");
        return;
      }
      setValidationError(null);
      const grantId =
        project.onchain_project_id ??
        project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      await createGrant(grantId, project.name);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Create Grant</SheetTitle>
          <SheetDescription>Link a project to an on-chain grant vault.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {createStep === "idle" && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Info className="text-blue-500 shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-blue-700">
                  A grant creates a transparent funding vault for a specific project.
                  Anyone can donate to it. Only you can disburse the funds.
                </p>
              </div>

              {projects.length > 0 && !useCustom && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Link to a Project</Label>
                    <div className="space-y-2">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setSelectedProjectId(p.id); setUseCustom(false); }}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3 ${
                            selectedProjectId === p.id
                              ? "border-[#1A56DB] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            selectedProjectId === p.id ? "border-[#1A56DB]" : "border-gray-300"
                          }`}>
                            {selectedProjectId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-[#1A56DB]" />}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{p.name}</span>
                          {p.status && (
                            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{p.status}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseCustom(true)}
                    className="text-xs text-[#1A56DB] cursor-pointer hover:underline"
                  >
                    Or use a custom grant ID instead
                  </button>
                </>
              )}

              {(projects.length === 0 || useCustom) && (
                <>
                  {projects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseCustom(false)}
                      className="text-xs text-[#1A56DB] cursor-pointer hover:underline"
                    >
                      ← Back to project list
                    </button>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Grant ID</Label>
                    <Input
                      value={customProjectId}
                      onChange={(e) => setCustomProjectId(e.target.value)}
                      placeholder="ai-education-2026"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Unique identifier used on-chain. No spaces. Lowercase recommended.</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Grant Name</Label>
                    <Input
                      value={customProjectName}
                      onChange={(e) => setCustomProjectName(e.target.value)}
                      placeholder="AI for Education Bolivia"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-amber-700">Grant IDs cannot be changed after creation. Choose a descriptive, unique ID.</p>
              </div>
            </>
          )}

          {createStep === "confirming" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#1A56DB]" style={{ width: 32, height: 32 }} />
              <p className="text-sm text-gray-700 mt-3">Creating grant on-chain...</p>
              <p className="text-xs text-gray-400 mt-1">Please confirm in your wallet.</p>
            </div>
          )}

          {createStep === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="text-[#057A55]" style={{ width: 40, height: 40 }} />
              <p className="text-lg font-bold text-gray-900 mt-4">Grant Created!</p>
              <p className="text-sm text-gray-500 mt-1">Your grant vault is now live on Avalanche.</p>
              <button
                onClick={onSuccess}
                className="bg-[#057A55] text-white w-full mt-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                Done
              </button>
            </div>
          )}

          {createStep === "error" && (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="text-red-500" style={{ width: 32, height: 32 }} />
              <p className="text-sm text-red-600 mt-3 text-center">{createError}</p>
              <div className="flex gap-3 mt-4 w-full">
                <button
                  onClick={() => { onClose(); reset(); }}
                  className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-50 active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={reset}
                  className="flex-1 bg-[#1A56DB] text-white py-2 rounded-md text-sm hover:opacity-90 active:scale-[0.97]"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {createStep === "idle" && (
          <SheetFooter className="border-t border-gray-100 pt-4">
            {validationError && (
              <p className="text-xs text-red-600 text-center w-full mb-2">{validationError}</p>
            )}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { onClose(); reset(); }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-md text-sm hover:bg-gray-50 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#1A56DB] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.97]"
              >
                Create Grant
              </button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
