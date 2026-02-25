// FE02-003 – UI Trang Chi tiết sản phẩm
import CountdownTimer from "@/components/customer/CountdownTimer";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Link from "next/link";

// ── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_PRODUCTS = {
  1: {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    images: [
      "https://placehold.co/600x450/e8f5e9/2e7d32?text=Rau+Cải+1",
      "https://placehold.co/600x450/c8e6c9/1b5e20?text=Rau+Cải+2",
      "https://placehold.co/600x450/a5d6a7/4caf50?text=Rau+Cải+3",
    ],
    originalPrice: 35000,
    discountPrice: 17500,
    discountPercent: 50,
    expiryISO: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    description:
      "Rau cải xanh tươi, được trồng theo tiêu chuẩn hữu cơ USDA. Không phân bón hóa học, không thuốc trừ sâu. Giàu vitamin C, K và chất xơ. Thích hợp xào, luộc, nấu canh.",
    store: {
      name: "Vinmart Q1",
      address: "123 Nguyễn Huệ, Q1, TP.HCM",
      phone: "028 1234 5678",
      rating: 4.8,
      reviewCount: 246,
    },
    category: "Rau củ",
    unit: "túi 500g",
    remaining: 8,
  },
};

function ProductImageGallery({ images }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-gray-100 h-72 sm:h-96">
        <img src={images[0]} alt="Product" className="w-full h-full object-cover" />
      </div>
      <div className="flex gap-2">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 cursor-pointer transition"
          >
            <img src={src} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }) {
  const product = MOCK_PRODUCTS[params?.id] ?? MOCK_PRODUCTS["1"];

  const savings = product.originalPrice - product.discountPrice;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-orange-500">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-orange-500">
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Images */}
        <ProductImageGallery images={product.images} />

        {/* Right: Info */}
        <div className="space-y-5">
          <div>
            <Badge variant="category">{product.category}</Badge>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h1>
            <p className="text-sm text-gray-400 mt-1">Đơn vị: {product.unit}</p>
          </div>

          {/* Price */}
          <div className="bg-orange-50 rounded-2xl p-4 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-orange-500">
                {product.discountPrice.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-gray-400 line-through text-lg">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </span>
              <Badge variant="discount">-{product.discountPercent}%</Badge>
            </div>
            <p className="text-sm text-green-600 font-medium">✅ Tiết kiệm: {savings.toLocaleString("vi-VN")}đ</p>
          </div>

          {/* Countdown */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-600 mb-2">⚠️ Hạn sử dụng của ưu đãi này:</p>
            <CountdownTimer targetTime={product.expiryISO} />
            {product.remaining <= 10 && (
              <p className="text-xs text-red-500 mt-2 font-medium">🔥 Chỉ còn {product.remaining} sản phẩm!</p>
            )}
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button variant="primary" size="lg" fullWidth>
              🛒 Thêm vào giỏ hàng
            </Button>
            <Button variant="secondary" size="lg">
              ♡
            </Button>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Store Info */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🏪</span> Thông tin cửa hàng
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">Tên:</span>
                <span className="font-semibold text-gray-800">{product.store.name}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">Địa chỉ:</span>
                <span className="text-gray-600">{product.store.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 shrink-0">SĐT:</span>
                <span className="text-gray-600">{product.store.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold">{product.store.rating}</span>
                <span className="text-gray-400 text-xs">({product.store.reviewCount} đánh giá)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
