import { Building2, CheckCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { OrgCard as OrgCardType } from "@/types/claro";
import SupportButton from "./SupportButton";

interface Props {
  org: OrgCardType;
  logoUrl: string | null;
  website: string | null;
}

function ScoreBadge({ score }: { score: number }) {
  let classes = "bg-gray-100 border-gray-200 text-gray-700";
  if (score >= 80) classes = "bg-green-50 border-green-200 text-green-700";
  else if (score >= 50) classes = "bg-amber-50 border-amber-200 text-amber-700";

  return (
    <span className={`border font-bold text-sm px-3 py-1 rounded-lg ${classes}`}>
      {score}/100
    </span>
  );
}

function formatUsd(value: number): string {
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrgCard({ org, logoUrl, website }: Props) {
  const orgType = org.org_type
    ? org.org_type.charAt(0).toUpperCase() + org.org_type.slice(1)
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={org.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <Building2 className="text-gray-300" style={{ width: 36, height: 36 }} />
        )}
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
            org.verified
              ? "bg-[#057A55] text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {org.verified && <CheckCircle style={{ width: 10, height: 10 }} />}
          {org.verified ? "Verified" : "Pending"}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col">
        <p className="text-base font-semibold text-gray-900 leading-tight truncate">{org.name}</p>

        <div className="mt-1 flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="text-gray-400" style={{ width: 12, height: 12 }} />
            {org.country}
          </span>
          {orgType && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {orgType}
            </span>
          )}
        </div>

        {org.description ? (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {org.description}
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-400 italic">No description available</p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {formatUsd(org.total_received_usd ?? 0)}
            </p>
            <p className="text-xs text-gray-500">Raised</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{org.total_donors ?? 0}</p>
            <p className="text-xs text-gray-500">Donors</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{org.projects ?? 0}</p>
            <p className="text-xs text-gray-500">Projects</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">Transparency Score</span>
          <ScoreBadge score={org.transparency_score ?? 0} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 mt-auto pt-4 border-t border-gray-100 flex gap-2">
        <Link
          to="/explore"
          className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md py-2 text-xs font-medium text-center active:scale-[0.97] transition-all"
        >
          View Details
        </Link>
        <SupportButton orgContract={org.contract_address} />
      </div>
    </div>
  );
}
