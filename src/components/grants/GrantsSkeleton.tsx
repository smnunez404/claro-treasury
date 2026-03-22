export default function GrantsSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8">
      <div className="flex justify-between">
        <div className="h-7 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl h-40 animate-pulse" />
        <div className="bg-white border border-gray-200 rounded-xl h-40 animate-pulse" />
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-xl h-48 animate-pulse" />
      <div className="mt-6 bg-white border border-gray-200 rounded-xl h-32 animate-pulse" />
      <div className="mt-6 bg-white border border-gray-200 rounded-xl h-28 animate-pulse" />
    </div>
  );
}
