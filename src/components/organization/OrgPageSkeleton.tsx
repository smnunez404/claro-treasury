export default function OrgPageSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8">
      <div className="h-7 w-44 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />

      <div className="flex gap-3 mt-6">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
