// FE02-002 – Chi tiết sản phẩm — giao diện đồng bộ với trang /products (primary #33ff99, nền #f5f8f7)
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CountdownTimer from "@/components/customer/CountdownTimer";
import ProductCardListing from "@/components/customer/ProductCardListing";
import { apiGetProduct, apiGetProducts } from "@/lib/api";
import { addItemToCart } from "@/lib/cart";

function ProductImageGallery({ images, name, countdownSlot }) {
  const [active, setActive] = useState(0);
  const list = images && images.length > 0 ? images : [{ imageUrl: "/images/products/raucai.jpg" }];
  const src = list[active]?.imageUrl || "/images/products/raucai.jpg";
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-brand/10 shadow-sm w-full">
      <div className="relative aspect-square w-full bg-slate-100">
        <img src={src} alt={name} className="w-full h-full object-cover block" />
        {countdownSlot && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-900/90 via-slate-800/80 to-transparent pt-12 pb-4 px-4">
            {countdownSlot}
          </div>
        )}
        {list.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {active + 1} / {list.length}
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                i === active ? "border-brand shadow-md shadow-brand/20" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img.imageUrl} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function mapProductDetail(p) {
  if (!p) return null;
  const variant = (p.variants || []).find((item) => item.isDefault) || p.variants?.[0] || {};
  const originalPrice = variant.listPrice || 0;
  const discountPrice = variant.salePrice || variant.listPrice || 0;
  const discountPercent = originalPrice > 0 ? Math.round((1 - discountPrice / originalPrice) * 100) : 0;
  const remaining = variant.stockAvailable ?? variant.stockQuantity ?? 0;
  const shelfLifeDays = p.shelfLifeDays || 1;
  const hasSellerInfo = p.sellerName || p.sellerPhone || p.sellerRatingAvg != null;
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    images: p.images && p.images.length > 0
      ? p.images
      : (p.primaryImageUrl ? [{ imageUrl: p.primaryImageUrl }] : []),
    originalPrice,
    discountPrice,
    discountPercent,
    unit: variant.unit || p.unitLabel || "",
    remaining,
    description: p.description || "",
    categoryName: p.categoryName || "",
    categoryId: p.categoryId,
    shelfLifeDays,
    seller: hasSellerInfo
      ? {
          shopName: p.sellerName || "",
          shopSlug: p.sellerSlug || "",
          phone: p.sellerPhone || "",
          ratingAvg: p.sellerRatingAvg ?? 0,
          isVerified: p.sellerVerified ?? false,
        }
      : null,
    variants: p.variants || [],
  };
}

function mapRelated(p) {
  const variant = (p.variants || []).find((item) => item.isDefault) || p.variants?.[0] || {};
  const listPrice = variant.listPrice ?? 0;
  const salePrice = variant.salePrice ?? variant.listPrice ?? 0;
  const discountPercent = listPrice > 0 ? Math.round(((listPrice - salePrice) / listPrice) * 100) : 0;
  const stock = variant.stockAvailable ?? variant.stockQuantity ?? 0;
  const shelfDays = p.shelfLifeDays ?? 0;
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice: listPrice,
    discountPrice: salePrice,
    discountPercent,
    expiryLabel: shelfDays ? `Hết hạn trong: ${shelfDays} ngày` : "",
    expiryHours: shelfDays * 24,
    stock,
    storeName: p.sellerName || "",
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expiryISO, setExpiryISO] = useState("");
  const [selectedSku, setSelectedSku] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    setQty(1);
  }, [selectedSku]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    apiGetProduct(id)
      .then((res) => {
        const ok = res.ok;
        const data = res.data;
        if (ok && data?.data) {
          const mapped = mapProductDetail(data.data);
          setProduct(mapped);
          setSelectedSku(
            (data.data.variants || []).find((v) => v.isDefault) || data.data.variants?.[0] || null
          );
          if (mapped.shelfLifeDays) {
            setExpiryISO(
              new Date(Date.now() + mapped.shelfLifeDays * 24 * 60 * 60 * 1000).toISOString()
            );
          }
          return apiGetProducts({ categoryId: mapped.categoryId, size: 6 });
        }
        setError("Không tìm thấy sản phẩm.");
        return null;
      })
      .then((res2) => {
        if (res2?.ok && res2.data?.data?.content) {
          setRelatedProducts(
            res2.data.data.content
              .filter((r) => String(r.id) !== String(id))
              .slice(0, 4)
              .map(mapRelated)
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !selectedSku) return;
    const remaining =
      (selectedSku.stockAvailable ?? selectedSku.stockQuantity) != null
        ? selectedSku.stockAvailable ?? selectedSku.stockQuantity
        : product.remaining;
    if (remaining <= 0) return;
    addItemToCart({
      variantId: selectedSku.id,
      productId: product.id,
      name: product.name,
      variantName: selectedSku.name || selectedSku.unit || "",
      image: product.image,
      price: selectedSku.salePrice || selectedSku.listPrice || 0,
      originalPrice: selectedSku.listPrice || 0,
      unit: selectedSku.unit || "",
      storeName: product.seller?.shopName || "",
      quantity: Math.min(remaining, qty),
      maxQty: remaining,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f5f8f7] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-4xl mx-auto mb-4">
            😕
          </div>
          <p className="text-slate-800 font-semibold mb-2">{error || "Không tìm thấy sản phẩm."}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-brand text-[#0f2319] font-semibold text-sm hover:opacity-90 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const displaySku = selectedSku || {};
  const origP = displaySku.listPrice ?? product.originalPrice;
  const discP = displaySku.salePrice ?? displaySku.listPrice ?? product.discountPrice;
  const discPct = origP > 0 ? Math.round((1 - discP / origP) * 100) : 0;
  const savings = origP - discP;
  const remaining =
    (displaySku.stockAvailable ?? displaySku.stockQuantity) != null
      ? displaySku.stockAvailable ?? displaySku.stockQuantity
      : product.remaining;

  return (
    <div className="min-h-screen bg-[#f5f8f7]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-brand transition font-medium">
            Trang chủ
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/products" className="hover:text-brand transition font-medium">
            Sản phẩm
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate max-w-[220px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Cột trái: ảnh + cửa hàng */}
          <div className="space-y-6">
            <ProductImageGallery
              images={product.images}
              name={product.name}
              countdownSlot={
                <div className="text-white text-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-90 mb-1.5">
                    Ưu đãi kết thúc sau
                  </p>
                  {expiryISO ? (
                    <div className="flex justify-center">
                      <CountdownTimer targetTime={expiryISO} variant="onRed" />
                    </div>
                  ) : (
                    <span className="text-sm opacity-70">—</span>
                  )}
                  {remaining > 0 && remaining <= 10 && (
                    <p className="text-xs font-bold mt-2 bg-white/20 rounded-full px-3 py-1 inline-block">
                      Còn {remaining} sản phẩm
                    </p>
                  )}
                </div>
              }
            />
            {product.seller && (
              <div className="rounded-2xl p-5 bg-white border border-brand/10 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center text-brand">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  Cửa hàng
                </h3>
                <p className="font-bold text-slate-900 text-base mb-1">{product.seller.shopName}</p>
                {product.seller.phone && (
                  <p className="text-slate-500 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {product.seller.phone}
                  </p>
                )}
                {product.seller.ratingAvg > 0 && (
                  <p className="flex items-center gap-1.5 mt-2 text-amber-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-slate-800">{Number(product.seller.ratingAvg).toFixed(1)}</span>
                    <span className="text-slate-400 text-xs">/ 5</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cột phải: thông tin + giá + CTA */}
          <div className="space-y-6">
            {product.categoryName && (
              <span className="inline-block text-[10px] font-bold text-brand uppercase tracking-widest">
                {product.categoryName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {remaining === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-600 text-xs font-semibold">
                  Hết hàng
                </span>
              ) : remaining <= 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 text-orange-600 text-xs font-semibold">
                  Còn {remaining} sản phẩm
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/20 text-brand-dark text-xs font-semibold">
                  Còn hàng · {remaining} sản phẩm
                </span>
              )}
              {displaySku.unit && (
                <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {displaySku.unit}
                </span>
              )}
            </div>

            {product.variants?.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Phân loại
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isActive = selectedSku?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedSku(variant)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-brand text-[#0f2319] shadow-md shadow-brand/20"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-brand/30 hover:bg-brand/10"
                        }`}
                      >
                        {variant.name || variant.unit || "Loại " + variant.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl p-5 bg-white border border-brand/10 shadow-sm">
              <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Giá ưu đãi</p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {discP.toLocaleString("vi-VN")}đ
                </span>
                {discPct > 0 && (
                  <>
                    <span className="text-slate-400 line-through text-base">
                      {origP.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="px-2.5 py-1 bg-brand text-[#0f2319] text-xs font-bold rounded-full">
                      -{discPct}%
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-brand-dark font-semibold mt-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tiết kiệm {savings.toLocaleString("vi-VN")}đ
                </p>
              )}
            </div>

            {product.description && (
              <div className="rounded-2xl p-5 bg-white border border-brand/10 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  Mô tả sản phẩm
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Số lượng:</span>
                <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(remaining || 99, q + 1))}
                    disabled={qty >= (remaining || 99)}
                    className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={remaining === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold transition-all ${
                    addedToCart
                      ? "bg-brand-dark text-white"
                      : remaining === 0
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-brand text-[#0f2319] hover:opacity-90 shadow-lg shadow-brand/20"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Đã thêm vào giỏ
                    </>
                  ) : remaining === 0 ? (
                    "Hết hàng"
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Thêm vào giỏ hàng
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="w-14 h-14 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition shrink-0"
                  aria-label="Yêu thích"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sản phẩm liên quan</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Cùng danh mục {product.categoryName && `· ${product.categoryName}`}
                </p>
              </div>
              <Link
                href={`/products${product.categoryId ? `?categoryId=${product.categoryId}` : ""}`}
                className="text-sm font-semibold text-brand hover:underline shrink-0"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCardListing key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
