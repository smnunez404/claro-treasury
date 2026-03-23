import { useParams, Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Link as LinkIcon, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useHypercert } from "@/hooks/useHypercert";
import HypercertSkeleton from "@/components/hypercert/HypercertSkeleton";
import HypercertHero from "@/components/hypercert/HypercertHero";
import HypercertProjectCard from "@/components/hypercert/HypercertProjectCard";
import HypercertImpactData from "@/components/hypercert/HypercertImpactData";
import HypercertDonations from "@/components/hypercert/HypercertDonations";
import HypercertVerification from "@/components/hypercert/HypercertVerification";

export default function HypercertPage() {
  const txHash = useParams<{ txHash: string }>().txHash ?? "";
  const { cert, isLoading, isError } = useHypercert(txHash);

  if (isLoading) return <HypercertSkeleton />;

  if (isError || !cert) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="text-red-400 mx-auto" style={{ width: 48, height: 48 }} />
          <p className="text-xl font-bold text-gray-900 mt-4">Certificate not found</p>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            This Hypercert could not be found. The TX hash may be incorrect.
          </p>
          <Link to="/explore" className="text-sm text-[#1A56DB] mt-4 underline inline-block">
            View all certified projects
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor =
    cert.transparencyScore >= 80
      ? "text-[#057A55]"
      : cert.transparencyScore >= 50
      ? "text-[#E3A008]"
      : "text-gray-500";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0A0E1A] py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
            <Link to="/explore" className="hover:text-gray-300">Explore</Link>
            <ChevronRight style={{ width: 10, height: 10 }} />
            <Link to={`/org/${cert.orgContract}`} className="hover:text-gray-300">
              {cert.orgName}
            </Link>
            <ChevronRight style={{ width: 10, height: 10 }} />
            <span className="text-gray-400">Impact Certificate</span>
          </div>
          <HypercertHero cert={cert} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <HypercertProjectCard cert={cert} />
            <HypercertImpactData cert={cert} />
            <HypercertDonations cert={cert} />
          </div>

          {/* Right */}
          <div className="space-y-6">
            <HypercertVerification cert={cert} />

            {/* Transparency Score */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-3">Transparency Score</p>
              <p className={`text-5xl font-bold text-center mt-2 ${scoreColor}`}>
                {cert.transparencyScore}
                <span className="text-lg font-normal text-gray-400">/100</span>
              </p>
              <div className="h-2 bg-gray-100 rounded-full mt-3">
                <div
                  className="h-full bg-[#057A55] rounded-full transition-all"
                  style={{ width: `${cert.transparencyScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Based on on-chain activity, milestones, and public data
              </p>
            </div>

            {/* Share */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-3">Share this certificate</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied!");
                  }}
                  className="border border-gray-200 text-gray-700 text-xs w-full py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <LinkIcon style={{ width: 12, height: 12 }} />
                  Copy certificate link
                </button>
                <a
                  href={`https://sepolia.basescan.org/tx/${cert.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#1A56DB] text-[#1A56DB] text-xs w-full py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <ExternalLink style={{ width: 12, height: 12 }} />
                  Verify on Basescan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
