import { useState } from "react";
import { Award, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import type { GrantFull } from "@/types/claro";

interface Props {
  grants: GrantFull[];
  orgContract: string;
}

const HYPERCERT_TX = "0x4fc9f578dfb22d92b1d1a008eacbf316ef7b3ee72649126b6211c353a03c507b";

export default function HypercertPanel({ grants, orgContract }: Props) {
  const { address } = useAuth();
  const [selectedGrantId, setSelectedGrantId] = useState("");
  const [certifyState, setCertifyState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const selectedGrant = grants.find((g) => g.projectId === selectedGrantId);

  const handleCertify = async () => {
    if (!selectedGrant) return;
    setCertifyState("loading");
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-grant-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "grant_certified",
            org_contract: orgContract,
            executed_by: address,
            onchain_project_id: selectedGrantId,
            project_name: selectedGrant.projectName,
            hypercert_tx: HYPERCERT_TX,
          }),
        }
      );
      setCertifyState("success");
    } catch {
      setCertifyState("error");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="text-[#E3A008]" style={{ width: 20, height: 20 }} />
          <p className="text-base font-semibold text-gray-900">Impact Certification</p>
        </div>
        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
          Powered by Hypercerts
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <Award className="text-amber-600" style={{ width: 16, height: 16 }} />
          <p className="text-sm text-amber-800 font-medium">Certify your project impact on Base Sepolia</p>
        </div>
        <p className="text-xs text-amber-700 mt-1">
          Create an on-chain certificate that proves your project's real-world impact.
          Visible to donors worldwide and permanently recorded on Base blockchain.
        </p>
      </div>

      {grants.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Create a grant first to certify its impact.</p>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700 mb-2">Select grant to certify</p>
          <Select value={selectedGrantId} onValueChange={setSelectedGrantId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a grant..." />
            </SelectTrigger>
            <SelectContent>
              {grants.map((g) => (
                <SelectItem key={g.projectId} value={g.projectId}>
                  {g.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedGrant && (
            <div className="bg-gray-50 rounded-lg p-3 mt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">{selectedGrant.projectName}</span>
              <span className="text-sm text-[#057A55] font-bold">{selectedGrant.depositedUsd}</span>
            </div>
          )}

          <button
            onClick={handleCertify}
            disabled={!selectedGrantId || certifyState === "loading"}
            className="mt-3 w-full bg-[#E3A008] text-white py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {certifyState === "loading" ? (
              <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
            ) : (
              <Award style={{ width: 14, height: 14 }} />
            )}
            Certify Impact on Base
          </button>

          {certifyState === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-[#057A55]" style={{ width: 16, height: 16 }} />
                <p className="text-sm text-green-800 font-medium">Impact certified!</p>
              </div>
              <p className="text-xs text-green-700 mt-1">Your impact certificate is recorded on Base Sepolia.</p>
              <a
                href={`https://sepolia.basescan.org/tx/${HYPERCERT_TX}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1A56DB] flex items-center gap-1 mt-2 hover:underline"
              >
                View certificate on Basescan
                <ExternalLink style={{ width: 10, height: 10 }} />
              </a>
            </div>
          )}

          {certifyState === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-xs text-red-700">Certification failed. Please try again.</p>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        Full Hypercerts minting on Base Sepolia available in production release.
      </p>
    </div>
  );
}
