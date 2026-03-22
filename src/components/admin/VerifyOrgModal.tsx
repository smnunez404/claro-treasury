import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { truncateAddress } from "@/lib/constants";
import type { AdminOrgRow, VerifyStep } from "@/types/claro";

interface Props {
  org: AdminOrgRow | null;
  isOpen: boolean;
  onClose: () => void;
  verifyStep: VerifyStep;
  verifyError: string | null;
  onConfirm: () => void;
  onSuccess: () => void;
}

export default function VerifyOrgModal({
  org,
  isOpen,
  onClose,
  verifyStep,
  verifyError,
  onConfirm,
  onSuccess,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Organization</DialogTitle>
        </DialogHeader>

        {verifyStep === "idle" && org && (
          <div>
            {/* Org info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Building2 className="text-gray-400 shrink-0" style={{ width: 24, height: 24 }} />
                <div>
                  <p className="text-base font-semibold text-gray-900">{org.name}</p>
                  <p className="text-sm text-gray-500">{org.country}</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    {truncateAddress(org.contract_address)}
                  </p>
                </div>
              </div>
            </div>

            {/* What verification does */}
            <div className="space-y-2 text-sm text-gray-700">
              {[
                "Organization will be marked as Verified on-chain",
                "Verified badge will appear on their public profile",
                "Transparency score will increase by 20 points",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#057A55] shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4 flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-xs text-amber-700">
                This action requires a blockchain transaction and cannot be undone.
              </span>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md py-2.5 text-sm font-medium active:scale-[0.97] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-[#057A55] text-white rounded-md py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#046c4e] active:scale-[0.97] transition-all"
              >
                <ShieldCheck size={14} />
                Verify Organization
              </button>
            </div>
          </div>
        )}

        {verifyStep === "confirming" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={32} className="text-[#057A55] animate-spin" />
            <p className="text-sm text-gray-700 mt-3 text-center">Verifying on-chain...</p>
            <p className="text-xs text-gray-400 mt-1 text-center">Please confirm in your wallet.</p>
          </div>
        )}

        {verifyStep === "success" && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 size={48} className="text-[#057A55]" />
            <p className="text-xl font-bold text-gray-900 mt-4 text-center">
              Organization Verified!
            </p>
            <p className="text-sm text-gray-500 text-center mt-1">{org?.name}</p>
            <p className="text-sm text-gray-500 text-center">
              is now verified on CLARO Protocol.
            </p>
            <button
              onClick={onSuccess}
              className="bg-[#057A55] text-white w-full py-2.5 rounded-md mt-6 text-sm font-medium hover:bg-[#046c4e] active:scale-[0.97] transition-all"
            >
              Done
            </button>
          </div>
        )}

        {verifyStep === "error" && (
          <div className="flex flex-col items-center py-8">
            <XCircle size={32} className="text-red-500" />
            <p className="text-sm font-semibold text-gray-900 mt-3 text-center">
              Verification Failed
            </p>
            <p className="text-xs text-red-600 mt-1 text-center">{verifyError}</p>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md py-2.5 text-sm font-medium active:scale-[0.97] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-[#1A56DB] text-white rounded-md py-2.5 text-sm font-medium hover:bg-[#1648b8] active:scale-[0.97] transition-all"
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
