import { Award, Calendar, CheckCircle2 } from "lucide-react";
import type { HypercertData } from "@/types/claro";

interface Props {
  cert: HypercertData;
}

export default function HypercertHero({ cert }: Props) {
  const certDate = cert.certifiedAt
    ? new Date(cert.certifiedAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="flex items-start gap-4 flex-col sm:flex-row">
      <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
        <Award className="text-white" style={{ width: 32, height: 32 }} />
      </div>

      <div className="flex-1">
        <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-1">
          Impact Certificate
        </p>
        <h1 className="text-2xl font-bold text-white">{cert.projectName}</h1>
        <div className="text-gray-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
          <span>{cert.orgName} · {cert.orgCountry}</span>
          {cert.orgVerified && (
            <span className="flex items-center gap-1 text-[#057A55]">
              <CheckCircle2 style={{ width: 12, height: 12 }} />
              Verified Organization
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap mt-3">
          <span className="bg-green-900/40 border border-green-700 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Award style={{ width: 10, height: 10 }} />
            Certified on Base Sepolia
          </span>
          {certDate && (
            <span className="bg-[#1A56DB]/20 border border-[#1A56DB]/40 text-blue-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Calendar style={{ width: 10, height: 10 }} />
              Certified {certDate}
            </span>
          )}
          {cert.projectCategory && (
            <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
              {cert.projectCategory}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
