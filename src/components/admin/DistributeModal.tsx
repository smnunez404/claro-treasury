import { Zap, CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { QFAdminRound, DistributeStep } from "@/types/claro";

interface Props {
  round: QFAdminRound | null;
  isOpen: boolean;
  onClose: () => void;
  distributeStep: DistributeStep;
  distributeError: string | null;
  onConfirm: () => void;
  onSuccess: () => void;
}

export default function DistributeModal({
  round,
  isOpen,
  onClose,
  distributeStep,
  distributeError,
  onConfirm,
  onSuccess,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Distribute Matching Pool</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm distribution of matching funds
          </DialogDescription>
        </DialogHeader>

        {distributeStep === "idle" && round && (
          <div>
            {/* Round Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-3">
              <Zap className="text-[#1A56DB] shrink-0" style={{ width: 24, height: 24 }} />
              <div>
                <p className="text-base font-semibold text-gray-900">Round #{round.roundId}</p>
                <p className="text-sm text-gray-500">
                  {round.projectIds.length} projects · ${round.matchingPoolUsd.toFixed(2)} pool
                </p>
              </div>
            </div>

            {/* What happens */}
            <div className="space-y-2 mb-4">
              {[
                { icon: CheckCircle2, color: "text-[#057A55]", text: "Matching pool distributed to projects" },
                { icon: CheckCircle2, color: "text-[#057A55]", text: "Distribution calculated using quadratic formula" },
                { icon: CheckCircle2, color: "text-[#057A55]", text: "Round marked as distributed on-chain" },
                { icon: AlertCircle, color: "text-amber-500", text: "This action cannot be undone" },
              ].map(({ icon: Icon, color, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-700">
                  <Icon className={`${color} shrink-0`} style={{ width: 14, height: 14 }} />
                  {text}
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Projects receiving matching:</p>
              <div className="flex flex-wrap gap-1">
                {round.projectIds.map((pid) => (
                  <span
                    key={pid}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md font-mono"
                  >
                    {pid}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-amber-500 text-white rounded-md px-4 py-2 text-sm flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-[0.97] transition-all"
              >
                <Zap style={{ width: 14, height: 14 }} />
                Distribute Now
              </button>
            </div>
          </div>
        )}

        {distributeStep === "confirming" && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="text-amber-500 animate-spin" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-gray-700 mt-3 text-center">Distributing matching pool...</p>
            <p className="text-xs text-gray-400 mt-1 text-center">Please confirm in your wallet.</p>
          </div>
        )}

        {distributeStep === "success" && (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="text-[#057A55]" style={{ width: 48, height: 48 }} />
            <p className="text-xl font-bold text-gray-900 mt-4 text-center">Matching Distributed!</p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Round #{round?.roundId} matching pool has been distributed.
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Projects with more unique donors received proportionally more matching.
            </p>
            <button
              onClick={onSuccess}
              className="bg-[#057A55] text-white w-full mt-6 rounded-md px-4 py-2 text-sm hover:bg-[#057A55]/90 transition-all"
            >
              Done
            </button>
          </div>
        )}

        {distributeStep === "error" && (
          <div className="flex flex-col items-center py-6">
            <XCircle className="text-red-500" style={{ width: 32, height: 32 }} />
            <p className="text-sm font-semibold text-gray-900 mt-3 text-center">Distribution Failed</p>
            {distributeError && (
              <p className="text-xs text-red-600 mt-1 text-center">{distributeError}</p>
            )}
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-amber-500 text-white rounded-md px-4 py-2 text-sm hover:bg-amber-600 active:scale-[0.97] transition-all"
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
