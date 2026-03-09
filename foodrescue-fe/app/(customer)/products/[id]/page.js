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

function ProductImageGallery({ image, name, countdownSlot }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm max-w-md mx-auto lg:mx-0 w-full">
      <div className="relative aspect-square w-full bg-gray-50">
        <img src={image || "/images/products/raucai.jpg"} alt={name} className="w-full h-full object-cover block" />
        {countdownSlot && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-red-600/95 via-red-500/80 to-transparent pt-10 pb-3 px-4">
            {countdownSlot}
          </div>
        )}
      </div>
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
  useEffect(function () { setQty(1); }, [selectedSku]);
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
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{error || "Khong tim thay san pham."}</p>
          <Link href="/products" className="text-brand-dark underline text-sm">
            Quay lai danh sach
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
  var remaining = (displaySku.stockAvailable ?? displaySku.stockQuantity) != null ? (displaySku.stockAvailable ?? displaySku.stockQuantity) : product.remaining;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-brand-dark transition">
            Trang chu
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-dark transition">
            San pham
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[220px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <div className="space-y-4 max-w-md mx-auto lg:mx-0 w-full">
            <ProductImageGallery
              image={product.image}
              name={product.name}
              countdownSlot={
                <div className="text-white text-center">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-95 mb-1">
                    Uu dai ket thuc sau
                  </p>
                  {expiryISO ? (
                    <div className="flex justify-center">
                      <CountdownTimer targetTime={expiryISO} variant="onRed" />
                    </div>
                  ) : (
                    <span className="text-sm">...</span>
                  )}
                  {remaining > 0 && remaining <= 10 && (
                    <p className="text-xs font-semibold mt-1.5 opacity-95">Chi con {remaining} san pham</p>
                  )}
                </div>
              }
            />
            {product.seller && (
              <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <span>Cua hang</span>
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="font-semibold text-gray-900">{product.seller.shopName}</p>
                  {product.seller.address && <p className="text-gray-600">{product.seller.address}</p>}
                  {product.seller.phone && <p className="text-gray-600">{product.seller.phone}</p>}
                  {product.seller.ratingAvg > 0 && (
                    <p className="flex items-center gap-1.5 pt-1">
                      <span className="text-amber-500">*</span>
                      <span className="font-medium text-gray-800">{Number(product.seller.ratingAvg).toFixed(1)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5 lg:max-w-md">
            <div>
              {product.categoryName && (
                <Badge variant="category" className="mb-2">
                  {product.categoryName}
                </Badge>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              {product.variants.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map(function (variant) {
                    return (
                      <button
                        key={variant.id}
                        onClick={function () {
                          setSelectedSku(variant);
                        }}
                        className={
                          "px-3 py-1.5 rounded-lg border text-sm font-medium transition " +
                          (selectedSku && selectedSku.id === variant.id
                            ? "border-brand bg-brand/10 text-brand-dark"
                            : "border-gray-300 text-gray-600 hover:border-brand/50")
                        }
                      >
                        {variant.name || variant.unit || "Loai " + variant.id}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">Don vi: {displaySku.unit || product.unit}</p>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                So luong con: <span className="text-brand-dark font-semibold">{remaining}</span> san pham
              </p>
            </div>

            <div className="rounded-2xl p-5 bg-white border border-brand/20 shadow-sm border-l-4 border-l-brand">
              <p className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">Gia uu dai</p>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-dark">{discP.toLocaleString("vi-VN")}d</span>
                {discPct > 0 && (
                  <>
                    <span className="text-gray-400 line-through">{origP.toLocaleString("vi-VN")}d</span>
                    <Badge variant="discount">-{discPct}%</Badge>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-brand-dark font-medium mt-2 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand" />
                  Tiet kiem {savings.toLocaleString("vi-VN")}d
                </p>
              )}
            </div>

            {product.description && (
              <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm border-l-4 border-l-brand-secondary/60">
                <h3 className="font-semibold text-gray-800 mb-2">
                  <span className="text-brand-dark">Mo ta</span>
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">So luong:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={function () {
                      setQty(function (q) {
                        return Math.max(1, q - 1);
                      });
                    }}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-medium">{qty}</span>
                  <button
                    onClick={function () {
                      setQty(function (q) {
                        return Math.min(remaining || 99, q + 1);
                      });
                    }}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={remaining === 0}
                  className={
                    (addedToCart ? "bg-green-500! text-white!" : "bg-brand! text-gray-900! hover:opacity-90!") +
                    " focus:ring-brand/40"
                  }
                >
                  {addedToCart ? "Da them vao gio" : remaining === 0 ? "Het hang" : "Them vao gio hang"}
                </Button>
                <Button variant="secondary" size="lg" className="border-brand/50! text-brand-dark! hover:bg-brand/10!">
                  ♡
                </Button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">San pham lien quan</h2>
            <p className="text-sm text-gray-500 mb-6">Cung danh muc {product.categoryName}</p>
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
