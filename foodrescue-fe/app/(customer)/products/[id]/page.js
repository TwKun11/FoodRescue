// FE02-002 – Chi tiết sản phẩm (API-connected)
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CountdownTimer from "@/components/customer/CountdownTimer";
import ProductCard from "@/components/customer/ProductCard";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { apiGetProduct, apiGetProducts } from "@/lib/api";

function ProductImageGallery({ images, name, countdownSlot }) {
  const [active, setActive] = useState(0);
  const list = images && images.length > 0 ? images : [{ imageUrl: "/images/products/raucai.jpg" }];
  const src = list[active]?.imageUrl || "/images/products/raucai.jpg";
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md w-full">
      <div className="relative aspect-square w-full bg-gray-50">
        <img src={src} alt={name} className="w-full h-full object-cover block" />
        {countdownSlot && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-700/95 via-red-500/80 to-transparent pt-12 pb-4 px-4">
            {countdownSlot}
          </div>
        )}
        {list.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {active + 1} / {list.length}
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === active ? "border-brand-dark" : "border-transparent opacity-60 hover:opacity-100"
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
  const variant = p.variants && p.variants[0] ? p.variants[0] : {};
  const originalPrice = variant.listPrice || 0;
  const discountPrice = variant.salePrice || variant.listPrice || 0;
  const discountPercent = originalPrice > 0 ? Math.round((1 - discountPrice / originalPrice) * 100) : 0;
  const remaining = variant.stockAvailable ?? variant.stockQuantity ?? 0;
  const shelfLifeDays = p.shelfLifeDays || 1;
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
    seller: p.seller || null,
    variants: p.variants || [],
  };
}

function mapRelated(p) {
  const variant = p.variants && p.variants[0] ? p.variants[0] : {};
  const originalPrice = variant.listPrice || 0;
  const discountPrice = variant.salePrice || variant.listPrice || 0;
  const discountPercent = originalPrice > 0 ? Math.round((1 - discountPrice / originalPrice) * 100) : 0;
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice,
    discountPrice,
    discountPercent,
    expiryLabel: p.shelfLifeDays ? "Con " + p.shelfLifeDays + " ngay" : "",
    storeName: (p.seller && p.seller.shopName) || "",
    unit: variant.unit || "",
    remaining: variant.stockAvailable ?? variant.stockQuantity ?? 0,
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params && params.id;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expiryISO, setExpiryISO] = useState("");
  const [selectedSku, setSelectedSku] = useState(null);
  const [qty, setQty] = useState(1);

  // Reset qty to 1 whenever user switches variant
  useEffect(
    function () {
      setQty(1);
    },
    [selectedSku],
  );
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    apiGetProduct(id)
      .then(function (res) {
        var ok = res.ok;
        var data = res.data;
        if (ok && data && data.data) {
          var mapped = mapProductDetail(data.data);
          setProduct(mapped);
          setSelectedSku((data.data.variants && data.data.variants[0]) || null);
          if (mapped.shelfLifeDays) {
            setExpiryISO(new Date(Date.now() + mapped.shelfLifeDays * 24 * 60 * 60 * 1000).toISOString());
          }
          return apiGetProducts({ categoryId: mapped.categoryId, size: 5 });
        } else {
          setError("Khong tim thay san pham.");
          return null;
        }
      })
      .then(function (res2) {
        if (res2 && res2.ok && res2.data && res2.data.data && res2.data.data.content) {
          setRelatedProducts(
            res2.data.data.content
              .filter(function (r) {
                return String(r.id) !== String(id);
              })
              .slice(0, 4)
              .map(mapRelated),
          );
        }
      })
      .finally(function () {
        setLoading(false);
      });
  }, [id]);

  var handleAddToCart = function () {
    if (!product || !selectedSku) return;
    if (remaining <= 0) return;
    try {
      var cart = JSON.parse(localStorage.getItem("cart") || "[]");
      var existing = cart.find(function (i) {
        return i.variantId === selectedSku.id;
      });
      if (existing) {
        // Cap total quantity in cart at available stock
        existing.quantity = Math.min(remaining, existing.quantity + qty);
      } else {
        cart.push({
          variantId: selectedSku.id,
          productId: product.id,
          name: product.name,
          variantName: selectedSku.name || selectedSku.unit || "",
          image: product.image,
          price: selectedSku.salePrice || selectedSku.listPrice || 0,
          originalPrice: selectedSku.listPrice || 0,
          unit: selectedSku.unit || "",
          storeName: (product.seller && product.seller.shopName) || "",
          quantity: Math.min(remaining, qty),
          maxQty: remaining,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      setAddedToCart(true);
      setTimeout(function () {
        setAddedToCart(false);
      }, 2000);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full" />
          <p className="text-gray-500 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <p className="text-5xl">😕</p>
          <p className="text-gray-700 font-semibold">{error || "Không tìm thấy sản phẩm."}</p>
          <Link
            href="/products"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand text-gray-900 font-semibold text-sm hover:bg-brand-secondary hover:text-white transition"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  var displaySku = selectedSku || {};
  var origP = displaySku.listPrice || product.originalPrice;
  var discP = displaySku.salePrice || displaySku.listPrice || product.discountPrice;
  var discPct = origP > 0 ? Math.round((1 - discP / origP) * 100) : 0;
  var savings = origP - discP;
  var remaining =
    (displaySku.stockAvailable ?? displaySku.stockQuantity) != null
      ? (displaySku.stockAvailable ?? displaySku.stockQuantity)
      : product.remaining;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-brand-dark transition font-medium">
            Trang chủ
          </Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="hover:text-brand-dark transition font-medium">
            Sản phẩm
          </Link>
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left column: image + seller card */}
          <div className="space-y-4 w-full">
            <ProductImageGallery
              images={product.images}
              name={product.name}
              countdownSlot={
                <div className="text-white text-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-90 mb-1.5">
                    ⏳ Ưu đãi kết thúc sau
                  </p>
                  {expiryISO ? (
                    <div className="flex justify-center">
                      <CountdownTimer targetTime={expiryISO} variant="onRed" />
                    </div>
                  ) : (
                    <span className="text-sm opacity-70">...</span>
                  )}
                  {remaining > 0 && remaining <= 10 && (
                    <p className="text-xs font-bold mt-2 opacity-95 bg-white/20 rounded-full px-3 py-0.5 inline-block">
                      🔥 Còn {remaining} sản phẩm
                    </p>
                  )}
                </div>
              }
            />
            {product.seller && (
              <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand-dark text-xs">🏪</span>
                  Cửa hàng
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="font-bold text-gray-900 text-base">{product.seller.shopName}</p>
                  {product.seller.address && (
                    <p className="text-gray-500 flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {product.seller.address}
                    </p>
                  )}
                  {product.seller.phone && (
                    <p className="text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {product.seller.phone}
                    </p>
                  )}
                  {product.seller.ratingAvg > 0 && (
                    <p className="flex items-center gap-1.5 pt-1">
                      <span className="text-amber-400 text-base">★</span>
                      <span className="font-semibold text-gray-800">{Number(product.seller.ratingAvg).toFixed(1)}</span>
                      <span className="text-gray-400 text-xs">/ 5</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: product info */}
          <div className="space-y-5">
            <div>
              {product.categoryName && (
                <Badge variant="category" className="mb-2">
                  {product.categoryName}
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mt-1">{product.name}</h1>

              {/* Stock badge */}
              <div className="flex items-center gap-2 mt-3">
                {remaining === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Hết hàng
                  </span>
                ) : remaining <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Còn {remaining} sản phẩm
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Còn hàng · {remaining} sản phẩm
                  </span>
                )}
                {displaySku.unit && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{displaySku.unit}</span>
                )}
              </div>

              {/* Variant selector */}
              {product.variants.length > 1 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phân loại</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(function (variant) {
                      const isActive = selectedSku && selectedSku.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={function () { setSelectedSku(variant); }}
                          className={
                            "px-4 py-2 rounded-xl border text-sm font-medium transition-all " +
                            (isActive
                              ? "border-brand-dark bg-brand/15 text-brand-dark shadow-sm"
                              : "border-gray-200 text-gray-600 hover:border-brand/50 hover:bg-brand/5")
                          }
                        >
                          {variant.name || variant.unit || "Loại " + variant.id}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price box */}
            <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-3">💰 Giá ưu đãi</p>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-extrabold text-gray-900">{discP.toLocaleString("vi-VN")}đ</span>
                {discPct > 0 && (
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-gray-400 line-through text-base">{origP.toLocaleString("vi-VN")}đ</span>
                    <Badge variant="discount" className="text-sm px-2.5 py-1">-{discPct}%</Badge>
                  </div>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-brand-dark font-semibold mt-2.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tiết kiệm {savings.toLocaleString("vi-VN")}đ so với giá gốc
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Mô tả sản phẩm
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <button
                    onClick={function () { setQty(function (q) { return Math.max(1, q - 1); }); }}
                    disabled={qty <= 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-lg font-medium disabled:opacity-40"
                  >−</button>
                  <span className="w-12 text-center text-sm font-bold text-gray-800">{qty}</span>
                  <button
                    onClick={function () { setQty(function (q) { return Math.min(remaining || 99, q + 1); }); }}
                    disabled={qty >= (remaining || 99)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition text-lg font-medium disabled:opacity-40"
                  >+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={remaining === 0}
                  className={
                    "flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold transition-all shadow-sm " +
                    (addedToCart
                      ? "bg-green-500 text-white"
                      : remaining === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-brand hover:bg-brand-secondary hover:text-white text-gray-900")
                  }
                >
                  {addedToCart ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Đã thêm vào giỏ!
                    </>
                  ) : remaining === 0 ? (
                    "Hết hàng"
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Thêm vào giỏ hàng
                    </>
                  )}
                </button>
                <button className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition text-xl shadow-sm hover:bg-red-50">
                  ♡
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-gray-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sản phẩm liên quan</h2>
                <p className="text-sm text-gray-500 mt-1">Cùng danh mục · {product.categoryName}</p>
              </div>
              <Link href={`/products?categoryId=${product.categoryId}`} className="text-sm text-brand-dark font-medium hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map(function (p) {
                return <ProductCard key={p.id} product={p} />;
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
