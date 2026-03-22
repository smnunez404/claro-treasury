import { useState } from "react";
import { Shield, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivy } from "@privy-io/react-auth";
import { useDonation } from "@/hooks/useDonation";
import { AVAX_TO_USD, SNOWTRACE_URL } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AmountInput from "./AmountInput";
import GrantSelector from "./GrantSelector";
import DonationSuccess from "./DonationSuccess";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orgContract: string;
  orgName: string;
}

export default function DonationModal({ isOpen, onClose, orgContract, orgName }: Props) {
  const { address, role } = useAuth();
  const { login } = usePrivy();
  const { step, txHash, errorMessage, donate, reset } = useDonation();

  const [amountUsd, setAmountUsd] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState("General Treasury");

  const handleClose = () => {
    reset();
    setAmountUsd("");
    setSelectedProjectId(null);
    setSelectedProjectName("General Treasury");
    onClose();
  };

  const handleDonateAgain = () => {
    reset();
    setAmountUsd("");
  };

  const numAmount = Number(amountUsd);
  const isValidAmount = !isNaN(numAmount) && numAmount >= 0.01;
  const isConnected = role !== "visitor" && !!address;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support {orgName}</DialogTitle>
        </DialogHeader>

        {/* IDLE — Not connected */}
        {step === "idle" && !isConnected && (
          <div className="flex flex-col items-center py-6">
            <Shield className="text-primary" style={{ width: 32, height: 32 }} />
            <p className="text-sm font-medium text-foreground mt-3">Connect your wallet to donate</p>
            <p className="text-xs text-muted-foreground mt-1">Use email, Google, or your existing wallet.</p>
            <button
              onClick={() => login()}
              className="bg-primary text-primary-foreground w-full py-3 rounded-md mt-4 text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all"
            >
              Connect &amp; Donate
            </button>
          </div>
        )}

        {/* IDLE — Connected */}
        {step === "idle" && isConnected && (
          <div className="space-y-4">
            <GrantSelector
              orgContract={orgContract}
              selectedProjectId={selectedProjectId}
              onChange={(id, name) => {
                setSelectedProjectId(id);
                setSelectedProjectName(name);
              }}
            />
            <AmountInput value={amountUsd} onChange={setAmountUsd} orgName={orgName} />

            {numAmount > 0 && numAmount < 0.5 && (
              <p className="text-xs text-destructive">Minimum donation is $0.50</p>
            )}

            <button
              disabled={!isValidAmount}
              onClick={() =>
                donate(numAmount, {
                  projectId: selectedProjectId,
                  projectName: selectedProjectName,
                  orgContract,
                  orgName,
                })
              }
              className="bg-primary text-primary-foreground w-full py-3 rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Donate{amountUsd ? ` $${numAmount.toFixed(2)}` : ""}
            </button>
          </div>
        )}

        {/* CONFIRMING */}
        {step === "confirming" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="animate-spin text-primary" style={{ width: 32, height: 32 }} />
            <p className="text-sm font-medium text-foreground mt-3">Confirming transaction...</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Please confirm in your wallet. Do not close this window.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Converting ${amountUsd} → {(numAmount / AVAX_TO_USD).toFixed(4)} AVAX
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && txHash && (
          <DonationSuccess
            txHash={txHash}
            amountUsd={numAmount}
            orgName={orgName}
            targetName={selectedProjectName || "General Treasury"}
            onClose={handleClose}
            onDonateAgain={handleDonateAgain}
            snowtraceUrl={SNOWTRACE_URL}
          />
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="flex flex-col items-center py-6">
            <XCircle className="text-destructive" style={{ width: 32, height: 32 }} />
            <p className="text-sm font-semibold text-foreground mt-3">Transaction Failed</p>
            <p className="text-xs text-destructive mt-1 text-center">{errorMessage}</p>
            <button
              onClick={reset}
              className="bg-primary text-primary-foreground w-full py-2.5 rounded-md mt-4 text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="text-muted-foreground text-xs mt-2 w-full text-center cursor-pointer hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
