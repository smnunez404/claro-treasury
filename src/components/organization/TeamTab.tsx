import { useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useOrgWrite } from "@/hooks/useOrgWrite";
import { truncateAddress } from "@/lib/constants";
import TeamMemberForm from "./TeamMemberForm";
import type { TeamMember } from "@/types/claro";

interface Props {
  team: TeamMember[];
  isLoading: boolean;
  orgContractAddress: string;
}

export default function TeamTab({ team, isLoading, orgContractAddress }: Props) {
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const { mutate } = useOrgWrite();

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
        <button
          onClick={() => { setEditingMember(null); setMemberSheetOpen(true); }}
          className="bg-[#1A56DB] text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#1648c0] active:scale-[0.97] transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map(i => <div key={i} className="h-16 animate-pulse bg-white border border-gray-200 rounded-xl" />)}
        </div>
      )}

      {!isLoading && team.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Users className="mx-auto text-gray-300" style={{ width: 40, height: 40 }} strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-900 mt-4">No team members yet</p>
          <p className="text-sm text-gray-500 mt-2">Add your team so donors know who is behind the work.</p>
        </div>
      )}

      {!isLoading && team.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.map(m => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full flex-shrink-0 border border-gray-200 overflow-hidden">
                {m.avatar_url ? (
                  <img src={m.avatar_url} className="w-full h-full object-cover" alt={m.name} />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#1A56DB]">{m.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                {m.role && <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>}
                {m.bio && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{m.bio}</p>}
                {m.wallet_address && (
                  <p className="text-xs font-mono text-gray-400 truncate mt-1">{truncateAddress(m.wallet_address)}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => { setEditingMember(m); setMemberSheetOpen(true); }} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                  <Pencil className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded hover:bg-gray-100" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name} from team?</AlertDialogTitle>
            <AlertDialogDescription>They will no longer appear on your public profile.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={async () => {
              if (deleteTarget) {
                await mutate("delete_team_member", { id: deleteTarget.id }, [["my-team", orgContractAddress]]);
                setDeleteTarget(null);
              }
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TeamMemberForm
        isOpen={memberSheetOpen}
        onClose={() => { setMemberSheetOpen(false); setEditingMember(null); }}
        member={editingMember}
        orgContractAddress={orgContractAddress}
      />
    </div>
  );
}
