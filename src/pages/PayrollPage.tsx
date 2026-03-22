import { Users } from "lucide-react";

export default function PayrollPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
      <p className="text-sm text-muted-foreground">On-chain salary payments to your team</p>
      <div className="flex flex-col items-center py-16 text-center">
        <Users className="text-gray-300" style={{ width: 48, height: 48 }} />
        <p className="text-sm font-semibold text-foreground mt-4">No employees added yet</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Add your first team member to execute on-chain payroll.
        </p>
        <button className="bg-primary text-primary-foreground mt-6 px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
          Add Employee
        </button>
      </div>
    </div>
  );
}
