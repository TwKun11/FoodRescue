"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/runtime-config";

const API_URL = getApiBaseUrl();

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const missingToken = !token;

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (missingToken) return;

    let cancelled = false;

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setMessage(data?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
          return;
        }

        setStatus("success");
        setMessage(data?.message || "Xác thực email thành công. Bạn có thể đăng nhập.");
        setTimeout(() => router.push("/login"), 2000);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Không kết nối được server. Vui lòng thử lại sau.");
        }
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [missingToken, router, token]);

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Xác thực email</h1>

          {status === "loading" && !missingToken && (
            <>
              <p className="text-gray-600 mb-6">Đang xác thực tài khoản...</p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4 p-3 rounded-xl text-sm bg-green-50 text-green-800 border border-green-200">
                {message}
              </div>
              <p className="text-sm text-gray-500 mb-4">Đang chuyển tới trang đăng nhập...</p>
              <Link
                href="/login"
                className="inline-block rounded-xl py-2.5 px-4 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition"
              >
                Đăng nhập ngay
              </Link>
            </>
          )}

          {(missingToken || status === "error") && (
            <>
              <div className="mb-4 p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                {missingToken ? "Link xác thực không hợp lệ hoặc thiếu mã token." : message}
              </div>
              <Link
                href="/login"
                className="inline-block rounded-xl py-2.5 px-4 bg-brand text-gray-900 font-medium hover:bg-brand-dark transition"
              >
                Đi tới trang đăng nhập
              </Link>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-dark">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
