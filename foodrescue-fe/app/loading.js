export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Animated logo */}
      <div className="flex items-center gap-3 mb-8 animate-pulse">
        <span className="bg-green-500 text-white rounded-xl w-12 h-12 flex items-center justify-center text-2xl shadow-lg">
          🥗
        </span>
        <span className="text-gray-800 text-2xl font-extrabold tracking-tight">FoodRescue</span>
      </div>

      {/* Spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
      </div>

      <p className="mt-6 text-sm text-gray-400 tracking-wide">Đang tải...</p>
    </div>
  );
}
