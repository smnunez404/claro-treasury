import { Award, ExternalLink } from "lucide-react";
import { truncateAddress, SNOWTRACE_URL } from "@/lib/constants";
import type { HypercertData } from "@/types/claro";

interface Props {
  cert: HypercertData;
}

export default function HypercertVerification({ cert }: Props) {
  const certDate = cert.certifiedAt
    ? new Date(cert.certifiedAt).toLocaleDateString()
    : "—";

  const items = [
    {
      label: "Certificate TX",
      value: truncateAddress(cert.txHash),
      mono: true,
      link: `https://sepolia.basescan.org/tx/${cert.txHash}`,
    },
    {
      label: "Certified on",
      value: "Base Sepolia",
      mono: false,
      badge: "Ethereum L2",
    },
    {
      label: "Certified by",
      value: cert.certifiedBy ? truncateAddress(cert.certifiedBy) : "CLARO Protocol",
      mono: !!cert.certifiedBy,
    },
    {
      label: "Date",
      value: certDate,
      mono: false,
    },
    {
      label: "Treasury",
      value: truncateAddress(cert.orgContract),
      mono: true,
      link: `${SNOWTRACE_URL}/address/${cert.orgContract}`,
    },
  ];

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-amber-500" style={{ width: 18, height: 18 }} />
        <p className="text-base font-semibold text-gray-900">On-Chain Certificate</p>
      </div>

      <div className="space-y-3">
        {items.map(({ label, value, mono, link, badge }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${mono ? "font-mono" : "font-medium"} text-gray-700`}>
                {value}
              </span>
              {badge && (
                <span className="bg-blue-50 text-[#1A56DB] text-xs px-2 py-0.5 rounded">
                  {badge}
                </span>
              )}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1A56DB]"
                >
                  <ExternalLink style={{ width: 12, height: 12 }} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <a
        href={`https://sepolia.basescan.org/tx/${cert.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
      >
        <Award style={{ width: 12, height: 12 }} />
        Verify on Basescan
      </a>
    </div>
  );
}
