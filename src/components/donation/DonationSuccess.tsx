import { CheckCircle2, ExternalLink } from "lucide-react";

interface Props {
  txHash: string;
  amountUsd: number;
  orgName: string;
  targetName: string;
  onClose: () => void;
  onDonateAgain: () => void;
  snowtraceUrl: string;
}

export default function DonationSuccess({
  txHash, amountUsd, orgName, targetName, onClose, onDonateAgain, snowtraceUrl,
}: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <CheckCircle2 className="text-[#057A55] animate-in zoom-in-50 duration-300" style={{ width: 48, height: 48 }} />
      <p className="text-xl font-bold text-foreground mt-4">Donation Sent!</p>
      <p className="text-3xl font-bold text-[#057A55] mt-1">${amountUsd.toFixed(2)}</p>
      <p className="text-sm text-muted-foreground">donated to {targetName}</p>
      <p className="text-xs text-muted-foreground/70">at {orgName}</p>

      <div className="w-full my-6 border-t border-border" />

      <div className="w-full bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">Transaction Hash</p>
        <p className="text-xs font-mono text-foreground break-all mt-1">{txHash}</p>
      </div>

      <a
        href={`${snowtraceUrl}/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-sm text-primary flex items-center gap-1 hover:underline"
      >
        View on Snowtrace
        <ExternalLink style={{ width: 14, height: 14 }} />
      </a>

      <div className="mt-6 flex gap-3 w-full">
        <button
          onClick={onClose}
          className="flex-1 bg-[#057A55] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#057A55]/90 active:scale-[0.97] transition-all"
        >
          Done
        </button>
        <button
          onClick={onDonateAgain}
          className="flex-1 border border-border bg-card text-foreground py-2.5 rounded-md text-sm hover:bg-accent active:scale-[0.97] transition-all"
        >
          Donate Again
        </button>
      </div>
    </div>
  );
}
