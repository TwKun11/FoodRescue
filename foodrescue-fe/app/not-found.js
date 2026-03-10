import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-6 select-none">
        <span className="text-8xl">🥗</span>
        <span className="absolute -top-2 -right-4 bg-red-100 text-red-500 text-xs font-bold rounded-full px-2 py-0.5">
          404
        </span>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Trang không tồn tại</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        Có vẻ như trang bạn tìm kiếm đã bị xóa hoặc chưa từng tồn tại. Đừng lo — còn rất nhiều thực phẩm ngon đang chờ
        bạn!
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition shadow-sm"
        >
          Về trang chủ
        </Link>
        <Link
          href="/products"
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
        >
          Xem sản phẩm
        </Link>
      </div>
    </div>
  );
}
