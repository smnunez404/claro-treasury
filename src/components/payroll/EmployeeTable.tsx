import { Users } from "lucide-react";
import { Table, TableHeader, TableHead, TableBody, TableRow } from "@/components/ui/table";
import EmployeeRow from "./EmployeeRow";
import type { EmployeeOnChain } from "@/types/claro";

interface Props {
  employees: EmployeeOnChain[];
  isLoading: boolean;
  onPayEmployee: (emp: EmployeeOnChain) => void;
  snowtraceUrl: string;
}

export default function EmployeeTable({ employees, isLoading, onPayEmployee, snowtraceUrl }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Employees</h2>
        <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
          {employees.length} active
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse bg-white border border-border rounded-xl" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-10 text-center">
          <Users className="text-muted-foreground/30 mx-auto" style={{ width: 40, height: 40 }} />
          <p className="text-sm font-semibold text-foreground mt-4">No employees yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first team member to enable on-chain payroll.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Employee
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                  Wallet
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Monthly Salary
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <EmployeeRow
                  key={emp.wallet}
                  employee={emp}
                  onPay={() => onPayEmployee(emp)}
                  snowtraceUrl={snowtraceUrl}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
