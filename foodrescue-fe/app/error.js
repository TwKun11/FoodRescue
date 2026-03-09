"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[FoodRescue Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6 select-none">
        <span className="text-7xl">😵</span>
        <span className="absolute -top-2 -right-4 bg-red-100 text-red-500 text-xs font-bold rounded-full px-2 py-0.5">
          Lỗi
        </span>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Có gì đó không ổn rồi!</h1>
      <p className="text-gray-500 text-sm max-w-xs mb-2">
        Ứng dụng gặp lỗi không mong muốn. Thử tải lại trang hoặc quay về trang chủ.
      </p>

      {error?.message && (
        <p className="text-xs text-red-400 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-6 max-w-sm break-all">
          {error.message}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition shadow-sm"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
