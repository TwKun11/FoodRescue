// FE02-002 – Trang Danh sách sản phẩm — sử dụng API
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import ProductCard from "@/components/customer/ProductCard";
import { apiGetProducts, apiGetCategories } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "salePrice_asc", label: "Giá: thấp → cao" },
  { value: "salePrice_desc", label: "Giá: cao → thấp" },
];

const PAGE_SIZE = 12;

function mapProduct(p) {
  const defaultSku = p.variants?.find((s) => s.isDefault) || p.variants?.[0];
  const salePrice = defaultSku?.salePrice ?? 0;
  const listPrice = defaultSku?.listPrice ?? salePrice;
  const discountPercent = listPrice > 0 ? Math.round(((listPrice - salePrice) / listPrice) * 100) : 0;
  const stock = defaultSku?.stockAvailable ?? 0;
  return {
    id: String(p.id),
    name: p.name,
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice: listPrice,
    discountPrice: salePrice,
    discountPercent,
    storeName: p.sellerName || "",
    expiryLabel: p.shelfLifeDays ? `HSD: ${p.shelfLifeDays} ngày` : "",
    expiryHours: p.shelfLifeDays ? p.shelfLifeDays * 24 : 999,
    stock,
    categoryId: p.categoryId,
  };
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
    <div className="min-h-screen bg-brand-bg">
      {/* Hero search banner */}
      <div className="bg-gradient-to-r from-brand-secondary to-brand-dark">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-14">
          <h1 className="text-3xl font-extrabold text-white mb-1">Sản phẩm ưu đãi</h1>
          <p className="text-white/80 text-sm mb-6">Hàng chất lượng, giá tốt — giảm lãng phí thực phẩm cùng nhau.</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Tìm thức ăn hoặc cửa hàng..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-0 bg-white/20 backdrop-blur text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-inner transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Category pills (card floating over banner) */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-4 py-3 mb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCategoryId(null);
              setCurrentPage(0);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              categoryId == null
                ? "bg-brand-dark text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            Tất cả
          </button>
          {categoryOptions.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategoryId(c.id);
                setCurrentPage(0);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoryId === c.id
                  ? "bg-brand-dark text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {c.name}
            </button>
          ))}
          <div className="ml-auto shrink-0">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(0);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result count + clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-sm text-gray-500">
            {loading ? (
              "Đang tải..."
            ) : (
              <>
                <span className="font-bold text-gray-800">{totalElements}</span> sản phẩm
              </>
            )}
          </span>
          {hasActiveFilters && !loading && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-brand-dark hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa bộ lọc
            </button>
          )}
        </div>

        {error ? (
          <div className="bg-white rounded-2xl border border-red-100 text-center py-16 px-4">
            <p className="text-5xl mb-3">⚠️</p>
            <p className="text-gray-700 font-semibold mb-1">{error}</p>
            <p className="text-gray-400 text-sm mb-4">Kiểm tra kết nối và thử lại.</p>
            <button
              onClick={fetchProducts}
              className="px-5 py-2.5 rounded-xl bg-brand-dark text-white font-semibold text-sm hover:bg-brand-secondary transition"
            >
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-4">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-gray-700 font-semibold">Không tìm thấy sản phẩm phù hợp</p>
            <p className="text-gray-400 text-sm mt-1">Thử đổi từ khóa hoặc danh mục khác.</p>
            <button
              onClick={clearFilters}
              className="mt-5 px-5 py-2.5 rounded-xl bg-brand-dark text-white font-semibold text-sm hover:bg-brand-secondary transition"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <span
                        key={`dot-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                          currentPage === p
                            ? "bg-brand-dark text-white shadow-sm"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p + 1}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
