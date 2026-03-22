import { ArrowRight } from "lucide-react";
import { AVAX_TO_USD } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (value: string) => void;
  orgName: string;
  disabled?: boolean;
}

const quickAmounts = ["1", "5", "10", "25"];
const quickAvaxAmounts = [0.01, 0.02, 0.03];

export default function AmountInput({ value, onChange, orgName, disabled }: Props) {
  const numValue = Number(value);
  const showAvax = !isNaN(numValue) && numValue > 0;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Donation Amount</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="5.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-7 pr-16 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">USD</span>
      </div>

      {showAvax && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowRight style={{ width: 10, height: 10 }} />
          ≈ {(numValue / AVAX_TO_USD).toFixed(4)} AVAX
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {quickAvaxAmounts.map((avax) => {
          const usdEquiv = (avax * AVAX_TO_USD).toFixed(2);
          return (
            <button
              key={`avax-${avax}`}
              type="button"
              onClick={() => onChange(usdEquiv)}
              disabled={disabled}
              className="border border-border text-muted-foreground text-xs px-3 py-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            >
              {avax} AVAX
            </button>
          );
        })}
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => onChange(amt)}
            disabled={disabled}
            className="border border-border text-muted-foreground text-xs px-3 py-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            ${amt}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Donating to {orgName} · Secured by Avalanche blockchain
      </p>
    </div>
  );
}
