export default function CustomerLoading() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-100 animate-pulse" />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 space-y-8">
        {/* Banner skeleton */}
        <div className="h-52 rounded-2xl bg-gray-200 animate-pulse" />

        {/* Category chips */}
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm animate-pulse"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-200 rounded w-2/5" />
                <div className="h-4 bg-gray-200 rounded w-3/5 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
