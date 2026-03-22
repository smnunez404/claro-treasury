import { useState, useEffect } from "react";
import { Loader2, XCircle, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayroll } from "@/hooks/usePayroll";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeSheet({ isOpen, onClose, onSuccess }: Props) {
  const { step, errorMessage, addEmployee, reset } = usePayroll();

  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [salaryUsd, setSalaryUsd] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWallet("");
      setName("");
      setSalaryUsd("");
      setValidationError(null);
      reset();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!wallet.startsWith("0x") || wallet.length !== 42) {
      setValidationError("Invalid Avalanche address");
      return;
    }
    if (!name.trim()) {
      setValidationError("Name is required");
      return;
    }
    if (!salaryUsd || Number(salaryUsd) <= 0) {
      setValidationError("Salary must be greater than 0");
      return;
    }
    setValidationError(null);

    const salaryCents = Math.round(Number(salaryUsd) * 100);
    const ok = await addEmployee(wallet, name.trim(), salaryCents);
    if (ok) {
      reset();
      onSuccess();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle>Add Employee</SheetTitle>
          <SheetDescription>Add a wallet address to your on-chain payroll.</SheetDescription>
        </SheetHeader>

        {step === "idle" && (
          <>
            <div className="space-y-4 p-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <Label>Wallet Address *</Label>
                <Input
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x..."
                />
                <p className="text-xs text-muted-foreground">Their Avalanche wallet address</p>
              </div>

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="María García"
                />
                <p className="text-xs text-muted-foreground">Display name on the payroll</p>
              </div>

              <div className="space-y-2">
                <Label>Monthly Salary (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryUsd}
                    onChange={(e) => setSalaryUsd(e.target.value)}
                    placeholder="1500.00"
                    className="pl-6"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Stored as cents on-chain (e.g. $1,500.00 = 150000 cents)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 flex items-start gap-2">
                <Info className="text-blue-500 flex-shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
                <p className="text-xs text-blue-700">
                  This transaction adds the employee to your treasury contract. Their salary is
                  stored on-chain for transparency.
                </p>
              </div>
            </div>

            <div className="border-t border-border p-4 space-y-3">
              {validationError && (
                <p className="text-xs text-red-600 text-center">{validationError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-md text-sm border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 rounded-md text-sm font-medium bg-[hsl(224,76%,48%)] text-white hover:opacity-90 transition-opacity active:scale-[0.97]"
                >
                  Add to Payroll
                </button>
              </div>
            </div>
          </>
        )}

        {step === "confirming" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Loader2
              className="animate-spin text-[hsl(224,76%,48%)]"
              style={{ width: 32, height: 32 }}
            />
            <p className="text-sm text-foreground mt-3">Confirming transaction...</p>
            <p className="text-xs text-muted-foreground mt-1">Please confirm in your wallet.</p>
          </div>
        )}

        {step === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <XCircle className="text-red-500" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-red-600 mt-3 text-center">{errorMessage}</p>
            <button
              onClick={reset}
              className="bg-[hsl(224,76%,48%)] text-white w-full mt-4 py-2.5 rounded-md text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              Try Again
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
