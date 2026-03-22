import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import type { TeamMember } from "@/types/claro";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  orgContractAddress: string;
}

export default function TeamMemberForm({ isOpen, onClose, member, orgContractAddress }: Props) {
  const { mutate, isLoading, error, clearError } = useOrgWrite();

  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [avatar_url, setAvatarUrl] = useState(member?.avatar_url ?? "");
  const [wallet_address, setWalletAddress] = useState(member?.wallet_address ?? "");
  const [sort_order, setSortOrder] = useState(String(member?.sort_order ?? 0));
  const [nameError, setNameError] = useState<string | null>(null);

  useState(() => {
    setName(member?.name ?? "");
    setRole(member?.role ?? "");
    setBio(member?.bio ?? "");
    setAvatarUrl(member?.avatar_url ?? "");
    setWalletAddress(member?.wallet_address ?? "");
    setSortOrder(String(member?.sort_order ?? 0));
    setNameError(null);
    clearError();
  });

  async function handleSubmit() {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError(null);

    const action = member ? "update_team_member" : "create_team_member";
    const result = await mutate(action, {
      id: member?.id,
      name: name.trim(),
      role: role.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatar_url.trim() || null,
      wallet_address: wallet_address.trim() || null,
      sort_order: Number(sort_order) || 0,
    }, [["my-team", orgContractAddress]]);
    if (result.success) {
      onClose();
      clearError();
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) { onClose(); clearError(); } }}>
      <SheetContent side="right" className="sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{member ? "Edit Team Member" : "Add Team Member"}</SheetTitle>
          <SheetDescription>{member ? "Update member details." : "Add someone to your public team."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          <Field label="Full Name *">
            <input value={name} onChange={e => { setName(e.target.value); setNameError(null); }} placeholder="María García" className={`${inputCls} ${nameError ? "border-red-400" : ""}`} />
            {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
          </Field>
          <Field label="Role / Position">
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Research Lead, Developer, Coordinator..." className={inputCls} />
          </Field>
          <Field label="Bio">
            <textarea rows={2} value={bio} onChange={e => setBio(e.target.value)} placeholder="Short description about this person..." className={inputCls} />
          </Field>
          <Field label="Photo URL" desc="Direct link to profile photo (square image, min 200×200px)">
            <input type="url" value={avatar_url} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className={inputCls} />
            {avatar_url && (
              <div className="mt-2 w-12 h-12 rounded-full border border-gray-200 overflow-hidden">
                <img src={avatar_url} className="w-full h-full object-cover" alt="Preview" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}
          </Field>
          <Field label="Wallet Address" desc="Optional — their Avalanche wallet address for public display">
            <input value={wallet_address} onChange={e => setWalletAddress(e.target.value)} placeholder="0x..." className={inputCls} />
          </Field>
          <Field label="Display Order" desc="Lower number = appears first (0 is first)">
            <input type="number" min="0" value={sort_order} onChange={e => setSortOrder(e.target.value)} placeholder="0" className={inputCls} />
          </Field>
        </div>

        <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { onClose(); clearError(); }} className="flex-1 py-2 rounded-md text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2 rounded-md text-sm font-medium bg-[#1A56DB] text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {member ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const inputCls = "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {children}
      {desc && <p className="text-xs text-gray-400 mt-1">{desc}</p>}
    </div>
  );
}
