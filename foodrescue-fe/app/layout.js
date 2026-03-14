import "./globals.css";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "FoodRescue - Giai cuu thuc pham cuoi ngay",
  description: "Mua thuc pham tuoi giam gia cuoi ngay, giam lang phi va tiet kiem chi phi.",
};

export default function RootLayout({ children }) {
  const runtimeConfig = {
    apiBaseUrl:
      process.env.FRONTEND_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "/api",
    googleClientId:
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "",
  };
  const runtimeConfigScript = `window.__FOODRESCUE_RUNTIME_CONFIG__=${JSON.stringify(runtimeConfig).replace(/</g, "\\u003c")};`;

  return (
    <html lang="vi">
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: runtimeConfigScript }} />
        <GoogleAuthProvider>{children}</GoogleAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: "#f7fdf9", color: "#163125", fontSize: "14px" },
            success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
