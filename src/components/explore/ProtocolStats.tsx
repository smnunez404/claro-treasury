import type { ProtocolStats as ProtocolStatsType } from "@/types/claro";

interface Props {
  stats: ProtocolStatsType | undefined;
  isLoading: boolean;
  isError: boolean;
}

function StatItem({
  value,
  label,
  color = "text-gray-900",
  showDivider = false,
}: {
  value: string;
  label: string;
  color?: string;
  showDivider?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center ${showDivider ? "md:border-l md:border-gray-200 md:pl-12" : ""}`}>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

export default function ProtocolStats({ stats, isLoading, isError }: Props) {
  return (
    <section className="bg-white border-y border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 flex justify-center gap-8 md:gap-12 flex-wrap">
        {isLoading ? (
          <>
            <div className="animate-pulse w-24 h-6 rounded bg-gray-200" />
            <div className="animate-pulse w-24 h-6 rounded bg-gray-200" />
            <div className="animate-pulse w-24 h-6 rounded bg-gray-200" />
          </>
        ) : (
          <>
            <StatItem
              value={isError ? "--" : String(stats?.totalOrgs ?? 0)}
              label="Organizations"
            />
            <StatItem
              value={isError ? "--" : String(stats?.verifiedOrgs ?? 0)}
              label="Verified"
              color="text-[#057A55]"
              showDivider
            />
            <StatItem
              value={isError ? "--" : String(stats?.totalTransactions ?? 0)}
              label="On-chain Transactions"
              showDivider
            />
          </>
        )}
      </div>
    </section>
  );
}
