// Trang chi tiết sản phẩm – theo thiết kế Figma (Figma V2)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import CountdownTimer from "@/components/customer/CountdownTimer";
import ProductCardListing from "@/components/customer/ProductCardListing";
import { apiGetProduct, apiGetProducts } from "@/lib/api";
import { addItemToCart, startDirectCheckout } from "@/lib/cart";

function ImageGallery({ images, name, discountPercent }) {
  const [active, setActive] = useState(0);
  const list = images?.length > 0 ? images : [{ imageUrl: "/images/products/raucai.jpg" }];
  const src = list[active]?.imageUrl || "/images/products/raucai.jpg";
  const showBadge = Number(discountPercent) > 0;
  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60">
        <img src={src} alt={name} className="w-full h-full object-contain" />
        {showBadge && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2.5 shadow-lg shadow-red-600/40 ring-2 ring-white/80">
            <svg className="h-5 w-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7a2 2 0 010-2.828l7-7A2 2 0 0112 3h5" /></svg>
            <span className="text-lg font-black text-white leading-none">−{discountPercent}%</span>
          </div>
        )}
        {list.length > 1 && (
          <span className="absolute top-3 right-3 bg-slate-800/80 text-white text-xs font-medium px-2 py-1 rounded-lg">
            {active + 1}/{list.length}
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-3">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all ${
                i === active ? "ring-2 ring-green-500 ring-offset-2" : "opacity-70 hover:opacity-100 border border-gray-200"
              }`}
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function mapProductDetail(p) {
  if (!p) return null;
  const variant = (p.variants || []).find((v) => v.isDefault) || p.variants?.[0] || {};
  const listPrice = variant.listPrice ?? 0;
  const salePrice = variant.salePrice ?? variant.listPrice ?? 0;
  const discountPercent = listPrice > 0 ? Math.round((1 - salePrice / listPrice) * 100) : 0;
  const remaining = variant.stockAvailable ?? variant.stockQuantity ?? 0;
  const shelfLifeDays = p.shelfLifeDays ?? 0;
  return {
    id: String(p.id),
    name: p.name,
    primaryImageUrl: p.primaryImageUrl || "/images/products/raucai.jpg",
    images: p.images?.length > 0 ? p.images : (p.primaryImageUrl ? [{ imageUrl: p.primaryImageUrl }] : []),
    originalPrice: listPrice,
    discountPrice: salePrice,
    discountPercent,
    unit: variant.unit || "",
    remaining,
    description: p.description || "",
    shortDescription: p.shortDescription || "",
    categoryName: p.categoryName || "",
    categoryId: p.categoryId,
    shelfLifeDays,
    originCountry: p.originCountry || "",
    originProvince: p.originProvince || "",
    storageType: p.storageType || "",
    sellerName: p.sellerName || "",
    sellerSlug: p.sellerSlug || "",
    sellerPhone: p.sellerPhone || "",
    sellerRatingAvg: p.sellerRatingAvg ?? 0,
    sellerVerified: p.sellerVerified ?? false,
    brandName: p.brandName || "",
    variants: p.variants || [],
  };
}

function mapRelated(p) {
  const v = (p.variants || []).find((x) => x.isDefault) || p.variants?.[0] || {};
  const listPrice = v.listPrice ?? 0;
  const salePrice = v.salePrice ?? v.listPrice ?? 0;
  const discountPercent = listPrice > 0 ? Math.round(((listPrice - salePrice) / listPrice) * 100) : 0;
  const stock = v.stockAvailable ?? v.stockQuantity ?? 0;
  const shelfDays = p.shelfLifeDays ?? 0;
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice: listPrice,
    discountPrice: salePrice,
    discountPercent,
    expiryLabel: shelfDays ? `Hết hạn trong: ${shelfDays} ngày` : "",
    expiryAt: shelfDays ? new Date(Date.now() + shelfDays * 24 * 60 * 60 * 1000).toISOString() : null,
    stock,
    storeName: p.sellerName || "",
    address: p.originProvince || "",
    province: p.originProvince || "",
    rating: p.sellerRatingAvg != null ? Number(p.sellerRatingAvg) : 0,
  };
}

const STORAGE_LABELS = {
  ambient: "Bảo quản nơi khô ráo, thoáng mát",
  chilled: "Bảo quản lạnh",
  frozen: "Bảo quản đông lạnh",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expiryISO, setExpiryISO] = useState("");
  const [selectedSku, setSelectedSku] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [detailTab, setDetailTab] = useState("description");

  useEffect(() => {
    if (!id) return;
    apiGetProduct(id)
      .then((res) => {
        if (!res.ok || !res.data?.data) {
          setError("Không tìm thấy sản phẩm.");
          return null;
        }
        const raw = res.data.data;
        setProduct(mapProductDetail(raw));
        setSelectedSku((raw.variants || []).find((v) => v.isDefault) || raw.variants?.[0] || null);
        if (raw.shelfLifeDays) {
          setExpiryISO(new Date(Date.now() + raw.shelfLifeDays * 24 * 60 * 60 * 1000).toISOString());
        }
        const mapped = mapProductDetail(raw);
        return mapped?.categoryId ? apiGetProducts({ categoryId: mapped.categoryId, size: 6 }) : null;
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

  const buildCheckoutItem = () => {
    if (!product || !selectedSku) return null;
    const remaining = selectedSku.stockAvailable ?? selectedSku.stockQuantity ?? product.remaining ?? 0;
    if (remaining <= 0) return null;

    return {
      variantId: selectedSku.id,
      productId: product.id,
      name: product.name,
      variantName: selectedSku.name || selectedSku.unit || "",
      image: product.primaryImageUrl,
      price: selectedSku.salePrice || selectedSku.listPrice || 0,
      originalPrice: selectedSku.listPrice || 0,
      unit: selectedSku.unit || "",
      storeName: product.sellerName || "",
      quantity: Math.min(remaining, qty),
      maxQty: remaining,
    };
  };

  const handleAddToCart = () => {
    const checkoutItem = buildCheckoutItem();
    if (!checkoutItem) return;
    try {
      addItemToCart(checkoutItem);
      setAddedToCart(true);
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`, {
        style: { border: "2px solid #059669", background: "#ecfdf5" },
        iconTheme: { primary: "#059669" },
      });
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (e) {
      toast.error("Không thêm được vào giỏ. Vui lòng thử lại.");
    }
  };

  const handleBuyNow = () => {
    const checkoutItem = buildCheckoutItem();
    if (!checkoutItem) return;

    try {
      setBuyingNow(true);
      startDirectCheckout(checkoutItem);
      router.push("/checkout");
    } catch (e) {
      setBuyingNow(false);
      toast.error("Không chuyển được sang thanh toán. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-5">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-3xl mx-auto mb-5">😕</div>
          <p className="text-slate-800 font-semibold mb-2">{error || "Không tìm thấy sản phẩm."}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
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
  const remaining =
    (displaySku.stockAvailable ?? displaySku.stockQuantity) != null
      ? displaySku.stockAvailable ?? displaySku.stockQuantity
      : product.remaining;
  const storeAddress = product.originProvince || "";

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-green-600 transition-colors font-medium">Trang chủ</Link></li>
            <li className="text-slate-300">/</li>
            <li><Link href="/products" className="hover:text-green-600 transition-colors font-medium">Sản phẩm</Link></li>
            <li className="text-slate-300">/</li>
            <li className="text-slate-800 font-medium truncate max-w-[180px]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <section className="lg:col-span-5">
            <ImageGallery images={product.images} name={product.name} discountPercent={discPct} />
          </section>

          <section className="lg:col-span-7 flex flex-col gap-8">
            <header>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                {product.sellerRatingAvg > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400 flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </span>
                    <span>Đánh giá</span>
                  </span>
                )}
                {remaining === 0 ? (
                  <span className="font-medium text-rose-600">Hết hàng</span>
                ) : (
                  <span className="font-medium text-green-600">Còn hàng ({remaining} sản phẩm)</span>
                )}
              </div>
            </header>

            <div className="rounded-2xl border-2 border-red-100 bg-gradient-to-br from-white to-red-50/30 p-6 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600/90 mb-1.5">Giá ưu đãi</p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-4xl font-black text-red-600 tracking-tight tabular-nums">
                  {discP.toLocaleString("vi-VN")}
                </span>
                <span className="text-base text-gray-500 font-medium">đồng</span>
              </div>
              {origP > discP && (
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-400 line-through decoration-2 decoration-red-400">{origP.toLocaleString("vi-VN")}₫</span>
                  <span className="ml-2 text-red-600 font-semibold">Tiết kiệm {(origP - discP).toLocaleString("vi-VN")}₫</span>
                </p>
              )}
            </div>

            {expiryISO && remaining > 0 && (
              <div
                className="rounded-2xl py-4 px-5 text-white shadow-lg flex flex-row items-center justify-between gap-4 overflow-x-auto overflow-y-hidden flex-nowrap"
                style={{ background: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)" }}
              >
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-white">Ưu đãi kết thúc sau</p>
                    <p className="text-[11px] text-white/90 mt-0.5">Đừng bỏ lỡ cơ hội tiết kiệm!</p>
                  </div>
                </div>
                <CountdownTimer targetTime={expiryISO} variant="boxes" onRedBackground />
              </div>
            )}

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">Cửa hàng</p>
                <p className="font-bold text-gray-900 mt-0.5">{product.sellerName || "—"}</p>
                <p className="text-sm text-gray-500 mt-1">{[product.sellerPhone, storeAddress].filter(Boolean).join(" • ") || "Chưa cập nhật"}</p>
              </div>
            </div>

            {product.variants?.length > 1 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Phân loại</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isActive = selectedSku?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedSku(variant);
                          setQty(1);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          isActive ? "bg-green-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-green-300"
                        }`}
                      >
                        {variant.name || variant.unit || "Loại " + variant.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden h-12">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 text-lg font-medium">−</button>
                <span className="w-10 text-center text-sm font-semibold text-slate-900">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(remaining || 99, q + 1))} disabled={qty >= (remaining || 99)} className="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 text-lg font-medium">+</button>
              </div>
              <button
                onClick={handleBuyNow}
                disabled={remaining === 0}
                className={`flex-1 min-w-[200px] h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-colors ${
                  remaining === 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" /></svg>
                {buyingNow ? "Đang chuyển sang thanh toán..." : remaining === 0 ? "Hết hàng" : "Mua ngay"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={remaining === 0 || buyingNow}
                className={`flex-1 min-w-[200px] h-14 rounded-xl flex items-center justify-center gap-3 font-bold transition-colors ${
                  remaining === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : addedToCart
                      ? "border border-green-600 bg-green-50 text-green-700"
                      : "border border-slate-300 bg-white text-slate-800 hover:border-green-300 hover:text-green-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {addedToCart ? "Đã thêm vào giỏ" : remaining === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>
              <button type="button" className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-colors group" aria-label="Yêu thích">
                <svg className="w-5 h-5 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
          </section>
        </div>

        <section className="mt-14 pt-12 border-t border-slate-200">
          <div className="flex gap-10 border-b border-slate-200 mb-8">
            {[
              { id: "description", label: "Mô tả sản phẩm" },
              { id: "storage", label: "Cách bảo quản" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id)}
                className={`pb-4 -mb-px font-medium text-sm transition-colors border-b-2 ${
                  detailTab === tab.id ? "border-green-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 text-slate-600 leading-relaxed text-[15px]">
              {detailTab === "description" && (
                <div className="whitespace-pre-line">{product.description || "Chưa có mô tả."}</div>
              )}
              {detailTab === "storage" && (
                <div className="space-y-2">
                  {product.storageType && <p>{STORAGE_LABELS[product.storageType] || product.storageType}</p>}
                  {product.shelfLifeDays > 0 && <p>Hạn sử dụng: {product.shelfLifeDays} ngày kể từ khi mua</p>}
                  {!product.storageType && !product.shelfLifeDays && "Chưa cập nhật."}
                </div>
              )}
            </div>
            <aside className="bg-white rounded-2xl p-6 border border-slate-200/80 h-fit">
              <h3 className="font-semibold text-slate-900 mb-5 text-sm">Thông tin nhanh</h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Thương hiệu</dt>
                  <dd className="font-medium text-slate-800 text-right">{product.brandName || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Quy cách / Đơn vị</dt>
                  <dd className="font-medium text-slate-800 text-right">{displaySku.unit || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Hạn sử dụng</dt>
                  <dd className={`font-medium text-right ${product.shelfLifeDays > 0 ? "text-green-600" : "text-slate-800"}`}>
                    {product.shelfLifeDays > 0 ? `Còn ${product.shelfLifeDays} ngày` : "—"}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <div
              className="flex flex-row items-center justify-between gap-4 rounded-2xl px-6 py-4 mb-8 w-full shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className="h-6 w-6 text-white shrink-0 opacity-95" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <h2 className="text-lg font-bold text-white drop-shadow-sm truncate">Sản phẩm liên quan</h2>
              </div>
              <Link href={product.categoryId ? `/products?categoryId=${product.categoryId}` : "/products"} className="text-sm font-semibold text-orange-900 hover:text-orange-950 hover:underline shrink-0 bg-white rounded-lg px-4 py-2 shadow-sm">
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
