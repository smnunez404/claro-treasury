import { CheckCircle2, Copy, ExternalLink, LayoutDashboard } from "lucide-react";
import { SNOWTRACE_URL } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import type { DeployResult } from "@/types/claro";

interface Props {
  result: DeployResult;
  onGoToDashboard: () => void;
}

export default function SuccessStep({ result, onGoToDashboard }: Props) {
  function copyAddress() {
    navigator.clipboard.writeText(result.contractAddress);
    toast({ title: "Copied!", description: "Contract address copied to clipboard." });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
      <CheckCircle2
        className="text-[#057A55] mx-auto"
        style={{ width: 64, height: 64, animation: "scale-in 0.4s ease-out" }}
      />
      <style>{`@keyframes scale-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

      <h3 className="text-2xl font-bold text-gray-900 mt-4">Treasury Deployed!</h3>
      <p className="text-lg text-gray-600 mt-1">{result.orgName}</p>

      {/* Details card */}
      <div className="bg-gray-50 rounded-xl p-4 mt-6 text-left space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Network</span>
          <span className="text-sm text-gray-700">Avalanche Fuji Testnet</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Contract Address</span>
            <button onClick={copyAddress} className="text-gray-400 hover:text-gray-600">
              <Copy style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <p className="text-xs font-mono text-gray-700 break-all">{result.contractAddress}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Transaction</span>
          <a
            href={`${SNOWTRACE_URL}/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline"
          >
            View on Snowtrace <ExternalLink style={{ width: 10, height: 10 }} />
          </a>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-left">
        <p className="text-sm font-semibold text-blue-900 mb-2">What happens next?</p>
        <div className="space-y-1">
          {[
            "Your treasury is live — you can receive donations now",
            "CLARO Protocol will review and verify your org within 24–48h",
            "After verification, your org appears in the public directory",
            "Add projects and team members from your dashboard",
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" style={{ width: 10, height: 10 }} />
              <span className="text-xs text-blue-800">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onGoToDashboard}
        className="bg-[#057A55] text-white w-full py-3 rounded-md font-medium mt-6 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
      >
        <LayoutDashboard style={{ width: 16, height: 16 }} />
        Go to Dashboard
      </button>
    </div>
  );
}
