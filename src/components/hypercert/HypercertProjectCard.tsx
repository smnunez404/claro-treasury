import { Building2, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { HypercertData } from "@/types/claro";

interface Props {
  cert: HypercertData;
}

export default function HypercertProjectCard({ cert }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <p className="text-base font-semibold text-gray-900">About this Project</p>
        {cert.projectStatus === "active" ? (
          <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {cert.projectStatus}
          </span>
        )}
      </div>

      {cert.projectDescription && (
        <p className="text-sm text-gray-700 leading-relaxed">{cert.projectDescription}</p>
      )}

      {cert.websiteUrl && (
        <a
          href={cert.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#1A56DB] flex items-center gap-1 mt-3 hover:underline"
        >
          <ExternalLink style={{ width: 10, height: 10 }} />
          Project website
        </a>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0A0E1A] rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="text-[#1A56DB]" style={{ width: 18, height: 18 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{cert.orgName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {cert.orgCountry}
            {cert.orgVerified && (
              <>
                <span>·</span>
                <CheckCircle2 className="text-[#057A55]" style={{ width: 10, height: 10 }} />
                <span>Verified by CLARO Protocol</span>
              </>
            )}
          </p>
        </div>
        <Link
          to={`/org/${cert.orgContract}`}
          className="text-xs text-[#1A56DB] ml-auto flex items-center gap-1 hover:underline flex-shrink-0"
        >
          View profile
          <ExternalLink style={{ width: 10, height: 10 }} />
        </Link>
      </div>
    </div>
  );
}
