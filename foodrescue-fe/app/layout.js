import "./globals.css";

export const metadata = {
  title: "FoodRescue – Giải cứu thực phẩm cuối ngày",
  description: "Mua thực phẩm tươi giảm giá cuối ngày, giảm lãng phí và tiết kiệm chi phí.",
};

/**
 * Root Layout — chỉ cung cấp <html> và <body>.
 * Header / Footer được inject bởi (customer)/layout.js
 * Sidebar được inject bởi store/(dashboard)/layout.js
 */
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
