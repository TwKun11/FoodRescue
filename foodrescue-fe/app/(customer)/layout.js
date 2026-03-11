"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]);

export default function CustomerLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.has(pathname);

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
