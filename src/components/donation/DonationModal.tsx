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
    <>
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

            {/* Wallet balance display */}
            {walletBalance !== null && isValidAmount && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wallet style={{ width: 12, height: 12 }} />
                  Available: ${(walletBalance * AVAX_TO_USD).toFixed(2)} USD
                </span>
                {!hasEnoughBalance && (
                  <span className="text-xs text-destructive font-medium flex items-center gap-1">
                    <AlertTriangle style={{ width: 12, height: 12 }} />
                    Insufficient balance
                  </span>
                )}
              </div>
            )}

            {/* Insufficient balance panel */}
            {!hasEnoughBalance && walletBalance !== null && isValidAmount && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" style={{ width: 16, height: 16 }} />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Not enough funds</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      You need at least ${((amountAvax + 0.001) * AVAX_TO_USD).toFixed(2)} to complete this donation. You currently have ${(walletBalance * AVAX_TO_USD).toFixed(2)}.
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Add money to continue</p>
                  <button
                    type="button"
                    onClick={() => setShowOnramper(true)}
                    className="w-full flex items-center justify-between bg-background border border-amber-200 dark:border-amber-700 rounded-lg p-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-amber-600" style={{ width: 16, height: 16 }} />
                      <div className="text-left">
                        <p className="text-xs font-medium text-foreground">Add money</p>
                        <p className="text-[11px] text-muted-foreground">Credit card, debit card, bank transfer</p>
                      </div>
                    </div>
                    <ExternalLink className="text-muted-foreground" style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={!isValidAmount || !hasEnoughBalance}
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
            {!hasEnoughBalance && walletBalance !== null && isValidAmount && (
              <p className="text-xs text-center text-muted-foreground">Add funds to continue</p>
            )}
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

    <OnramperModal
      isOpen={showOnramper}
      onClose={() => {
        setShowOnramper(false);
        if (address) fetchBalance(address);
      }}
      mode="buy"
      walletAddress={address ?? ""}
    />
    </>
  );
}
