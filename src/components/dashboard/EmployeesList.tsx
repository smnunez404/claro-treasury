import { Users } from "lucide-react";
import { truncateAddress } from "@/lib/constants";
import { Link } from "react-router-dom";
import type { EmployeeOnChain } from "@/types/claro";

interface Props {
  employees: EmployeeOnChain[];
  isLoading: boolean;
}

export default function EmployeesList({ employees, isLoading }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Team</h2>
        <Link to="/payroll" className="text-xs text-primary hover:underline">Manage</Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && employees.length === 0 && (
        <div className="flex flex-col items-center py-10">
          <Users className="text-muted-foreground/40" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-medium text-foreground mt-3">No team members yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add from Payroll page.</p>
          <Link to="/payroll" className="mt-4 border border-border bg-card text-foreground hover:bg-accent rounded-md px-4 py-2 text-xs font-medium transition-colors">
            Go to Payroll
          </Link>
        </div>
      )}

      {!isLoading && employees.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {employees.map((emp) => (
            <div key={emp.wallet} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[#1A56DB]">
                  {emp.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{truncateAddress(emp.wallet)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-foreground">{emp.salaryUsd}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
