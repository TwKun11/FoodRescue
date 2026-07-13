"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/common/AuthProvider";

/**
 * Only authenticated SELLER users can access /store.
 */
export default function StoreGuard({ children }) {
  const router = useRouter();
  const { restoring, user } = useAuthSession();
  const allowed = !restoring && user?.role === "SELLER";

  useEffect(() => {
    if (!restoring && !allowed) router.replace("/");
  }, [allowed, restoring, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Dang kiem tra quyen truy cap...</p>
      </div>
    );
  }

  return children;
}
