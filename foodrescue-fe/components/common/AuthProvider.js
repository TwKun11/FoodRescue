"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAuthUser, restoreAuthSession, subscribeAuth } from "@/lib/api";

const AuthContext = createContext({
  restoring: true,
  user: null,
  authenticated: false,
});

export function useAuthSession() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [restoring, setRestoring] = useState(true);
  const [user, setUser] = useState(() => getAuthUser());

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = subscribeAuth(({ user: nextUser }) => {
      if (!cancelled) setUser(nextUser || null);
    });

    restoreAuthSession()
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ restoring, user, authenticated: Boolean(user) }),
    [restoring, user],
  );

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Dang khoi phuc phien dang nhap...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
