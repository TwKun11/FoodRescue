// FE02-001 – UI Trang Home (Food Rescue – Refactor)
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ProductCard from "@/components/customer/ProductCard";
import Link from "next/link";

// ── Mock Data: dùng link ảnh TRỰC TIẾP (mở ra là file .jpg/.png), không dùng link trang ───
const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    image: "/images/products/raucai.jpg",
    originalPrice: 35000,
    discountPrice: 17500,
    discountPercent: 50,
    expiryLabel: "Còn 3 giờ",
    storeName: "Vinmart Q1",
  },
  {
    id: "2",
    name: "Thịt heo ba chỉ 300g",
    image: "/images/products/thitheo.jpg",
    originalPrice: 85000,
    discountPrice: 51000,
    discountPercent: 40,
    expiryLabel: "Còn 5 giờ",
    storeName: "Circle K Hai Bà Trưng",
  },
  {
    id: "3",
    name: "Tôm sú tươi 200g",
    image: "/images/products/tomsu.jpg",
    originalPrice: 120000,
    discountPrice: 84000,
    discountPercent: 30,
    expiryLabel: "Còn 2 giờ",
    storeName: "Lotte Mart Q7",
  },
  {
    id: "4",
    name: "Bánh mì sandwich nguyên cám",
    image: "/images/products/banhmi.jpg",
    originalPrice: 45000,
    discountPrice: 22500,
    discountPercent: 50,
    expiryLabel: "Còn 1 giờ",
    storeName: "BreadTalk Vincom",
  },
  {
    id: "5",
    name: "Bắp cải tím 700g",
    image: "/images/products/bapcai.jpg",
    originalPrice: 28000,
    discountPrice: 16800,
    discountPercent: 40,
    expiryLabel: "Còn 4 giờ",
    storeName: "Co.opmart Nguyễn Đình Chiểu",
  },
  {
    id: "6",
    name: "Cá basa phi lê 400g",
    image: "/images/products/ca-ba-sa.jpg.webp",
    originalPrice: 75000,
    discountPrice: 45000,
    discountPercent: 40,
    expiryLabel: "Còn 6 giờ",
    storeName: "Metro Q12",
  },
  {
    id: "7",
    name: "Dưa leo 1kg",
    image: "/images/products/dualeo.jpg",
    originalPrice: 20000,
    discountPrice: 10000,
    discountPercent: 50,
    expiryLabel: "Còn 2 giờ",
    storeName: "Emart Tân Phú",
  },
  {
    id: "8",
    name: "Mực ống tươi 250g",
    image: "/images/products/muc.jpg",
    originalPrice: 95000,
    discountPrice: 66500,
    discountPercent: 30,
    expiryLabel: "Còn 3 giờ",
    storeName: "Aeon Bình Dương",
  },
];

const HERO_STATS = [
  { value: "500+", label: "Cửa hàng" },
  { value: "10K+", label: "Sản phẩm" },
  { value: "50K+", label: "Khách hàng" },
  { value: "5 tấn", label: "Thực phẩm cứu" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Header />

      <main className="flex-1">
        {/* ── Hero Section ───────────────────────────────────────────────── */}
        <section className="relative bg-brand-bg md:bg-linear-to-r md:from-brand-bg md:via-brand-bg md:to-brand/10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: Content */}
              <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                <span className="inline-block bg-brand/20 text-brand-dark text-xs font-semibold px-3 py-1.5 rounded-xl mb-4">
                  Cộng đồng giảm lãng phí thực phẩm
                </span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight tracking-tight">
                  Giải cứu thức ăn — Chung tay giảm lãng phí
                </h1>
                <p className="mt-4 text-gray-600 text-sm md:text-base max-w-lg leading-relaxed mx-auto lg:mx-0">
                  Kết nối người dùng với cửa hàng có thực phẩm dư thừa chất lượng với giá ưu đãi. Tiết kiệm chi phí và bảo vệ môi trường mỗi ngày.
                </p>
                <div className="mt-6 flex justify-center lg:justify-start">
                  <Link
                    href="/store/login"
                    className="inline-flex justify-center px-6 py-2.5 rounded-xl border-2 border-brand-secondary text-brand-secondary font-semibold text-sm hover:bg-brand-secondary/10 transition"
                  >
                    Trở thành đối tác ngay
                  </Link>
                </div>
              </div>

              {/* Right: Ảnh + card floating tách bạch, stats luôn nằm dưới — không chồng chéo */}
              <div className="w-full lg:max-w-md order-1 lg:order-2 space-y-4">
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
                    alt="Thực phẩm tươi sống"
                    className="w-full aspect-4/3 object-cover"
                  />
                  {/* Card floating góc trên-phải ảnh, không đè stats */}
                  <div className="absolute top-3 right-3 max-w-[180px] bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-3 border border-brand/30">
                    <p className="text-xs text-gray-500">Ưu đãi nhanh tay</p>
                    <p className="font-bold text-brand-dark text-sm">Giảm đến 50% — Còn 2 giờ</p>
                  </div>
                </div>
                {/* Stats luôn nằm dưới ảnh, grid rõ ràng */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {HERO_STATS.map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-xl p-3 text-center shadow-sm border border-brand/20"
                    >
                      <p className="text-lg font-bold text-brand-dark">{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ưu đãi sắp hết hạn ─────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Ưu đãi sắp hết hạn</h2>
              <p className="text-sm text-gray-500 mt-0.5">Nhanh tay kẻo hết — cập nhật liên tục</p>
            </div>
            <Link
              href="/products"
              className="text-sm text-brand-dark font-medium hover:text-brand-secondary"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── CTA Banner (Cửa hàng) ──────────────────────────────────────── */}
        
      </main>

      <Footer />

      {/* Floating AI Chat Button */}
      <button
        type="button"
        aria-label="Chat AI"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand text-gray-900 shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    </div>
  );
}
