import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "buy" | "sell";
  walletAddress: string;
}

export default function OnramperModal({ isOpen, onClose, mode, walletAddress }: Props) {
  const params = new URLSearchParams({
    apiKey: import.meta.env.VITE_ONRAMPER_API_KEY ?? "",
    onlyCryptos: "AVAX_CCHAIN",
    wallets: `AVAX_CCHAIN:${walletAddress}`,
    mode: mode === "sell" ? "sell" : "buy",
    themeName: "dark",
    containerColor: "0A0E1A",
    primaryColor: "1A56DB",
  });
  const onramperUrl = `https://buy.onramper.com?${params.toString()}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "buy" ? "Add Funds" : "Withdraw to Bank Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "buy"
              ? "Add money using a credit card, debit card, bank transfer, or local payment method."
              : "Convert your balance to local currency and withdraw to your bank account."}
          </DialogDescription>
        </DialogHeader>

        {mode === "buy" && (
          <p className="text-xs text-muted-foreground">Funds go directly to your organization's account.</p>
        )}

        <iframe
          src={onramperUrl}
          height="630"
          width="100%"
          title="Onramper"
          allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
          className="rounded-lg border border-border mt-2"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
