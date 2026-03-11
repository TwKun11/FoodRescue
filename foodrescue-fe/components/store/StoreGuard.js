"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Chỉ cho phép user đã đăng nhập và có role SELLER vào /store.
 * CUSTOMER hoặc chưa đăng nhập truy cập trực tiếp URL /store sẽ bị redirect.
 */
export default function StoreGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    if (!user || user?.role !== "SELLER") {
      router.replace("/");
      return;
    }
    queueMicrotask(() => setAllowed(true));
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return children;
}
