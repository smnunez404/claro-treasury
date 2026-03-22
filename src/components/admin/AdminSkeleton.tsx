export default function AdminSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 border-b border-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
