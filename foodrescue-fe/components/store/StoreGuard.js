"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser, restoreAuthSession, subscribeAuth } from "@/lib/api";

/**
 * Chỉ cho phép user đã đăng nhập và có role SELLER vào /store.
 * CUSTOMER hoặc chưa đăng nhập truy cập trực tiếp URL /store sẽ bị redirect.
 */
export default function StoreGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const checkUser = (user) => {
      if (cancelled) return;
      if (!user || user?.role !== "SELLER") {
        setAllowed(false);
        router.replace("/");
        return;
      }
      setAllowed(true);
    };

    let restored = false;
    const unsubscribe = subscribeAuth(({ user }) => {
      if (restored || user) checkUser(user);
    });

    restoreAuthSession()
      .then(() => {
        restored = true;
        checkUser(getAuthUser());
      })
      .catch(() => {
        restored = true;
        checkUser(getAuthUser());
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
