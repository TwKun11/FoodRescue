import "./globals.css";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import { Toaster } from "react-hot-toast";
import { normalizeApiBaseUrl } from "@/lib/normalize-runtime-config";

export const metadata = {
  title: "FoodRescue - Giải cứu thực phẩm cuối ngày",
  description: "Mua thực phẩm tươi giảm giá cuối ngày, giảm lãng phí và tiết kiệm chi phí.",
};

export default function RootLayout({ children }) {
  const runtimeConfig = {
    apiBaseUrl: normalizeApiBaseUrl(
      process.env.FRONTEND_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "/api"
    ),
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
