import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

/**
 * Customer Layout — bọc Header + Footer cho tất cả trang khách hàng:
 * /products, /products/:id, /cart, /checkout
 * Sử dụng Route Group (customer) nên không ảnh hưởng URL.
 */
export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
