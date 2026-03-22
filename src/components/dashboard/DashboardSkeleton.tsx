export default function DashboardSkeleton() {
  return (
    <div className="px-4 py-6 md:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="h-7 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted/60 rounded animate-pulse mt-2" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl h-28 animate-pulse" />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl h-48 animate-pulse border border-border" />
          <div className="bg-card rounded-xl h-32 animate-pulse border border-border" />
        </div>
        <div>
          <div className="bg-card rounded-xl h-40 animate-pulse border border-border" />
        </div>
      </div>
    </div>
  );
}
