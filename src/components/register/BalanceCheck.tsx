import { useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, CreditCard, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { avaxToUsd } from "@/lib/constants";
import OnramperModal from "@/components/dashboard/OnramperModal";

interface Props {
  walletBalance: number | null;
  isLoading: boolean;
  onProceed: () => void;
  onBack: () => void;
  onRefreshBalance: () => Promise<void>;
}

const MIN_AVAX = 0.02;

export default function BalanceCheck({ walletBalance, isLoading, onProceed, onBack, onRefreshBalance }: Props) {
  const { address } = useAuth();
  const [showOnramper, setShowOnramper] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasSufficient = walletBalance !== null && walletBalance >= MIN_AVAX;

  async function handleRefresh() {
    setIsRefreshing(true);
    await onRefreshBalance();
    setIsRefreshing(false);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Gas Check</h2>
      <p className="text-sm text-gray-500 mb-6">You need AVAX to pay for the deployment transaction.</p>

      {/* Balance display */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        {isLoading ? (
          <div className="h-12 animate-pulse bg-gray-200 rounded-lg" />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Your AVAX Balance</p>
              <p className="text-2xl font-bold text-gray-900">{walletBalance?.toFixed(4)} AVAX</p>
            </div>
            <span className="text-sm text-gray-400">≈ {avaxToUsd(walletBalance ?? 0)}</span>
          </div>
        )}
      </div>

      {/* Required gas */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
        <span className="text-sm text-gray-500">Required for deployment</span>
        <div className="text-right">
          <span className="text-base font-semibold text-gray-700">~0.02 AVAX</span>
          <span className="text-xs text-gray-400 ml-1">(~$0.36)</span>
        </div>
      </div>

      {/* Status */}
      {walletBalance !== null && hasSufficient && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 className="text-[#057A55] shrink-0" style={{ width: 24, height: 24 }} />
          <div>
            <p className="text-sm font-semibold text-green-800">You have enough AVAX</p>
            <p className="text-xs text-green-700 mt-0.5">Ready to deploy your treasury contract.</p>
          </div>
        </div>
      )}

      {walletBalance !== null && !hasSufficient && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="text-amber-500 shrink-0" style={{ width: 24, height: 24 }} />
            <div>
              <p className="text-sm font-semibold text-amber-800">Insufficient AVAX for gas</p>
              <p className="text-xs text-amber-700 mt-0.5">You need at least 0.02 AVAX to deploy.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Get AVAX for testnet</p>

            {/* Onramper */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="text-[#1A56DB]" style={{ width: 20, height: 20 }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Buy with card</p>
                  <p className="text-xs text-gray-500">Credit card, bank transfer, local payment</p>
                </div>
              </div>
              <button
                onClick={() => setShowOnramper(true)}
                className="bg-[#1A56DB] text-white text-xs px-3 py-1.5 rounded-md hover:opacity-90 active:scale-[0.97]"
              >
                Open
              </button>
            </div>

            {/* Faucet */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Droplets className="text-gray-400" style={{ width: 20, height: 20 }} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Avalanche Fuji Faucet</p>
                  <p className="text-xs text-gray-500">Free testnet AVAX — for testing only</p>
                </div>
              </div>
              <a
                href="https://faucet.avax.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-md hover:bg-gray-50"
              >
                Open Faucet
              </a>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">After getting AVAX, refresh your balance below</p>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-md w-full flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw style={{ width: 14, height: 14 }} className={isRefreshing ? "animate-spin" : ""} />
              Refresh Balance
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50 active:scale-[0.98]"
        >
          ← Back
        </button>
        <button
          onClick={onProceed}
          disabled={!hasSufficient}
          className="flex-1 bg-[#1A56DB] text-white py-2.5 rounded-md font-medium hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Deploy My Treasury →
        </button>
      </div>

      {address && (
        <OnramperModal
          isOpen={showOnramper}
          onClose={() => setShowOnramper(false)}
          mode="buy"
          walletAddress={address}
        />
      )}
    </div>
  );
}
