export default function StatsSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0A0E1A] h-40 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-64">
          <div className="h-full bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 h-64">
              <div className="h-full bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
