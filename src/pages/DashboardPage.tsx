import { LayoutDashboard, TrendingUp, Users, Gift } from "lucide-react";

const cards = [
  { icon: LayoutDashboard, label: "Treasury Balance", value: "$0.00", sub: "USD" },
  { icon: TrendingUp, label: "Total Raised", value: "$0.00", sub: "USD" },
  { icon: Users, label: "Team Members", value: "0", sub: "Active employees" },
  { icon: Gift, label: "Active Grants", value: "0", sub: "Funding rounds" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Overview of your treasury</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <c.icon className="text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">{c.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground italic mt-6">
        Real-time data connects in Sprint 4
      </p>
    </div>
  );
}
