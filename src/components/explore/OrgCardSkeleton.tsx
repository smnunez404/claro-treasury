export default function OrgCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200" />
      <div className="px-5 py-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded mt-2" />
        <div className="h-3 w-full bg-gray-100 rounded mt-3" />
        <div className="h-3 w-3/4 bg-gray-100 rounded mt-1" />
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
          <div className="h-6 bg-gray-100 rounded" />
          <div className="h-6 bg-gray-100 rounded" />
          <div className="h-6 bg-gray-100 rounded" />
        </div>
        <div className="flex justify-between mt-4">
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="px-5 pb-5 pt-4 border-t border-gray-100">
        <div className="h-8 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}
