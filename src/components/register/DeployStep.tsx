import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, Circle, Loader2, XCircle, AlertCircle } from "lucide-react";

interface Props {
  orgName: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  onBack?: () => void;
}

const steps = [
  "Connecting to Avalanche Fuji",
  "Deploying YAISTreasury contract",
  "Confirming transaction",
  "Saving to CLARO Protocol",
];

export default function DeployStep({ orgName, errorMessage, onRetry, onBack }: Props) {
  const navigate = useNavigate();
  const isError = !!errorMessage;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (isError) return;
    const timer = setTimeout(() => {
      if (activeStep < 1) setActiveStep(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeStep, isError]);

  if (isError) {
    const isAlreadyRegistered = errorMessage?.includes("already has a registered organization");

    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm text-center">
        <XCircle className="text-red-500 mx-auto" style={{ width: 48, height: 48 }} />
        <h3 className="text-xl font-bold text-gray-900 mt-4">Deployment Failed</h3>
        <p className="text-sm text-red-600 mt-2 max-w-sm mx-auto">{errorMessage}</p>

        {isAlreadyRegistered ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" style={{ width: 16, height: 16 }} />
              <p className="text-sm text-amber-800">
                Your wallet already has an organization. Go to your dashboard to manage it.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-[#1A56DB] text-white w-full mt-3 py-2.5 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.98]"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex gap-3 mt-6">
            <button
              onClick={onBack}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50 active:scale-[0.98]"
            >
              ← Back
            </button>
            <button
              onClick={onRetry}
              className="flex-1 bg-[#1A56DB] text-white py-2.5 rounded-md font-medium hover:opacity-90 active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
      {/* Animated spinner */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-gray-100" />
        <div className="w-20 h-20 rounded-full border-4 border-t-[#1A56DB] animate-spin absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="text-[#1A56DB]" style={{ width: 28, height: 28 }} />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">Deploying Treasury Contract</h3>
      <p className="text-sm text-gray-500 mt-2">
        Creating your YAISTreasury on Avalanche Fuji...
      </p>

      {/* Progress steps */}
      <div className="space-y-2 mt-6 text-left max-w-xs mx-auto">
        {steps.map((label, i) => {
          let icon;
          if (i < activeStep) {
            icon = <CheckCircle2 className="text-[#057A55] shrink-0" style={{ width: 14, height: 14 }} />;
          } else if (i === activeStep) {
            icon = <Loader2 className="text-[#1A56DB] animate-spin shrink-0" style={{ width: 14, height: 14 }} />;
          } else {
            icon = <Circle className="text-gray-300 shrink-0" style={{ width: 14, height: 14 }} />;
          }
          return (
            <div key={i} className="flex items-center gap-3">
              {icon}
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Please confirm the transaction in your wallet and do not close this window.
      </p>
    </div>
  );
}
