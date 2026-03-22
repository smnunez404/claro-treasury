import { useState } from "react";
import { Send, UserMinus, ExternalLink, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePayroll } from "@/hooks/usePayroll";
import { truncateAddress } from "@/lib/constants";
import type { EmployeeOnChain } from "@/types/claro";

interface Props {
  employee: EmployeeOnChain;
  onPay: () => void;
  snowtraceUrl: string;
}

export default function EmployeeRow({ employee, onPay, snowtraceUrl }: Props) {
  const { removeEmployee, reset } = usePayroll();
  const queryClient = useQueryClient();
  const [removing, setRemoving] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    const ok = await removeEmployee(employee.wallet);
    setRemoving(false);
    setConfirmRemoveOpen(false);
    reset();
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["treasury-employees"] });
      queryClient.invalidateQueries({ queryKey: ["treasury-data"] });
    }
  };

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[hsl(224,76%,48%)]">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">{employee.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 hidden sm:table-cell">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-mono">
              {truncateAddress(employee.wallet)}
            </span>
            <ExternalLink
              className="text-muted-foreground cursor-pointer hover:text-foreground"
              style={{ width: 12, height: 12 }}
              onClick={() => window.open(`${snowtraceUrl}/address/${employee.wallet}`, "_blank")}
            />
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm font-semibold text-foreground">{employee.salaryUsd}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onPay}
              className="bg-[hsl(152,68%,28%)] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              <Send style={{ width: 12, height: 12 }} />
              Pay Now
            </button>
            <button
              onClick={() => setConfirmRemoveOpen(true)}
              disabled={removing}
              className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              title="Remove employee"
            >
              <UserMinus className="text-red-400" style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </td>
      </tr>

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {employee.name} from payroll?</AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer be eligible for on-chain payments. This action requires a
              blockchain transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removing && <Loader2 className="animate-spin mr-2" style={{ width: 14, height: 14 }} />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
