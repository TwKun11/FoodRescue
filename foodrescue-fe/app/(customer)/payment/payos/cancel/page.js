"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PayOSCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-12">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-2xl">↩️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Bạn đã thoát khỏi PayOS</h1>
        <p className="text-sm text-gray-600 mt-2">
          Nếu payment chưa được xác nhận, đơn có thể vẫn ở trạng thái chờ thanh toán hoặc sẽ bị hủy sau khi gateway trả
          kết quả về backend.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Mở lại đơn hàng
            </Link>
          ) : (
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-brand text-gray-900 font-medium text-sm hover:bg-brand-dark transition"
            >
              Đơn hàng của tôi
            </Link>
          )}
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 border border-brand text-brand-dark font-medium text-sm hover:bg-brand-bg transition"
          >
            Tiếp tục mua hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
