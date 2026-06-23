"use client";

import { useEffect } from "react";
import { restoreAuthSession } from "@/lib/api";

export default function AuthProvider({ children }) {
  useEffect(() => {
    restoreAuthSession().catch(() => {});
  }, []);

  return children;
}
