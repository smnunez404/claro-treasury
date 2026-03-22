import type { TeamMember } from "@/types/claro";

interface Props {
  team: TeamMember[];
  isLoading: boolean;
}

export default function TeamSection({ team, isLoading }: Props) {
  if (!isLoading && team.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {team.map(m => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shrink-0">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-500">{m.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                {m.role && <p className="text-xs text-gray-500">{m.role}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
