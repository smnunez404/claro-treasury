import { Gift, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { GrantOnChain } from "@/types/claro";

interface Props {
  grants: GrantOnChain[];
  isLoading: boolean;
}

export default function GrantsList({ grants, isLoading }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Grants</h2>
        {grants.length > 0 && (
          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {grants.length} active
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && grants.length === 0 && (
        <div className="flex flex-col items-center py-10">
          <Gift className="text-muted-foreground/40" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-medium text-foreground mt-3">No grants created yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create grants from the Grants page to receive transparent funding.</p>
          <Link to="/grants" className="mt-4 border border-border bg-card text-foreground hover:bg-accent rounded-md px-4 py-2 text-xs font-medium transition-colors">
            Go to Grants
          </Link>
        </div>
      )}

      {!isLoading && grants.length > 0 && (
        <div className="space-y-3">
          {grants.map((grant) => {
            const pct = grant.depositedAvax > 0
              ? (grant.disbursedAvax / grant.depositedAvax * 100)
              : 0;

            return (
              <div key={grant.projectId} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{grant.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      #{grant.projectId.slice(0, 12)}...
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    grant.availableAvax > 0
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {grant.availableAvax > 0 ? grant.availableUsd + " available" : "Fully disbursed"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Disbursed {grant.disbursedUsd}</span>
                    <span>Total {grant.depositedUsd}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(pct, 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp style={{ width: 10, height: 10 }} /> Raised: {grant.depositedUsd}
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight style={{ width: 10, height: 10 }} /> Paid out: {grant.disbursedUsd}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
