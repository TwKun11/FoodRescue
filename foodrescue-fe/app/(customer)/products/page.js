// FE02-002 – Trang Danh sách sản phẩm — layout sidebar + grid (style mockup, màu primary #33ff99)
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import ProductCardListing from "@/components/customer/ProductCardListing";
import ScrollReveal from "@/components/common/ScrollReveal";
import { apiGetProducts, apiGetCategories } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "salePrice_asc", label: "Giá thấp đến cao" },
  { value: "salePrice_desc", label: "Giá cao đến thấp" },
];

const PAGE_SIZE = 6;

const CATEGORY_ICONS = [
  "energy_savings_leaf",
  "nutrition",
  "bakery_dining",
  "set_meal",
  "restaurant",
];

function mapProduct(p) {
  const defaultSku = p.variants?.find((s) => s.isDefault) || p.variants?.[0];
  const salePrice = defaultSku?.salePrice ?? 0;
  const listPrice = defaultSku?.listPrice ?? salePrice;
  const discountPercent = listPrice > 0 ? Math.round(((listPrice - salePrice) / listPrice) * 100) : 0;
  const stock = defaultSku?.stockAvailable ?? 0;
  const shelfDays = p.shelfLifeDays ?? 0;
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice: listPrice,
    discountPrice: salePrice,
    discountPercent,
    storeName: p.sellerName || "",
    expiryLabel: shelfDays ? `Hết hạn trong: ${shelfDays} ngày` : "",
    expiryHours: shelfDays ? shelfDays * 24 : 999,
    stock,
    categoryId: p.categoryId,
  };
}

function CategoryIcon({ name, className }) {
  const icons = {
    energy_savings_leaf: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    nutrition: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 00-2-2 2 2 0 00-2 2v3m4 0V6a2 2 0 012-2 2 2 0 012 2v3m0 13v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 01-2-2h-2a2 2 0 01-2 2m6 0V6" />
      </svg>
    ),
    bakery_dining: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    set_meal: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    restaurant: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  };
  return icons[name] || icons.restaurant;
}

export default function ProductsPage() {
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    apiGetCategories().then(({ ok, data }) => {
      if (ok && data?.data) setCategories(data.data);
    });
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    apiGetProducts({
      categoryId,
      keyword: debouncedSearch || undefined,
      sort,
      page: currentPage,
      size: PAGE_SIZE,
    })
      .then(({ ok, data }) => {
        if (ok && data?.data) {
          const page = data.data;
          setProducts((page.content || []).map(mapProduct));
          setTotalPages(page.totalPages || 1);
          setTotalElements(page.totalElements || 0);
        } else {
          setError(data?.message || "Không thể tải sản phẩm");
          setProducts([]);
        }
      })
      .catch(() => setError("Lỗi kết nối máy chủ"))
      .finally(() => setLoading(false));
  }, [categoryId, debouncedSearch, currentPage, sort]);

  useEffect(() => {
    queueMicrotask(fetchProducts);
  }, [fetchProducts]);

  const categoryOptions = useMemo(() => {
    const flat = [];
    categories.forEach((root) => {
      flat.push({ id: root.id, name: root.name });
      (root.children || []).forEach((child) => flat.push({ id: child.id, name: child.name }));
    });
    return flat;
  }, [categories]);

  const clearFilters = () => {
    setSearch("");
    setCategoryId(null);
    setCurrentPage(0);
  };
  const hasActiveFilters = search.trim() || categoryId != null;

  return (
    <div className="min-h-screen bg-[#f5f8f7]">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Bộ lọc */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <ScrollReveal direction="right">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <span className="text-brand">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                  </span>
                  Danh mục
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCategoryId(null); setCurrentPage(0); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      categoryId == null ? "bg-brand text-[#0f2319] font-bold" : "hover:bg-brand/10"
                    }`}
                  >
                    <CategoryIcon name="energy_savings_leaf" className="w-5 h-5 shrink-0" />
                    <span className="text-sm">Tất cả</span>
                  </button>
                  {categoryOptions.map((c, idx) => {
                    const iconKey = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setCategoryId(c.id); setCurrentPage(0); }}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                          categoryId === c.id ? "bg-brand text-[#0f2319] font-bold" : "hover:bg-brand/10"
                        }`}
                      >
                        <CategoryIcon name={iconKey} className="w-5 h-5 shrink-0" />
                        <span className="text-sm">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Khoảng giá - trực quan */}
            <ScrollReveal direction="right" delay={80}>
              <div>
                <h3 className="text-lg font-bold mb-4 text-slate-900">Khoảng giá (đ)</h3>
                <div className="px-2">
                  <div className="relative h-1.5 w-full bg-brand/20 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-brand rounded-full left-[10%] right-[30%]" />
                  </div>
                  <div className="flex justify-between mt-4 text-xs font-medium text-slate-500">
                    <span>0đ</span>
                    <span>500.000đ</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Khuyến mãi / Thử thách */}
            <ScrollReveal direction="right" delay={120}>
              <div className="p-4 rounded-2xl bg-linear-to-br from-brand/30 to-transparent border border-brand/20">
                <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Thử thách hôm nay</p>
                <p className="text-sm font-medium text-slate-700 mb-4">
                  Giải cứu 3 món ăn để nhận thêm 500 điểm thưởng!
                </p>
                <a
                  href="/products"
                  className="block w-full py-2 bg-brand text-[#0f2319] text-xs font-bold rounded-lg text-center hover:opacity-90 transition"
                >
                  CHI TIẾT
                </a>
              </div>
            </ScrollReveal>
          </aside>

          {/* Khu vực lưới sản phẩm */}
          <div className="flex-1 min-w-0">
            {/* Thanh tìm kiếm (trên mobile) + Header */}
            <ScrollReveal className="mb-6" direction="up">
              <div className="relative max-w-md mb-4 lg:mb-6">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
                  placeholder="Tìm kiếm thực phẩm cứu trợ..."
                  className="w-full pl-10 pr-10 py-2.5 border-none rounded-xl bg-slate-200/50 focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm text-slate-900"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </ScrollReveal>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sản phẩm cứu trợ</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {loading
                    ? "Đang tải..."
                    : `Hiển thị ${products.length} trong số ${totalElements} sản phẩm tươi ngon`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Sắp xếp:</span>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setCurrentPage(0); }}
                  className="bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-brand px-3 py-2"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {hasActiveFilters && !loading && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <ScrollReveal direction="up">
                <div className="bg-white rounded-2xl border border-red-100 text-center py-16 px-6">
                  <p className="text-4xl mb-3">⚠️</p>
                  <p className="text-slate-800 font-semibold mb-2">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="px-5 py-2.5 rounded-xl bg-brand text-[#0f2319] font-semibold text-sm hover:opacity-90"
                  >
                    Thử lại
                  </button>
                </div>
              </ScrollReveal>
            )}

            {/* Loading */}
            {!error && loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-brand/10 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-slate-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-5 bg-slate-100 rounded w-2/3" />
                      <div className="h-6 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!error && !loading && products.length === 0 && (
              <ScrollReveal direction="up">
                <div className="bg-white rounded-2xl border border-slate-100 text-center py-20 px-6">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="text-slate-700 font-semibold mb-2">Không tìm thấy sản phẩm phù hợp</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-brand text-[#0f2319] font-semibold text-sm hover:opacity-90"
                  >
                    Xem tất cả
                  </button>
                </div>
              </ScrollReveal>
            )}

            {/* Grid sản phẩm */}
            {!error && !loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <ScrollReveal key={product.id} direction="up" delay={index % 6 * 60}>
                      <ProductCardListing product={product} />
                    </ScrollReveal>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="size-10 flex items-center justify-center rounded-lg hover:bg-brand/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
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
                              className={`size-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                                currentPage === p
                                  ? "bg-brand text-[#0f2319] shadow-md shadow-brand/20"
                                  : "hover:bg-brand/10"
                              }`}
                            >
                              {p + 1}
                            </button>
                          ),
                        )}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="size-10 flex items-center justify-center rounded-lg hover:bg-brand/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
