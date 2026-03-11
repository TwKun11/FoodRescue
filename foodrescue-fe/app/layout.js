import "./globals.css";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";
import { Toaster } from "react-hot-toast";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
});

export const metadata = {
  title: "FoodRescue – Giải cứu thực phẩm cuối ngày",
  description: "Mua thực phẩm tươi giảm giá cuối ngày, giảm lãng phí và tiết kiệm chi phí.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} antialiased`}>
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
