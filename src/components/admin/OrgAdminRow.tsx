import { CheckCircle2, Clock, ExternalLink, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { truncateAddress, SNOWTRACE_URL } from "@/lib/constants";
import type { AdminOrgRow } from "@/types/claro";

interface Props {
  org: AdminOrgRow;
  isVerifying: boolean;
  onVerify: () => void;
}

export default function OrgAdminRow({ org, isVerifying, onVerify }: Props) {
  const scoreColor =
    org.transparency_score >= 80
      ? "bg-green-50 text-green-700 border-green-200"
      : org.transparency_score >= 50
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Organization */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">{org.name}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={10} />
            {org.country}
          </span>
        </div>
      </td>

      {/* Contract */}
      <td className="px-6 py-4 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-600">
            {truncateAddress(org.contract_address)}
          </span>
          <ExternalLink
            size={12}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={() =>
              window.open(`${SNOWTRACE_URL}/address/${org.contract_address}`, "_blank")
            }
          />
        </div>
      </td>

      {/* Owner */}
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="font-mono text-xs text-gray-500">
          {truncateAddress(org.owner_address)}
        </span>
      </td>

      {/* Score */}
      <td className="px-6 py-4 hidden md:table-cell">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${scoreColor}`}>
          {org.transparency_score}/100
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        {org.verified ? (
          <div>
            <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <CheckCircle2 size={10} />
              Verified
            </span>
            {org.verified_at && (
              <span className="text-xs text-gray-400 mt-0.5 block">
                {new Date(org.verified_at).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Clock size={10} />
            Pending
          </span>
        )}
      </td>

      {/* Registered */}
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="text-xs text-gray-500">
          {new Date(org.created_at).toLocaleDateString()}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {!org.verified ? (
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="bg-[#057A55] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#046c4e] active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ShieldCheck size={12} />
              )}
              Verify
            </button>
          ) : (
            <span className="bg-green-50 text-green-600 text-xs px-3 py-1.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} />
              Verified
            </span>
          )}
          <a
            href={`/org/${org.contract_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1.5 rounded-md active:scale-[0.97] transition-all"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </td>
    </tr>
  );
}
