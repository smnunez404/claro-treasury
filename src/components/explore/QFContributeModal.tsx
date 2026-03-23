import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle, Zap, Users, TrendingUp, AlertTriangle, CreditCard, ExternalLink, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ethers } from "ethers";
import { AVAX_TO_USD, RPC_URL } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import OnramperModal from "@/components/dashboard/OnramperModal";
import type { QFProjectData, QFRoundFull2 as QFRoundType, ContributeStep } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: QFProjectData[];
  round: QFRoundType;
  onContribute: (projectId: string, amountUsd: number) => Promise<boolean>;
  contributeStep: ContributeStep;
  contributeError: string | null;
  onReset: () => void;
}

export default function QFContributeModal({
  isOpen, onClose, projects, round,
  onContribute, contributeStep, contributeError, onReset,
}: Props) {
  const { address } = useAuth();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [amountUsd, setAmountUsd] = useState(1.0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showOnramper, setShowOnramper] = useState(false);

  const project = projects[selectedIdx] ?? projects[0];

  const amountAvax = amountUsd / AVAX_TO_USD;
  const hasEnoughBalance = walletBalance === null || walletBalance >= amountAvax + 0.001;

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

  if (!project) return null;

  const step = contributeStep;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); onReset(); } }}>
        <DialogContent className="max-w-sm">
          {(step === "idle" || step === "amount") && (
            <>
              <DialogTitle>Support in QF Round</DialogTitle>

              {/* Project selector */}
              {projects.length > 1 ? (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Select project</p>
                  <div className="space-y-1.5">
                    {projects.map((p, i) => (
                      <button
                        key={p.projectId}
                        onClick={() => setSelectedIdx(i)}
                        className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all ${
                          i === selectedIdx
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-muted hover:border-muted-foreground/30"
                        }`}
                      >
                        <p className={`text-sm font-medium ${i === selectedIdx ? "text-primary" : "text-foreground"}`}>
                          {p.projectName}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users style={{ width: 10, height: 10 }} />
                            {p.uniqueDonors}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp style={{ width: 10, height: 10 }} />
                            ~${p.projectedMatchingUsd.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <p className="text-base font-semibold text-foreground">{project.projectName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
              )}

              {/* QF explanation */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-primary">
                  In Quadratic Funding, your unique contribution matters more than the amount. Even $1 increases this project's matching significantly.
                </p>
              </div>

              {/* Amount input */}
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Your contribution</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(Number(e.target.value))}
                    className="text-lg font-semibold text-foreground border border-border rounded-md px-3 py-2 w-28 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-muted-foreground text-sm">USD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {amountAvax.toFixed(4)} AVAX
                </p>
              </div>

              {/* Wallet balance display */}
              {walletBalance !== null && (
                <div className="flex items-center justify-between mt-2">
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

              {/* Quick amounts */}
              <div className="flex gap-2 mt-2">
                {[0.18, 0.36, 0.54, 1, 5, 10].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmountUsd(v)}
                    className="text-xs border border-border rounded-md px-2 py-1 cursor-pointer hover:bg-muted"
                  >
                    ${v < 1 ? v.toFixed(2) : v}
                  </button>
                ))}
              </div>

              {/* Insufficient balance panel */}
              {!hasEnoughBalance && walletBalance !== null && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" style={{ width: 16, height: 16 }} />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Not enough funds</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        You need at least ${((amountAvax + 0.001) * AVAX_TO_USD).toFixed(2)} to complete this contribution. You currently have ${(walletBalance * AVAX_TO_USD).toFixed(2)}.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-amber-800">Add money to continue</p>
                    <button
                      onClick={() => setShowOnramper(true)}
                      className="w-full flex items-center justify-between bg-white border border-amber-200 rounded-lg p-2.5 hover:bg-amber-50 transition-colors"
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

              {/* Matching preview — only show when balance is sufficient */}
              {hasEnoughBalance && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <Zap className="text-green-600 shrink-0" style={{ width: 14, height: 14 }} />
                    This contribution could increase the matching by ~${(amountUsd * 0.3).toFixed(2)} USD
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 border border-border bg-background text-foreground hover:bg-muted rounded-md py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onContribute(project.projectId, amountUsd)}
                    disabled={amountUsd < 0.1 || !hasEnoughBalance}
                    className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50 hover:bg-primary/90"
                  >
                    Contribute ${amountUsd.toFixed(2)}
                  </button>
                </div>
                {!hasEnoughBalance && walletBalance !== null && (
                  <p className="text-xs text-center text-muted-foreground">Add funds to continue</p>
                )}
              </div>
            </>
          )}

          {step === "confirming" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="animate-spin text-primary" style={{ width: 32, height: 32 }} />
              <p className="text-sm text-muted-foreground mt-3 text-center">Please confirm in your wallet.</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="text-green-600" style={{ width: 40, height: 40 }} />
              <p className="text-lg font-bold text-foreground mt-3 text-center">Contribution sent!</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                ${amountUsd.toFixed(2)} USD contributed to {project.projectName}
              </p>
              <p className="text-xs text-muted-foreground/70 text-center mt-1">
                Your contribution increases this project's quadratic matching.
              </p>
              <button
                onClick={() => { onReset(); onClose(); }}
                className="bg-green-600 text-white w-full py-2.5 rounded-md mt-4 text-sm font-medium hover:bg-green-700"
              >
                Done
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center py-8">
              <XCircle className="text-destructive" style={{ width: 32, height: 32 }} />
              <p className="text-sm text-destructive mt-2 text-center">{contributeError}</p>
              <div className="flex gap-3 mt-4 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 border border-border bg-background text-foreground hover:bg-muted rounded-md py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onReset}
                  className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
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
