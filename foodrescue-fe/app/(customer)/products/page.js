// FE02-002 – Trang Danh sách sản phẩm (layout mới: carousel, thanh danh mục, lọc, grid 3x4, 12/trang)
"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ProductCardListing from "@/components/customer/ProductCardListing";
import BannerCarousel from "@/components/customer/BannerCarousel";
import { apiGetProducts, apiGetCategories, apiGetActiveBannerAds } from "@/lib/api";
import { formatDistanceMeters, getCurrentPosition, haversineDistanceMeters } from "@/lib/location";
import { resolveVariantPricing } from "@/lib/product-pricing";
import { fetchProvinces, fetchDistricts, fetchWards } from "@/lib/vn-locations";

const PAGE_SIZE = 12;
const VISIBLE_ROOT_CATEGORIES = 5;

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "salePrice_asc", label: "Giá thấp đến cao" },
  { value: "salePrice_desc", label: "Giá cao đến thấp" },
  { value: "discount_desc", label: "Giảm giá nhiều" },
];

const PRICE_RANGES = [
  { id: "all", label: "Tất cả giá", min: null, max: null },
  { id: "under30", label: "Dưới 30k", min: 0, max: 30000 },
  { id: "30-50", label: "30k - 50k", min: 30000, max: 50000 },
  { id: "50-100", label: "50k - 100k", min: 50000, max: 100000 },
  { id: "over100", label: "Trên 100k", min: 100000, max: null },
];

// Banner carousel – mặc định hiển thị; khi có API banner thì gọi setBanners(data) để thay thế
const DEFAULT_BANNERS = [
  {
    id: "b1",
    productId: "1",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
    title: "Rau củ tươi – Giảm đến 50%",
    storeName: "Cửa hàng Xanh Sạch",
  },
  {
    id: "b2",
    productId: "1",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80",
    title: "Bánh mì mới ra lò – Deal sáng",
    storeName: "Bakery Cứu Trợ",
  },
  {
    id: "b3",
    productId: "1",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80",
    title: "Trái cây tươi – Giải cứu thực phẩm",
    storeName: "Fruit & Save",
  },
  {
    id: "b4",
    productId: "1",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
    title: "Bữa ăn sẵn – Giá sốc cuối ngày",
    storeName: "Food Rescue Hub",
  },
];

function DealFlashIcon({ className, active }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function PriceTagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function FlashSaleIcon({ className, active }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function LocationPinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function normalizeLocationText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mapProductFromApi(p) {
  const defaultSku = p.variants?.find((s) => s.isDefault) || p.variants?.[0];
  const pricing = resolveVariantPricing(defaultSku);
  const shelfDays = p.shelfLifeDays ?? 0;
  const expiryAt = shelfDays ? new Date(Date.now() + shelfDays * 24 * 60 * 60 * 1000).toISOString() : null;
  const address = p.sellerPickupAddress || [p.originProvince].filter(Boolean).join(", ") || "";
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice: pricing.originalPrice,
    discountPrice: pricing.discountPrice,
    discountPercent: pricing.discountPercent,
    storeName: p.sellerName || "",
    expiryAt,
    expiryLabel: shelfDays ? `Hết hạn trong: ${shelfDays} ngày` : "",
    rating: p.sellerRatingAvg != null ? Number(p.sellerRatingAvg) : 0,
    categoryId: p.categoryId,
    address,
    province: p.originProvince,
    sellerLatitude: p.sellerLatitude ?? null,
    sellerLongitude: p.sellerLongitude ?? null,
    distanceMeters: null,
    distanceLabel: "",
    district: null,
    ward: null,
    stock: defaultSku?.stockAvailable ?? defaultSku?.stockQuantity ?? 0,
  };
}

export default function ProductsPage() {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState("createdAt_desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [priceRangeId, setPriceRangeId] = useState("all");
  const [deepDiscount, setDeepDiscount] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [viewerLocation, setViewerLocation] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(null);
  const [seeMoreCategoriesOpen, setSeeMoreCategoriesOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    apiGetCategories().then(({ ok, data }) => {
      if (ok && data?.data) setCategories(data.data);
    });
  }, []);

  useEffect(() => {
    apiGetActiveBannerAds().then((res) => {
      if (res.ok && res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setBanners(
          res.data.data.map((b) => ({
            id: b.id,
            image: b.imageUrl,
            title: b.title || "",
            link: b.linkUrl || "#",
            storeName: "",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict("");
      setSelectedWard("");
      setWards([]);
      return;
    }
    const code = provinces.find((p) => p.name === selectedProvince)?.code;
    if (code) fetchDistricts(code).then(setDistricts).catch(() => setDistricts([]));
    else setDistricts([]);
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const code = districts.find((d) => d.name === selectedDistrict)?.code;
    if (code) fetchWards(code).then(setWards).catch(() => setWards([]));
    else setWards([]);
    setSelectedWard("");
  }, [selectedDistrict, districts]);

  useEffect(() => {
    if (!nearMe || viewerLocation) return;
    getCurrentPosition()
      .then((position) => {
        setViewerLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      })
      .catch(() => {
        toast.error("Khong lay duoc vi tri hien tai de tinh khoang cach.");
      });
  }, [nearMe, viewerLocation]);

  const rootCategories = useMemo(() => {
    const fromApi = categories.filter((c) => !c.parentId);
    return fromApi.slice(0, VISIBLE_ROOT_CATEGORIES);
  }, [categories]);

  const restCategories = useMemo(() => {
    const fromApi = categories.filter((c) => !c.parentId);
    return fromApi.slice(VISIBLE_ROOT_CATEGORIES);
  }, [categories]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    const effectiveSort = categoryId === "deal" ? "discount_desc" : sort;
    const effectiveCategoryId = categoryId === "deal" ? undefined : categoryId;
    const priceRange = PRICE_RANGES.find((r) => r.id === priceRangeId);
    const minPrice = priceRange?.min ?? undefined;
    const maxPrice = priceRange?.max ?? undefined;
    const province = nearMe && selectedProvince ? selectedProvince : undefined;
    const useClientLocationRefine = nearMe && !!selectedProvince && (!!selectedDistrict || !!selectedWard);
    apiGetProducts({
      categoryId: effectiveCategoryId,
      keyword: debouncedSearch || undefined,
      sort: effectiveSort,
      minPrice,
      maxPrice,
      province,
      page: useClientLocationRefine ? 0 : currentPage,
      size: useClientLocationRefine ? 200 : PAGE_SIZE,
    })
      .then(({ ok, data }) => {
        if (ok && data?.data) {
          const page = data.data;
          setProducts(
            (page.content || []).map((item) => {
              const product = mapProductFromApi(item);
              const distanceMeters = viewerLocation
                ? haversineDistanceMeters(viewerLocation, {
                    latitude: product.sellerLatitude,
                    longitude: product.sellerLongitude,
                  })
                : null;
              return {
                ...product,
                distanceMeters,
                distanceLabel: distanceMeters != null ? `Cách bạn ${formatDistanceMeters(distanceMeters)}` : "",
              };
            }),
          );
          setTotalPages(page.totalPages || 1);
          setTotalElements(page.totalElements || 0);
          if (useClientLocationRefine) {
            const mappedProducts = (page.content || []).map((item) => {
              const product = mapProductFromApi(item);
              const distanceMeters = viewerLocation
                ? haversineDistanceMeters(viewerLocation, {
                    latitude: product.sellerLatitude,
                    longitude: product.sellerLongitude,
                  })
                : null;
              return {
                ...product,
                distanceMeters,
                distanceLabel: distanceMeters != null ? `CÃ¡ch báº¡n ${formatDistanceMeters(distanceMeters)}` : "",
              };
            });
            const districtNeedle = normalizeLocationText(selectedDistrict);
            const wardNeedle = normalizeLocationText(selectedWard);
            const refinedProducts = mappedProducts.filter((product) => {
              const haystack = normalizeLocationText([product.address, product.province].filter(Boolean).join(" "));
              const districtOk = !districtNeedle || haystack.includes(districtNeedle);
              const wardOk = !wardNeedle || haystack.includes(wardNeedle);
              return districtOk && wardOk;
            });
            const start = currentPage * PAGE_SIZE;
            setProducts(refinedProducts.slice(start, start + PAGE_SIZE));
            setTotalPages(Math.max(1, Math.ceil(refinedProducts.length / PAGE_SIZE)));
            setTotalElements(refinedProducts.length);
          }
        } else {
          setError(data?.message || "Không thể tải sản phẩm");
          setProducts([]);
        }
      })
      .catch(() => {
        setError("Lỗi kết nối máy chủ");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [categoryId, debouncedSearch, sort, currentPage, priceRangeId, nearMe, selectedProvince, selectedDistrict, selectedWard, viewerLocation]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId(null);
    setPriceRangeId("all");
    setDeepDiscount(false);
    setNearMe(false);
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setCurrentPage(0);
  };

  const handleAddToCart = (product) => {
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`, {
      duration: 3500,
      icon: "🛒",
    });
    // TODO: gọi API / state giỏ hàng khi có backend
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Carousel banner – truyền banners từ API khi có (ví dụ: setBanners(data)) */}
        {banners.length > 0 && (
          <section className="mb-8">
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/60">
              <BannerCarousel banners={banners} />
            </div>
          </section>
        )}

        {/* Thanh danh mục + bộ lọc */}
        <section className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-emerald-200/80 pb-4">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => { setCategoryId(categoryId === "deal" ? null : "deal"); setCurrentPage(0); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm ${
                categoryId === "deal"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-200 hover:from-amber-500 hover:to-orange-600"
                  : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <DealFlashIcon className="w-5 h-5 shrink-0" active={categoryId === "deal"} />
              Deal hời
            </button>
            <button
              onClick={() => { setCategoryId(null); setCurrentPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                categoryId === null ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
              }`}
            >
              Tất cả
            </button>
            {rootCategories.map((cat) => {
              const hasChildren = cat.children?.length > 0;
              const isOpen = categoryDropdownOpen === cat.id;
              return (
                <div key={cat.id} className="relative">
                  <button
                    onClick={() => {
                      if (hasChildren) setCategoryDropdownOpen(isOpen ? null : cat.id);
                      else { setCategoryId(cat.id); setCurrentPage(0); setCategoryDropdownOpen(null); }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1 ${
                      categoryId === cat.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}
                  >
                    {cat.name}
                    {hasChildren && (
                      <svg className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {hasChildren && isOpen && (
                    <div className="absolute top-full left-0 mt-1 py-2 bg-white rounded-xl shadow-lg border border-slate-100 z-20 min-w-[180px]">
                      {(cat.children || []).map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => { setCategoryId(ch.id); setCurrentPage(0); setCategoryDropdownOpen(null); }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          {ch.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {restCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setSeeMoreCategoriesOpen((v) => !v)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center gap-1"
                >
                  Xem thêm
                  <svg className={`w-4 h-4 ${seeMoreCategoriesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {seeMoreCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-1 py-2 bg-white rounded-xl shadow-lg border border-slate-100 z-20 min-w-[200px] max-h-64 overflow-y-auto">
                    {restCategories.map((cat) => (
                      <div key={cat.id}>
                        <button
                          onClick={() => { setCategoryId(cat.id); setCurrentPage(0); setSeeMoreCategoriesOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          {cat.name}
                        </button>
                        {(cat.children || []).map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() => { setCategoryId(ch.id); setCurrentPage(0); setSeeMoreCategoriesOpen(false); }}
                            className="block w-full text-left pl-6 py-1.5 text-sm hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            {ch.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Layout: Sidebar trái (bộ lọc) + Nội dung phải (danh sách sản phẩm) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar bộ lọc – bên trái */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 sticky top-24">
              <h3 className="text-base font-bold text-slate-800">Bộ lọc</h3>

              {/* Khoảng giá */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
                  <PriceTagIcon className="w-4 h-4 text-slate-500" />
                  Khoảng giá
                </label>
                <select
                  value={priceRangeId}
                  onChange={(e) => { setPriceRangeId(e.target.value); setCurrentPage(0); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 py-2.5 pl-9 text-slate-800 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-9"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Khuyến mãi sâu */}
              <div>
                <button
                  type="button"
                  onClick={() => { setDeepDiscount(!deepDiscount); setCurrentPage(0); }}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm ${
                    deepDiscount
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-200 hover:from-amber-500 hover:to-orange-600"
                      : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:border-amber-200 border border-transparent"
                  }`}
                >
                  <FlashSaleIcon className="w-5 h-5 shrink-0" active={deepDiscount} />
                  Khuyến mãi sâu
                </button>
              </div>

              {/* Gần tôi */}
              <div>
                <button
                  type="button"
                  onClick={() => { setNearMe(!nearMe); setCurrentPage(0); }}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
                    nearMe ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  <LocationPinIcon className={`w-5 h-5 shrink-0 ${nearMe ? "text-[#0f2319]" : "text-red-500"}`} />
                  Gần tôi
                </button>
                {nearMe && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-600">Lọc theo địa điểm</p>
                    <select
                      value={selectedProvince}
                      onChange={(e) => { setSelectedProvince(e.target.value); setCurrentPage(0); }}
                      className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(0); }}
                      className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white"
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedWard}
                      onChange={(e) => { setSelectedWard(e.target.value); setCurrentPage(0); }}
                      className="w-full border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white"
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Nội dung chính: tìm kiếm + sắp xếp + danh sách sản phẩm */}
          <div className="flex-1 min-w-0">
        {/* Tìm kiếm + Xóa bộ lọc */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
              placeholder="Tìm kiếm sản phẩm, cửa hàng..."
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-sm"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline shrink-0">
            Xóa bộ lọc
          </button>
        </div>

        {/* Điểm nhấn: tiêu đề khu vực sản phẩm */}
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            <span className="inline-block border-b-2 border-emerald-500 pb-0.5">Sản phẩm</span>
          </h2>
          <p className="text-slate-500 text-sm">
            {loading ? "Đang tải..." : `${products.length} / ${totalElements} sản phẩm`}
          </p>
        </div>

        {error && (
          <div className="bg-white rounded-2xl border border-red-100 text-center py-16 px-6">
            <p className="text-slate-800 font-semibold mb-2">{error}</p>
            <button onClick={fetchProducts} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700">
              Thử lại
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-5 bg-slate-100 rounded w-1/2" />
                  <div className="h-6 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 text-center py-20 px-6">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-slate-700 font-semibold mb-2">Không tìm thấy sản phẩm phù hợp</p>
            <button onClick={clearFilters} className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700">
              Xem tất cả
            </button>
          </div>
        )}

        {!error && !loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCardListing key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="size-10 flex items-center justify-center rounded-lg hover:bg-emerald-100 transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "..." ? (
                        <span key={`dot-${idx}`} className="px-2 text-slate-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`size-10 flex items-center justify-center rounded-lg font-bold transition ${
                            currentPage === p ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" : "hover:bg-emerald-100"
                          }`}
                        >
                          {p + 1}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="size-10 flex items-center justify-center rounded-lg hover:bg-emerald-100 transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}
