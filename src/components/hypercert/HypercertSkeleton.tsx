export default function HypercertSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0A0E1A] h-44 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 h-40 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
