import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRegister } from "@/hooks/useRegister";
import RegistrationForm from "@/components/register/RegistrationForm";
import BalanceCheck from "@/components/register/BalanceCheck";
import DeployStep from "@/components/register/DeployStep";
import SuccessStep from "@/components/register/SuccessStep";

const stepLabels = ["Details", "Gas Check", "Deploy", "Done"];

function stepIndex(step: string): number {
  switch (step) {
    case "form": return 0;
    case "balance": return 1;
    case "deploying": return 2;
    case "success": return 3;
    case "error": return 2;
    default: return 0;
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { role, isLoading, address } = useAuth();
  const {
    step, formData, walletBalance, isCheckingBalance,
    deployResult, errorMessage,
    proceedToBalance, deploy, reset, checkBalance, goBackToBalance,
  } = useRegister();

  useEffect(() => {
    if (isLoading) return;
    if (role === "org_owner") { navigate("/dashboard", { replace: true }); return; }
    if (role === "protocol_admin") { navigate("/admin", { replace: true }); return; }
  }, [role, isLoading, navigate]);

  const current = stepIndex(step);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0A0E1A] py-8 sm:py-12 px-4 text-center">
        <Shield className="text-[#1A56DB] mx-auto" style={{ width: 40, height: 40 }} />
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4">Register Your Organization</h1>
        <p className="text-gray-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
          Deploy your own transparent treasury on Avalanche. Receive grants, pay your team, and prove your impact.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
          {stepLabels.map((label, i) => {
            const isCompleted = i < current;
            const isActive = i === current;
            return (
              <div key={label} className="flex items-center gap-1 sm:gap-2">
                {i > 0 && (
                  <div className={`h-px w-6 sm:w-8 ${isCompleted ? "bg-[#057A55]" : "bg-gray-200"}`} />
                )}
                <div className="flex items-center gap-1.5">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-[#057A55] text-white flex items-center justify-center">
                      <CheckCircle2 style={{ width: 14, height: 14 }} />
                    </div>
                  ) : isActive ? (
                    <div className="w-7 h-7 rounded-full bg-[#1A56DB] text-white text-xs flex items-center justify-center font-semibold">
                      {i + 1}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center">
                      {i + 1}
                    </div>
                  )}
                  <span className={`text-xs font-medium hidden sm:inline ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        {step === "form" && <RegistrationForm onSubmit={proceedToBalance} />}

        {step === "balance" && (
          <BalanceCheck
            walletBalance={walletBalance}
            isLoading={isCheckingBalance}
            onProceed={deploy}
            onBack={reset}
            onRefreshBalance={async () => {
              if (address) await checkBalance(address);
            }}
          />
        )}

        {step === "deploying" && <DeployStep orgName={formData.name} />}

        {step === "success" && deployResult && (
          <SuccessStep result={deployResult} onGoToDashboard={() => navigate("/dashboard")} />
        )}

        {step === "error" && (
          <DeployStep
            orgName={formData.name}
            errorMessage={errorMessage}
            onRetry={deploy}
            onBack={goBackToBalance}
          />
        )}
      </div>
    </div>
  );
}
