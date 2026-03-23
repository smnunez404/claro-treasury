import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Zap, Users, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AVAX_TO_USD } from "@/lib/constants";
import type { QFProjectData, QFRound as QFRoundType, ContributeStep } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: QFProjectData;
  round: QFRoundType;
  onContribute: (projectId: string, amountUsd: number) => Promise<boolean>;
  contributeStep: ContributeStep;
  contributeError: string | null;
  onReset: () => void;
}

export default function QFContributeModal({
  isOpen, onClose, project, round,
  onContribute, contributeStep, contributeError, onReset,
}: Props) {
  const [amountUsd, setAmountUsd] = useState(1.0);

  const step = contributeStep;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); onReset(); } }}>
      <DialogContent className="max-w-sm">
        {(step === "idle" || step === "amount") && (
          <>
            <DialogTitle>Support in QF Round</DialogTitle>

            {/* Project info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-base font-semibold text-gray-900">{project.projectName}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users style={{ width: 10, height: 10 }} />
                  {project.uniqueDonors} contributors
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp style={{ width: 10, height: 10 }} />
                  ~${project.projectedMatchingUsd.toFixed(2)} projected matching
                </span>
              </div>
            </div>

            {/* QF explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">
                In Quadratic Funding, your unique contribution matters more than the amount. Even $1 increases this project's matching significantly.
              </p>
            </div>

            {/* Amount input */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Your contribution</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(Number(e.target.value))}
                  className="text-lg font-semibold text-gray-900 border border-gray-300 rounded-md px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-gray-400 text-sm">USD</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ≈ {(amountUsd / AVAX_TO_USD).toFixed(4)} AVAX
              </p>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-2">
              {[1, 5, 10].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmountUsd(v)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1 cursor-pointer hover:bg-gray-50"
                >
                  ${v}
                </button>
              ))}
            </div>

            {/* Matching preview */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-green-700 flex items-center gap-1">
                <Zap className="text-green-600 shrink-0" style={{ width: 14, height: 14 }} />
                This contribution could increase the matching by ~${(amountUsd * 0.3).toFixed(2)} USD
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onContribute(project.projectId, amountUsd)}
                disabled={amountUsd < 0.1}
                className="flex-1 bg-[#1A56DB] text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 hover:bg-[#1A56DB]/90"
              >
                Contribute ${amountUsd.toFixed(2)}
              </button>
            </div>
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="animate-spin text-[#1A56DB]" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-gray-700 mt-3 text-center">Please confirm in your wallet.</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="text-[#057A55]" style={{ width: 40, height: 40 }} />
            <p className="text-lg font-bold text-gray-900 mt-3 text-center">Contribution sent!</p>
            <p className="text-sm text-gray-500 text-center mt-1">
              ${amountUsd.toFixed(2)} USD contributed to {project.projectName}
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Your contribution increases this project's quadratic matching.
            </p>
            <button
              onClick={() => { onReset(); onClose(); }}
              className="bg-[#057A55] text-white w-full py-2.5 rounded-md mt-4 text-sm font-medium"
            >
              Done
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-8">
            <XCircle className="text-red-500" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-red-600 mt-2 text-center">{contributeError}</p>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onReset}
                className="flex-1 bg-[#1A56DB] text-white rounded-md py-2 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
