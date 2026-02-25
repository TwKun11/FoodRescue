// FE02-003 – Trang Chi tiết sản phẩm (đồng bộ brand + sản phẩm liên quan)
"use client";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import CountdownTimer from "@/components/customer/CountdownTimer";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import ProductCard from "@/components/customer/ProductCard";
import Link from "next/link";

// Dữ liệu chi tiết + dùng chung cho related (ảnh theo public/images/products/)
const PRODUCTS_DETAIL = [
  { id: "1", name: "Rau cải xanh hữu cơ 500g", image: "/images/products/raucai.jpg", originalPrice: 35000, discountPrice: 17500, discountPercent: 50, expiryLabel: "Còn 3 giờ", storeName: "Vinmart Q1", category: "rau", expiryHours: 3, unit: "túi 500g", remaining: 8, description: "Rau cải xanh tươi, trồng theo tiêu chuẩn hữu cơ. Giàu vitamin C, K và chất xơ. Thích hợp xào, luộc, nấu canh.", store: { name: "Vinmart Q1", address: "123 Nguyễn Huệ, Q1, TP.HCM", phone: "028 1234 5678", rating: 4.8, reviewCount: 246 } },
  { id: "2", name: "Thịt heo ba chỉ 300g", image: "/images/products/thitheo.jpg", originalPrice: 85000, discountPrice: 51000, discountPercent: 40, expiryLabel: "Còn 5 giờ", storeName: "Circle K", category: "thit", expiryHours: 5, unit: "300g", remaining: 5, description: "Thịt heo ba chỉ tươi, mềm, thích hợp kho, nướng, xào.", store: { name: "Circle K", address: "Hai Bà Trưng, Q1, TP.HCM", phone: "028 8765 4321", rating: 4.5, reviewCount: 89 } },
  { id: "3", name: "Tôm sú tươi 200g", image: "/images/products/tomsu.jpg", originalPrice: 120000, discountPrice: 84000, discountPercent: 30, expiryLabel: "Còn 2 giờ", storeName: "Lotte Mart Q7", category: "haisan", expiryHours: 2, unit: "200g", remaining: 12, description: "Tôm sú tươi sống, ngọt thịt. Chế biến hấp, nướng, rim.", store: { name: "Lotte Mart Q7", address: "Nguyễn Lương Bằng, Q7, TP.HCM", phone: "028 5412 3456", rating: 4.7, reviewCount: 312 } },
  { id: "4", name: "Bánh mì sandwich nguyên cám", image: "/images/products/banhmi.jpg", originalPrice: 45000, discountPrice: 22500, discountPercent: 50, expiryLabel: "Còn 1 giờ", storeName: "BreadTalk", category: "banh", expiryHours: 1, unit: "1 ổ", remaining: 6, description: "Bánh mì sandwich nguyên cám, thơm ngon, ăn kèm hoặc làm bữa sáng.", store: { name: "BreadTalk Vincom", address: "72 Lê Thánh Tôn, Q1, TP.HCM", phone: "028 3827 1928", rating: 4.6, reviewCount: 178 } },
  { id: "5", name: "Bắp cải tím 700g", image: "/images/products/bapcai.jpg", originalPrice: 28000, discountPrice: 16800, discountPercent: 40, expiryLabel: "Còn 4 giờ", storeName: "Co.opmart", category: "rau", expiryHours: 4, unit: "700g", remaining: 10, description: "Bắp cải tím tươi, giòn, dùng làm salad hoặc xào.", store: { name: "Co.opmart Nguyễn Đình Chiểu", address: "Nguyễn Đình Chiểu, Q3, TP.HCM", phone: "028 3930 1234", rating: 4.4, reviewCount: 95 } },
  { id: "6", name: "Cá basa phi lê 400g", image: "/images/products/ca-ba-sa.jpg.webp", originalPrice: 75000, discountPrice: 45000, discountPercent: 40, expiryLabel: "Còn 6 giờ", storeName: "Metro Q12", category: "haisan", expiryHours: 6, unit: "400g", remaining: 7, description: "Cá basa phi lê tươi, không xương, chiên hoặc nấu canh.", store: { name: "Metro Q12", address: "Lê Văn Việt, Q12, TP.HCM", phone: "028 3716 7890", rating: 4.5, reviewCount: 203 } },
  { id: "7", name: "Dưa leo 1kg", image: "/images/products/dualeo.jpg", originalPrice: 20000, discountPrice: 10000, discountPercent: 50, expiryLabel: "Còn 2 giờ", storeName: "Emart", category: "rau", expiryHours: 2, unit: "1kg", remaining: 15, description: "Dưa leo tươi, giòn, ăn sống hoặc làm gỏi.", store: { name: "Emart Tân Phú", address: "Lạc Long Quân, Tân Phú, TP.HCM", phone: "028 3861 2345", rating: 4.3, reviewCount: 67 } },
  { id: "8", name: "Mực ống tươi 250g", image: "/images/products/muc.jpg", originalPrice: 95000, discountPrice: 66500, discountPercent: 30, expiryLabel: "Còn 3 giờ", storeName: "Aeon", category: "haisan", expiryHours: 3, unit: "250g", remaining: 4, description: "Mực ống tươi, làm sạch, nướng hoặc xào.", store: { name: "Aeon Bình Dương", address: "Bình Dương", phone: "0274 381 2345", rating: 4.6, reviewCount: 144 } },
  { id: "9", name: "Sườn heo non 400g", image: "/images/products/suonheo.jpg", originalPrice: 110000, discountPrice: 55000, discountPercent: 50, expiryLabel: "Còn 4 giờ", storeName: "Vinmart Q3", category: "thit", expiryHours: 4, unit: "400g", remaining: 9, description: "Sườn heo non mềm, nướng hoặc rim.", store: { name: "Vinmart Q3", address: "Võ Văn Tần, Q3, TP.HCM", phone: "028 3526 7890", rating: 4.5, reviewCount: 98 } },
  { id: "10", name: "Bánh croissant bơ 4 cái", image: "/images/products/croissant.jpg", originalPrice: 60000, discountPrice: 36000, discountPercent: 40, expiryLabel: "Còn 2 giờ", storeName: "Paris Baguette", category: "banh", expiryHours: 2, unit: "4 cái", remaining: 11, description: "Croissant bơ thơm béo, bữa sáng hoặc ăn nhẹ.", store: { name: "Paris Baguette", address: "Lê Lợi, Q1, TP.HCM", phone: "028 3825 1122", rating: 4.8, reviewCount: 256 } },
  { id: "11", name: "Cua biển tươi 500g", image: "/images/products/cua.jpg", originalPrice: 200000, discountPrice: 100000, discountPercent: 50, expiryLabel: "Còn 5 giờ", storeName: "Seafood Market", category: "haisan", expiryHours: 5, unit: "500g", remaining: 3, description: "Cua biển tươi sống, gạch vàng, hấp hoặc nấu bún.", store: { name: "Seafood Market", address: "Nguyễn Văn Linh, Q7, TP.HCM", phone: "028 5410 9988", rating: 4.7, reviewCount: 189 } },
  { id: "12", name: "Cà chua bi 300g", image: "/images/products/cachua.jpg", originalPrice: 18000, discountPrice: 9000, discountPercent: 50, expiryLabel: "Còn 6 giờ", storeName: "GreenMart", category: "rau", expiryHours: 6, unit: "300g", remaining: 20, description: "Cà chua bi ngọt, làm salad hoặc nấu.", store: { name: "GreenMart", address: "Pasteur, Q1, TP.HCM", phone: "028 3822 3344", rating: 4.4, reviewCount: 72 } },
];

const CATEGORY_LABELS = { rau: "Rau củ", thit: "Thịt", haisan: "Hải sản", banh: "Bánh" };

function ProductImageGallery({ image, name, countdownSlot }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm max-w-md mx-auto lg:mx-0 w-full">
      <div className="relative aspect-square w-full bg-gray-50">
        <img src={image} alt={name} className="w-full h-full object-cover block" />
        {/* Hạn ưu đãi chèn trong ảnh — dải dưới */}
        {countdownSlot && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-red-600/95 via-red-500/80 to-transparent pt-10 pb-3 px-4">
            {countdownSlot}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = (params?.id ?? "1").toString();
  const product = useMemo(() => PRODUCTS_DETAIL.find((p) => p.id === id) ?? PRODUCTS_DETAIL[0], [id]);
  const [expiryISO, setExpiryISO] = useState("");
  useEffect(() => {
    setExpiryISO(new Date(Date.now() + (product.expiryHours || 3) * 60 * 60 * 1000).toISOString());
  }, [product.expiryHours]);

  const savings = product.originalPrice - product.discountPrice;

  // Sản phẩm liên quan: cùng danh mục, bỏ sản phẩm hiện tại, tối đa 4
  const relatedProducts = useMemo(
    () => PRODUCTS_DETAIL.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4),
    [product.category, product.id]
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-brand-dark transition">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-dark transition">Sản phẩm</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[220px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Cột trái: Ảnh + Địa chỉ cửa hàng (dưới ảnh) */}
          <div className="space-y-4 max-w-md mx-auto lg:mx-0 w-full">
            <ProductImageGallery
              image={product.image}
              name={product.name}
              countdownSlot={
                <div className="text-white text-center">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-95 mb-1">⏰ Ưu đãi kết thúc sau</p>
                  {expiryISO ? (
                    <div className="flex justify-center">
                      <CountdownTimer targetTime={expiryISO} variant="onRed" />
                    </div>
                  ) : (
                    <span className="text-sm">...</span>
                  )}
                  {product.remaining <= 10 && (
                    <p className="text-xs font-semibold mt-1.5 opacity-95">Chỉ còn {product.remaining} sản phẩm</p>
                  )}
                </div>
              }
            />
            {/* Địa chỉ cửa hàng — ngay dưới ảnh sản phẩm */}
            {product.store && (
              <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <span>🏪</span> Cửa hàng
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="font-semibold text-gray-900">{product.store.name}</p>
                  <p className="text-gray-600">📍 {product.store.address}</p>
                  <p className="text-gray-600">📞 {product.store.phone}</p>
                  <p className="flex items-center gap-1.5 pt-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium text-gray-800">{product.store.rating}</span>
                    <span className="text-gray-500 text-xs">({product.store.reviewCount} đánh giá)</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin sản phẩm (tên, đơn vị, số lượng, giá, mô tả, nút) */}
          <div className="space-y-5 lg:max-w-md">
            <div>
              <Badge variant="category" className="mb-2">{CATEGORY_LABELS[product.category] || product.category}</Badge>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1">Đơn vị: {product.unit}</p>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Số lượng còn: <span className="text-brand-dark font-semibold">{product.remaining ?? 0}</span> sản phẩm
              </p>
            </div>

            {/* Khối giá */}
            <div className="rounded-2xl p-5 bg-white border border-brand/20 shadow-sm border-l-4 border-l-brand">
              <p className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">Giá ưu đãi</p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-dark">{product.discountPrice.toLocaleString("vi-VN")}đ</span>
                <span className="text-gray-400 line-through">{product.originalPrice.toLocaleString("vi-VN")}đ</span>
                <Badge variant="discount">-{product.discountPercent}%</Badge>
              </div>
              <p className="text-sm text-brand-dark font-medium mt-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" /> Tiết kiệm {savings.toLocaleString("vi-VN")}đ
              </p>
            </div>

            {/* Mô tả */}
            <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm border-l-4 border-l-brand-secondary/60">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-brand-dark">Mô tả</span>
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <Button variant="primary" size="lg" fullWidth className="bg-brand! text-gray-900! hover:opacity-90! focus:ring-brand/40">
                Thêm vào giỏ hàng
              </Button>
              <Button variant="secondary" size="lg" className="border-brand/50! text-brand-dark! hover:bg-brand/10!">
                ♡
              </Button>
            </div>
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm liên quan</h2>
            <p className="text-sm text-gray-500 mb-6">Cùng danh mục {CATEGORY_LABELS[product.category]} — có thể bạn cũng thích</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
