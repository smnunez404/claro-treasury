export default function PayrollSkeleton() {
  return (
    <div className="bg-background min-h-screen px-4 py-6 md:px-8">
      <div className="flex justify-between">
        <div className="h-7 w-24 bg-muted rounded animate-pulse" />
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="h-20 bg-white border border-border rounded-xl animate-pulse mt-6" />

      <div className="bg-white border border-border rounded-xl mt-6 overflow-hidden">
        <div className="h-10 bg-muted/50 border-b border-border" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 border-b border-border/50 animate-pulse" />
        ))}
      </div>

      <div className="mt-6">
        <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-white border border-border/50 rounded-lg animate-pulse mb-2" />
        ))}
      </div>
    </div>
  );
}
