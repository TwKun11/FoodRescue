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
        "/api",
    ),
    googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  };
  const runtimeConfigScript = `window.__FOODRESCUE_RUNTIME_CONFIG__=${JSON.stringify(runtimeConfig).replace(/</g, "\\u003c")};`;

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: runtimeConfigScript }} />
        <GoogleAuthProvider>{children}</GoogleAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: "#f7fdf9", color: "#163125", fontSize: "14px" },
            success: {
              style: {
                background: "#ecfdf5",
                color: "#065f46",
                borderLeft: "4px solid #059669",
                fontWeight: 500,
              },
              iconTheme: { primary: "#059669", secondary: "#ecfdf5" },
            },
            error: {
              style: {
                background: "#fef2f2",
                color: "#991b1b",
                borderLeft: "4px solid #dc2626",
                fontWeight: 500,
              },
              iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
            },
          }}
        />
      </body>
    </html>
  );
}
