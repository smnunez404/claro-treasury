import { PlusCircle, ArrowUpRight } from "lucide-react";

interface Props {
  onBuy: () => void;
  onWithdraw: () => void;
  balanceUsd: string;
}

export default function QuickActions({ onBuy, onWithdraw, balanceUsd }: Props) {
  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onBuy}
          className="bg-[#1A56DB] text-white rounded-md px-4 py-2 text-sm font-medium flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-[#1A56DB]/90 transition-colors active:scale-[0.97]"
        >
          <PlusCircle style={{ width: 16, height: 16 }} />
          Add Funds
        </button>
        <button
          onClick={onWithdraw}
          className="border border-border bg-card text-foreground hover:bg-accent rounded-md px-4 py-2 text-sm font-medium flex-1 sm:flex-none flex items-center justify-center gap-2 transition-colors active:scale-[0.97]"
        >
          <ArrowUpRight style={{ width: 16, height: 16 }} />
          Withdraw
        </button>
      </div>
      <span className="text-xs text-muted-foreground">Balance: {balanceUsd}</span>
    </div>
  );
}
