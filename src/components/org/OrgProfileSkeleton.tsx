export default function OrgProfileSkeleton() {
  return (
    <div className="bg-gray-50">
      {/* Cover */}
      <div className="h-48 bg-gray-200 animate-pulse" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto flex items-end gap-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse -mt-12 border-4 border-white" />
          <div className="space-y-2 pb-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Dark strip */}
      <div className="h-24 bg-gray-800 animate-pulse" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />
          <div className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl h-64 animate-pulse" />
          <div className="bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
