import { useState, useEffect } from "react";
import { Shield, Loader2, XCircle, AlertTriangle, CreditCard, ExternalLink, Wallet } from "lucide-react";
import { ethers } from "ethers";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivy } from "@privy-io/react-auth";
import { useDonation } from "@/hooks/useDonation";
import { AVAX_TO_USD, RPC_URL, SNOWTRACE_URL } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AmountInput from "./AmountInput";
import GrantSelector from "./GrantSelector";
import DonationSuccess from "./DonationSuccess";
import OnramperModal from "@/components/dashboard/OnramperModal";

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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showOnramper, setShowOnramper] = useState(false);

  const fetchBalance = (addr: string) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    provider.getBalance(addr).then(bal => {
      setWalletBalance(Number(ethers.formatEther(bal)));
    }).catch(() => setWalletBalance(null));
  };

  useEffect(() => {
    if (!address || !isOpen) return;
    fetchBalance(address);
  }, [address, isOpen]);

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
  const amountAvax = numAmount / AVAX_TO_USD;
  const hasEnoughBalance = walletBalance === null || walletBalance >= amountAvax + 0.001;

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

            {numAmount > 0 && numAmount < 0.01 && (
              <p className="text-xs text-destructive">Minimum donation is $0.01</p>
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
