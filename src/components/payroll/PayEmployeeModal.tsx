import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePayroll } from "@/hooks/usePayroll";
import { AVAX_TO_USD, avaxToUsd, SNOWTRACE_URL, truncateAddress } from "@/lib/constants";
import type { EmployeeOnChain } from "@/types/claro";

interface Props {
  employee: EmployeeOnChain | null;
  isOpen: boolean;
  onClose: () => void;
  treasuryBalanceAvax: number;
  onSuccess: () => void;
}

export default function PayEmployeeModal({
  employee,
  isOpen,
  onClose,
  treasuryBalanceAvax,
  onSuccess,
}: Props) {
  const { step, lastTx, errorMessage, executePayroll, reset } = usePayroll();
  const [customAmountUsd, setCustomAmountUsd] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCustomAmountUsd("");
      setUseCustom(false);
      reset();
    }
  }, [isOpen]);

  if (!employee) return null;

  const defaultUsd = employee.salaryCents / 100;
  const payAmountUsd = useCustom ? Number(customAmountUsd) || 0 : defaultUsd;
  const payAmountAvax = payAmountUsd / AVAX_TO_USD;
  const insufficientBalance = payAmountAvax > treasuryBalanceAvax;
  const lowAfterPayment = !insufficientBalance && treasuryBalanceAvax - payAmountAvax < 0.05;
  const canPay =
    !insufficientBalance &&
    payAmountUsd > 0 &&
    (!useCustom || (Number(customAmountUsd) >= 0.5));

  const handlePay = async () => {
    const amountWei = ethers.parseEther(payAmountAvax.toFixed(18));
    const ok = await executePayroll(employee.wallet, employee.name, amountWei, payAmountAvax);
    if (ok) onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (step === "idle" || step === "error") && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay {employee.name}</DialogTitle>
        </DialogHeader>

        {step === "idle" && (
          <>
            <div className="bg-muted/50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-[hsl(224,76%,48%)]">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{employee.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(employee.wallet)}
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground mb-2">Payment Amount</p>

            <button
              type="button"
              onClick={() => setUseCustom(false)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer mb-2 transition-colors ${
                !useCustom
                  ? "border-[hsl(224,76%,48%)] bg-blue-50"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <span className="text-sm font-medium text-foreground">Monthly Salary</span>
              <span className="text-sm font-semibold text-[hsl(224,76%,48%)]">
                {employee.salaryUsd}
              </span>
            </button>

            <div
              onClick={() => setUseCustom(true)}
              className={`w-full px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                useCustom
                  ? "border-[hsl(224,76%,48%)] bg-blue-50"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <span className="text-sm font-medium text-foreground">Custom Amount</span>
              {useCustom && (
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0.50"
                    step="0.01"
                    placeholder="Enter USD amount"
                    value={customAmountUsd}
                    onChange={(e) => setCustomAmountUsd(e.target.value)}
                    className="pl-6"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              ≈ {payAmountAvax.toFixed(4)} AVAX will be transferred
            </p>

            {insufficientBalance && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 flex items-start gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-red-700">
                  Insufficient treasury balance. Available: {avaxToUsd(treasuryBalanceAvax)}
                </p>
              </div>
            )}

            {lowAfterPayment && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 flex items-start gap-2">
                <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-amber-700">
                  This payment will leave your treasury with very low balance.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { reset(); onClose(); }}
                className="flex-1 py-2 rounded-md text-sm border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={!canPay}
                className="flex-1 py-2 rounded-md text-sm font-medium bg-[hsl(152,68%,28%)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.97]"
              >
                Confirm Payment
              </button>
            </div>
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="animate-spin text-[hsl(152,68%,28%)]" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-foreground mt-3">Sending payment...</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Please confirm in your wallet. Do not close this window.
            </p>
          </div>
        )}

        {step === "success" && lastTx && (
          <div className="flex flex-col items-center py-4">
            <CheckCircle2 className="text-[hsl(152,68%,28%)]" style={{ width: 48, height: 48 }} />
            <p className="text-xl font-bold text-foreground mt-4">Payment Sent!</p>
            <p className="text-3xl font-bold text-[hsl(152,68%,28%)] mt-1">{lastTx.amountUsd}</p>
            <p className="text-sm text-muted-foreground">paid to {lastTx.employeeName}</p>

            <div className="bg-muted/50 rounded-lg p-3 mt-4 w-full">
              <p className="text-xs text-muted-foreground">Transaction Hash</p>
              <p className="text-xs font-mono text-foreground truncate">{lastTx.txHash}</p>
            </div>

            <a
              href={`${SNOWTRACE_URL}/tx/${lastTx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[hsl(224,76%,48%)] flex items-center gap-1 mt-2 hover:underline"
            >
              View on Snowtrace
              <ExternalLink style={{ width: 14, height: 14 }} />
            </a>

            <button
              onClick={() => { reset(); onClose(); }}
              className="bg-[hsl(152,68%,28%)] text-white w-full py-2.5 rounded-md mt-4 text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              Done
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center py-8">
            <XCircle className="text-red-500" style={{ width: 32, height: 32 }} />
            <p className="text-sm font-semibold text-foreground mt-3">Payment Failed</p>
            <p className="text-xs text-red-600 mt-1 text-center">{errorMessage}</p>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={() => { reset(); onClose(); }}
                className="flex-1 py-2 rounded-md text-sm border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 rounded-md text-sm font-medium bg-[hsl(224,76%,48%)] text-white hover:opacity-90 transition-opacity active:scale-[0.97]"
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
