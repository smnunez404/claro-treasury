import { Building2, CheckCircle, MapPin, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import type { OrgFull, OrgFinancials } from "@/types/claro";
import { SNOWTRACE_URL, truncateAddress } from "@/lib/constants";

interface Props {
  org: OrgFull;
  financials: OrgFinancials | null | undefined;
}

export default function OrgProfileHeader({ org }: Props) {
  const orgType = org.org_type
    ? org.org_type.charAt(0).toUpperCase() + org.org_type.slice(1)
    : null;

  const copyAddress = () => {
    navigator.clipboard.writeText(org.contract_address);
    toast.success("Address copied to clipboard");
  };

  return (
    <>
      {/* Cover */}
      <div className="h-32 md:h-64 relative overflow-hidden">
        {org.cover_image_url ? (
          <img src={org.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A0E1A] to-[#1A56DB]" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header content */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="relative -mt-12 flex items-end gap-4">
            {/* Logo */}
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
              {org.logo_url ? (
                <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Building2 className="text-gray-300" style={{ width: 40, height: 40 }} />
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1 pt-14 md:pt-0 md:ml-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{org.name}</h1>
                {org.verified ? (
                  <span className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle style={{ width: 12, height: 12 }} />
                    Verified
                  </span>
                ) : (
                  <span className="bg-gray-100 border border-gray-200 text-gray-500 text-xs px-3 py-1 rounded-full">
                    Pending verification
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin style={{ width: 12, height: 12 }} />
                  {org.country}
                </span>
                {orgType && (
                  <>
                    <span>·</span>
                    <span>{orgType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {org.description && (
            <p className="mt-4 max-w-3xl text-sm text-gray-700 leading-relaxed">{org.description}</p>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1 active:scale-[0.97] transition-all">
                  <ExternalLink style={{ width: 12, height: 12 }} /> Website
                </a>
              )}
              {org.social_twitter && (
                <a href={`https://twitter.com/${org.social_twitter}`} target="_blank" rel="noopener noreferrer" className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-3 py-1.5 text-xs font-medium active:scale-[0.97] transition-all">
                  𝕏
                </a>
              )}
              {org.social_instagram && (
                <a href={`https://instagram.com/${org.social_instagram}`} target="_blank" rel="noopener noreferrer" className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md px-3 py-1.5 text-xs font-medium active:scale-[0.97] transition-all">
                  Instagram
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
              <a
                href={`${SNOWTRACE_URL}/address/${org.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700 transition-colors"
              >
                View on Snowtrace <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
              <button
                onClick={copyAddress}
                className="bg-gray-100 text-gray-600 text-xs font-mono px-3 py-1 rounded-full hover:bg-gray-200 active:scale-[0.97] transition-all flex items-center gap-1"
              >
                {truncateAddress(org.contract_address)}
                <Copy style={{ width: 10, height: 10 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
