import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Gift, AlertCircle, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVAX_TO_USD } from "@/lib/constants";
import { SNOWTRACE_URL, truncateAddress } from "@/lib/constants";
import type { GrantFull, DisburseStep } from "@/types/claro";

interface Props {
  grant: GrantFull | null;
  isOpen: boolean;
  onClose: () => void;
  disburseGrant: (
    projectId: string, projectName: string,
    recipientAddress: string, amountWei: bigint, amountAvax: number
  ) => Promise<boolean>;
  disburseStep: DisburseStep;
  disburseError: string | null;
  disburseTxHash: string | null;
  reset: () => void;
  onSuccess: () => void;
  treasuryBalanceAvax: number;
}

export default function DisburseModal({
  grant, isOpen, onClose, disburseGrant, disburseStep, disburseError,
  disburseTxHash, reset, onSuccess, treasuryBalanceAvax,
}: Props) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amountUsd, setAmountUsd] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRecipientAddress("");
      setAmountUsd("");
    }
  }, [isOpen]);

  if (!grant) return null;

  const amountAvax = Number(amountUsd) / AVAX_TO_USD;
  const isValidAddress = recipientAddress.startsWith("0x") && recipientAddress.length === 42;
  const exceedsGrant = amountAvax > grant.availableAvax;
  const exceedsTreasury = amountAvax > treasuryBalanceAvax;
  const canConfirm = isValidAddress && Number(amountUsd) >= 0.5 && !exceedsGrant && !exceedsTreasury;

  const handleDisburse = async () => {
    const wei = ethers.parseEther(amountAvax.toFixed(18));
    await disburseGrant(grant.projectId, grant.projectName, recipientAddress, wei, amountAvax);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Disburse Funds — {grant.projectName}</DialogTitle>
        </DialogHeader>

        {disburseStep === "idle" && (
          <>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <Gift className="text-[#1A56DB]" style={{ width: 16, height: 16 }} />
              <div>
                <p className="text-sm font-semibold text-gray-900">{grant.projectName}</p>
                <p className="text-sm text-[#057A55] font-bold">{grant.availableUsd} available</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Recipient Wallet</Label>
                <Input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Avalanche address to receive the funds</p>
                {recipientAddress && !isValidAddress && (
                  <p className="text-xs text-red-500 mt-1">Invalid address</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Amount (USD)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <Input
                    type="number"
                    min="0.50"
                    step="0.01"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    className="pl-7"
                  />
                </div>
                {Number(amountUsd) > 0 && (
                  <p className="text-xs text-gray-400 mt-1">≈ {amountAvax.toFixed(4)} AVAX</p>
                )}
              </div>
            </div>

            {exceedsGrant && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-red-700">Amount exceeds available grant balance ({grant.availableUsd})</p>
              </div>
            )}
            {!exceedsGrant && exceedsTreasury && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-red-700">Insufficient treasury balance</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { onClose(); reset(); }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-md text-sm hover:bg-gray-50 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisburse}
                disabled={!canConfirm}
                className="flex-1 bg-[#057A55] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                Confirm Disburse
              </button>
            </div>
          </>
        )}

        {disburseStep === "confirming" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="animate-spin text-[#057A55]" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-gray-700 mt-3 text-center">Sending funds...</p>
            <p className="text-xs text-gray-400 mt-1 text-center">Please confirm in your wallet. Do not close this window.</p>
          </div>
        )}

        {disburseStep === "success" && (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 className="text-[#057A55]" style={{ width: 48, height: 48 }} />
            <p className="text-xl font-bold text-gray-900 mt-4">Funds Disbursed!</p>
            <p className="text-3xl font-bold text-[#057A55] mt-1">${amountUsd}</p>
            <p className="text-sm text-gray-500">sent to {truncateAddress(recipientAddress)}</p>

            {disburseTxHash && (
              <>
                <div className="bg-gray-50 rounded-lg p-3 mt-4 w-full">
                  <p className="text-xs text-gray-500">Transaction Hash</p>
                  <p className="text-xs font-mono text-gray-700 truncate">{disburseTxHash}</p>
                </div>
                <a
                  href={`${SNOWTRACE_URL}/tx/${disburseTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1A56DB] flex items-center gap-1 mt-2 hover:underline"
                >
                  View on Snowtrace
                  <ExternalLink style={{ width: 14, height: 14 }} />
                </a>
              </>
            )}

            <button
              onClick={onSuccess}
              className="bg-[#057A55] text-white w-full py-2.5 rounded-md mt-4 text-sm font-medium hover:opacity-90 active:scale-[0.97]"
            >
              Done
            </button>
          </div>
        )}

        {disburseStep === "error" && (
          <div className="flex flex-col items-center py-10">
            <XCircle className="text-red-500" style={{ width: 32, height: 32 }} />
            <p className="text-sm font-semibold text-gray-900 mt-3">Disbursement Failed</p>
            <p className="text-xs text-red-600 mt-1 text-center">{disburseError}</p>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={() => { reset(); onClose(); }}
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
      </DialogContent>
    </Dialog>
  );
}
