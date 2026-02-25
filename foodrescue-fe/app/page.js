// FE02-001 – UI Trang Home
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import CategoryCard from "@/components/customer/CategoryCard";
import ProductCard from "@/components/customer/ProductCard";
import Link from "next/link";

// ── Mock Data ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: "rau", label: "Rau củ", count: 42 },
  { slug: "thit", label: "Thịt tươi", count: 28 },
  { slug: "haisan", label: "Hải sản", count: 19 },
  { slug: "banh", label: "Bánh", count: 35 },
];

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    image: "https://placehold.co/400x300/e8f5e9/2e7d32?text=Rau+Cải",
    originalPrice: 35000,
    discountPrice: 17500,
    discountPercent: 50,
    expiryLabel: "Còn 3 giờ",
    storeName: "Vinmart Q1",
  },
  {
    id: "2",
    name: "Thịt heo ba chỉ 300g",
    image: "https://placehold.co/400x300/fce4ec/b71c1c?text=Thịt+Heo",
    originalPrice: 85000,
    discountPrice: 51000,
    discountPercent: 40,
    expiryLabel: "Còn 5 giờ",
    storeName: "Circle K Hai Bà Trưng",
  },
  {
    id: "3",
    name: "Tôm sú tươi 200g",
    image: "https://placehold.co/400x300/e3f2fd/0d47a1?text=Tôm+Sú",
    originalPrice: 120000,
    discountPrice: 84000,
    discountPercent: 30,
    expiryLabel: "Còn 2 giờ",
    storeName: "Lotte Mart Q7",
  },
  {
    id: "4",
    name: "Bánh mì sandwich nguyên cám",
    image: "https://placehold.co/400x300/fff8e1/e65100?text=Bánh+Mì",
    originalPrice: 45000,
    discountPrice: 22500,
    discountPercent: 50,
    expiryLabel: "Còn 1 giờ",
    storeName: "BreadTalk Vincom",
  },
  {
    id: "5",
    name: "Bắp cải tím 700g",
    image: "https://placehold.co/400x300/f3e5f5/4a148c?text=Bắp+Cải",
    originalPrice: 28000,
    discountPrice: 16800,
    discountPercent: 40,
    expiryLabel: "Còn 4 giờ",
    storeName: "Co.opmart Nguyễn Đình Chiểu",
  },
  {
    id: "6",
    name: "Cá basa phi lê 400g",
    image: "https://placehold.co/400x300/e0f7fa/006064?text=Cá+Basa",
    originalPrice: 75000,
    discountPrice: 45000,
    discountPercent: 40,
    expiryLabel: "Còn 6 giờ",
    storeName: "Metro Q12",
  },
  {
    id: "7",
    name: "Dưa leo 1kg",
    image: "https://placehold.co/400x300/f1f8e9/33691e?text=Dưa+Leo",
    originalPrice: 20000,
    discountPrice: 10000,
    discountPercent: 50,
    expiryLabel: "Còn 2 giờ",
    storeName: "Emart Tân Phú",
  },
  {
    id: "8",
    name: "Mực ống tươi 250g",
    image: "https://placehold.co/400x300/e8eaf6/1a237e?text=Mực+Ống",
    originalPrice: 95000,
    discountPrice: 66500,
    discountPercent: 30,
    expiryLabel: "Còn 3 giờ",
    storeName: "Aeon Bình Dương",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
          <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                🔥 Flash Sale cuối ngày
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Giảm đến <span className="text-yellow-300">50%</span>
                <br />
                Thực phẩm tươi cuối ngày
              </h1>
              <p className="mt-4 text-orange-100 text-sm md:text-base max-w-md leading-relaxed">
                Mua thực phẩm còn tươi ngon, giảm giá sâu. Tiết kiệm chi phí, giảm lãng phí thực phẩm.
              </p>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Link
                  href="/products"
                  className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition shadow-sm"
                >
                  Mua ngay →
                </Link>
                <Link
                  href="/store/login"
                  className="bg-white/20 border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/30 transition"
                >
                  Đăng ký cửa hàng
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { value: "500+", label: "Cửa hàng" },
                { value: "10K+", label: "Sản phẩm" },
                { value: "50K+", label: "Khách hàng" },
                { value: "5 tấn", label: "Thực phẩm cứu" },
              ].map((s) => (
                <div key={s.label} className="bg-white/20 rounded-2xl p-4 text-center min-w-[110px]">
                  <p className="text-2xl font-extrabold text-yellow-300">{s.value}</p>
                  <p className="text-xs text-orange-100 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">📦 Danh mục</h2>
            <Link href="/products" className="text-sm text-orange-500 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </section>

        {/* Ưu đãi sắp hết hạn */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">⚡ Ưu đãi sắp hết hạn</h2>
              <p className="text-sm text-gray-500 mt-0.5">Nhanh tay kẻo hết — cập nhật liên tục</p>
            </div>
            <Link href="/products" className="text-sm text-orange-500 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-green-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Bạn là chủ cửa hàng?</h3>
              <p className="text-green-100 text-sm mt-1">
                Đăng ký miễn phí và bắt đầu bán thực phẩm cuối ngày ngay hôm nay.
              </p>
            </div>
            <Link
              href="/store/login"
              className="bg-white text-green-600 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition shadow-sm whitespace-nowrap"
            >
              Đăng ký cửa hàng →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
