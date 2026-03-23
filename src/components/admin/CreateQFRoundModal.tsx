import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { Zap, Loader2, CheckCircle2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CLARO_MATCHING_ABI } from "@/lib/abis";
import { MATCHING_ADDRESS, CHAIN_ID, AVAX_TO_USD } from "@/lib/constants";
import { supabase } from "@/lib/supabaseClient";
import type { AdminOrgRow, CreateRoundStep } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orgs: AdminOrgRow[];
}

export default function CreateQFRoundModal({ isOpen, onClose, orgs }: Props) {
  const { wallets } = useWallets();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<CreateRoundStep>("idle");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [durationHours, setDurationHours] = useState(72);
  const [matchingPoolAvax, setMatchingPoolAvax] = useState(0.03);
  const [error, setError] = useState<string | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["all-projects-for-qf"],
    enabled: isOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_projects")
        .select("id, name, onchain_project_id, org_contract")
        .eq("is_active", true)
        .not("onchain_project_id", "is", null);
      if (error) throw error;

      // Enrich with org names
      const orgContracts = [...new Set((data ?? []).map((p) => p.org_contract))];
      const { data: orgData } = await supabase
        .from("claro_organizations")
        .select("contract_address, name")
        .in("contract_address", orgContracts);

      const orgNameMap = new Map((orgData ?? []).map((o) => [o.contract_address, o.name]));

      return (data ?? []).map((p) => ({
        ...p,
        orgName: orgNameMap.get(p.org_contract) ?? p.org_contract,
      }));
    },
  });

  const projects = projectsQuery.data ?? [];

  function toggleProject(onchainId: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(onchainId)
        ? prev.filter((id) => id !== onchainId)
        : [...prev, onchainId]
    );
  }

  const [confirmSubStep, setConfirmSubStep] = useState<1 | 2>(1);

  async function handleCreate() {
    if (selectedProjectIds.length === 0) return;
    setStep("confirming");
    setConfirmSubStep(1);
    setError(null);

    try {
      const wallet = wallets[0];
      if (!wallet) throw new Error("No wallet connected");

      await wallet.switchChain(CHAIN_ID);
      const ethProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethProvider);
      const signer = await provider.getSigner();

      const matching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, signer);

      // Step 1: createRound (no value)
      const durationSeconds = BigInt(durationHours * 3600);
      const tx1 = await matching.createRound(durationSeconds, selectedProjectIds);
      await tx1.wait(1);

      // Get the new roundId
      const readProvider = new ethers.JsonRpcProvider(RPC_URL);
      const readMatching = new ethers.Contract(MATCHING_ADDRESS, CLARO_MATCHING_ABI, readProvider);
      const newRoundId = await readMatching.roundCount();

      // Step 2: fundMatchingPool (send AVAX)
      setConfirmSubStep(2);
      const matchingWei = ethers.parseEther(matchingPoolAvax.toFixed(6));
      const tx2 = await matching.fundMatchingPool(newRoundId, { value: matchingWei });
      await tx2.wait(1);

      queryClient.invalidateQueries({ queryKey: ["qf-round"] });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create round";
      const isRejected = message.toLowerCase().includes("rejected") ||
                         message.toLowerCase().includes("denied");
      setError(isRejected ? "Transaction cancelled." : message);
      setStep("error");
    }
  }

  function handleClose() {
    setStep("idle");
    setError(null);
    setSelectedProjectIds([]);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {(step === "idle" || step === "error") && (
          <>
            <DialogTitle>Create QF Round</DialogTitle>
            <DialogDescription>
              Start a Quadratic Funding round. Projects with more unique donors receive more matching.
            </DialogDescription>

            {/* Projects */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Select projects to include</p>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No projects with on-chain IDs found. Add projects in /organization first.
                </p>
              ) : (
                projects.map((project) => (
                  <label
                    key={project.onchain_project_id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedProjectIds.includes(project.onchain_project_id!)}
                      onCheckedChange={() => toggleProject(project.onchain_project_id!)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">
                        {project.orgName} · {project.onchain_project_id}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Duration (hours)</label>
                <Input
                  type="number"
                  min={1}
                  max={720}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {durationHours}h = {(durationHours / 24).toFixed(1)} days
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Matching Pool (AVAX)</label>
                <Input
                  type="number"
                  min={0.001}
                  step={0.001}
                  value={matchingPoolAvax}
                  onChange={(e) => setMatchingPoolAvax(Number(e.target.value))}
                />
                <p className="text-xs text-gray-400 mt-1">
                  ≈ {(matchingPoolAvax * AVAX_TO_USD).toFixed(2)} USD
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <Info className="text-blue-500 shrink-0 mt-0.5" style={{ width: 14, height: 14 }} />
              <p className="text-xs text-blue-700">
                The matching pool amount will be deducted from your wallet as AVAX. Make sure your Protocol Admin wallet has enough balance.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={selectedProjectIds.length === 0}
                className="flex-1 bg-[#1A56DB] text-white rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#1A56DB]/90"
              >
                <Zap style={{ width: 14, height: 14 }} />
                Create Round
              </button>
            </div>
          </>
        )}

        {step === "confirming" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="animate-spin text-[#1A56DB]" style={{ width: 32, height: 32 }} />
            <p className="text-sm text-gray-700 mt-3 text-center">Creating QF Round...</p>
            <p className="text-xs text-gray-400 mt-1 text-center">Please confirm in your wallet.</p>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {selectedProjectIds.length} projects · {durationHours}h · {matchingPoolAvax} AVAX pool
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="text-[#057A55]" style={{ width: 48, height: 48 }} />
            <p className="text-xl font-bold text-gray-900 mt-4 text-center">QF Round Created!</p>
            <p className="text-sm text-gray-500 text-center mt-2">
              {selectedProjectIds.length} projects · {durationHours} hours · ${(matchingPoolAvax * AVAX_TO_USD).toFixed(2)} matching pool
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Donors can now contribute from the /explore page.
            </p>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["qf-round"] });
                handleClose();
              }}
              className="bg-[#057A55] text-white w-full py-2.5 rounded-md mt-6 text-sm font-medium"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
