export default function RegisterSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0A0E1A] h-40 animate-pulse" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
          <div className="h-24 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse mt-4" />
        </div>
      </div>
    </div>
  );
}
