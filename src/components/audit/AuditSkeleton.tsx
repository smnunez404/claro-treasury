export default function AuditSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0A0E1A] h-32 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-14 bg-white border border-gray-200 rounded-xl animate-pulse mb-4" />
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="h-10 bg-gray-50 border-b border-gray-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
