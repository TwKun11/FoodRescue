// FE02-002 – Trang Danh sách sản phẩm — sử dụng API
"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
    apiGetProducts({ categoryId, keyword: debouncedSearch || undefined, page: currentPage, size: PAGE_SIZE })
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
  }, [categoryId, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    setCurrentPage(0);
  }, [categoryId, debouncedSearch, sort]);

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sản phẩm ưu đãi</h1>
        <p className="text-gray-500 text-sm mb-6">Tìm món ăn hoặc cửa hàng bạn thích.</p>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thức ăn hoặc cửa hàng..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-sm transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex flex-wrap gap-1 p-1 bg-white/80 border border-gray-100 rounded-2xl shadow-sm">
            <button
              onClick={() => setCategoryId(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${categoryId == null ? "bg-brand text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              Tất cả
            </button>
            {categoryOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${categoryId === c.id ? "bg-brand text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-sm text-gray-600">
            {loading ? (
              "Đang tải..."
            ) : (
              <>
                <span className="font-semibold text-gray-800">{totalElements}</span> sản phẩm
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
            <p className="text-4xl mb-2">⚠️</p>
            <p className="text-gray-600 font-medium">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-4 py-2 rounded-xl bg-brand/10 text-brand-dark font-medium text-sm hover:bg-brand/20 transition"
            >
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-brand/20 shadow-sm text-center py-16 px-4">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-gray-600 font-medium">Không tìm thấy sản phẩm phù hợp</p>
            <p className="text-gray-500 text-sm mt-1">Thử đổi từ khóa hoặc danh mục.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-brand/10 text-brand-dark font-medium text-sm hover:bg-brand/20 transition"
            >
              Xóa bộ lọc
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
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 rounded-xl text-sm font-medium border border-brand/30 text-brand-dark hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition ${currentPage === p ? "bg-brand text-gray-900 shadow-sm" : "border border-brand/30 text-brand-dark hover:bg-brand/10"}`}
                  >
                    {p + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 rounded-xl text-sm font-medium border border-brand/30 text-brand-dark hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
