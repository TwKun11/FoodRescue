// FE02-002 – UI Trang Danh sách sản phẩm (đồng bộ brand, phân trang)
"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import ProductCard from "@/components/customer/ProductCard";
import Badge from "@/components/common/Badge";

// Ảnh theo tên file trong public/images/products/
const ALL_PRODUCTS = [
  { id: "1", name: "Rau cải xanh hữu cơ 500g", image: "/images/products/raucai.jpg", originalPrice: 35000, discountPrice: 17500, discountPercent: 50, expiryLabel: "Còn 3 giờ", storeName: "Vinmart Q1", category: "rau", expiryHours: 3 },
  { id: "2", name: "Thịt heo ba chỉ 300g", image: "/images/products/thitheo.jpg", originalPrice: 85000, discountPrice: 51000, discountPercent: 40, expiryLabel: "Còn 5 giờ", storeName: "Circle K", category: "thit", expiryHours: 5 },
  { id: "3", name: "Tôm sú tươi 200g", image: "/images/products/tomsu.jpg", originalPrice: 120000, discountPrice: 84000, discountPercent: 30, expiryLabel: "Còn 2 giờ", storeName: "Lotte Mart Q7", category: "haisan", expiryHours: 2 },
  { id: "4", name: "Bánh mì sandwich nguyên cám", image: "/images/products/banhmi.jpg", originalPrice: 45000, discountPrice: 22500, discountPercent: 50, expiryLabel: "Còn 1 giờ", storeName: "BreadTalk", category: "banh", expiryHours: 1 },
  { id: "5", name: "Bắp cải tím 700g", image: "/images/products/bapcai.jpg", originalPrice: 28000, discountPrice: 16800, discountPercent: 40, expiryLabel: "Còn 4 giờ", storeName: "Co.opmart", category: "rau", expiryHours: 4 },
  { id: "6", name: "Cá basa phi lê 400g", image: "/images/products/ca-ba-sa.jpg.webp", originalPrice: 75000, discountPrice: 45000, discountPercent: 40, expiryLabel: "Còn 6 giờ", storeName: "Metro Q12", category: "haisan", expiryHours: 6 },
  { id: "7", name: "Dưa leo 1kg", image: "/images/products/dualeo.jpg", originalPrice: 20000, discountPrice: 10000, discountPercent: 50, expiryLabel: "Còn 2 giờ", storeName: "Emart", category: "rau", expiryHours: 2 },
  { id: "8", name: "Mực ống tươi 250g", image: "/images/products/muc.jpg", originalPrice: 95000, discountPrice: 66500, discountPercent: 30, expiryLabel: "Còn 3 giờ", storeName: "Aeon", category: "haisan", expiryHours: 3 },
  { id: "9", name: "Sườn heo non 400g", image: "/images/products/suonheo.jpg", originalPrice: 110000, discountPrice: 55000, discountPercent: 50, expiryLabel: "Còn 4 giờ", storeName: "Vinmart Q3", category: "thit", expiryHours: 4 },
  { id: "10", name: "Bánh croissant bơ 4 cái", image: "/images/products/croissant.jpg", originalPrice: 60000, discountPrice: 36000, discountPercent: 40, expiryLabel: "Còn 2 giờ", storeName: "Paris Baguette", category: "banh", expiryHours: 2 },
  { id: "11", name: "Cua biển tươi 500g", image: "/images/products/cua.jpg", originalPrice: 200000, discountPrice: 100000, discountPercent: 50, expiryLabel: "Còn 5 giờ", storeName: "Seafood Market", category: "haisan", expiryHours: 5 },
  { id: "12", name: "Cà chua bi 300g", image: "/images/products/cachua.jpg", originalPrice: 18000, discountPrice: 9000, discountPercent: 50, expiryLabel: "Còn 6 giờ", storeName: "GreenMart", category: "rau", expiryHours: 6 },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "rau", label: "Rau củ" },
  { value: "thit", label: "Thịt" },
  { value: "haisan", label: "Hải sản" },
  { value: "banh", label: "Bánh" },
];

const SORT_OPTIONS = [
  { value: "discount_desc", label: "Giảm giá: cao → thấp" },
  { value: "price_asc", label: "Giá: thấp → cao" },
  { value: "price_desc", label: "Giá: cao → thấp" },
  { value: "expiry_asc", label: "HSD: sắp hết trước" },
];

const ITEMS_PER_PAGE = 8;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("discount_desc");
  const [priceRange, setPriceRange] = useState([0, 250000]);
  const [discountMin, setDiscountMin] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    if (filterOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [filterOpen]);

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];
    // Tìm kiếm theo tên sản phẩm hoặc tên cửa hàng
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.storeName && p.storeName.toLowerCase().includes(q))
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    list = list.filter((p) => p.discountPrice >= priceRange[0] && p.discountPrice <= priceRange[1]);
    list = list.filter((p) => p.discountPercent >= discountMin);
    switch (sort) {
      case "discount_desc": list.sort((a, b) => b.discountPercent - a.discountPercent); break;
      case "price_asc": list.sort((a, b) => a.discountPrice - b.discountPrice); break;
      case "price_desc": list.sort((a, b) => b.discountPrice - a.discountPrice); break;
      case "expiry_asc": list.sort((a, b) => a.expiryHours - b.expiryHours); break;
    }
    return list;
  }, [search, category, sort, priceRange, discountMin]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort, priceRange, discountMin]);

  const clearAllFilters = () => {
    setSearch("");
    setCategory("");
    setDiscountMin(0);
    setPriceRange([0, 250000]);
    setCurrentPage(1);
  };

  const hasActiveFilters = search.trim() || category || discountMin > 0 || priceRange[1] < 250000;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sản phẩm ưu đãi</h1>
        <p className="text-gray-500 text-sm mb-6">Tìm món ăn hoặc cửa hàng bạn thích, lọc theo giá và % giảm giá.</p>

        {/* Thanh tìm kiếm */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thức ăn hoặc cửa hàng..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand shadow-sm transition"
            aria-label="Tìm kiếm sản phẩm hoặc cửa hàng"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              aria-label="Xóa tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Danh mục + Lọc & Sắp xếp — gọn trên một dải */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex p-1 bg-white/80 border border-gray-100 rounded-2xl shadow-sm">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  category === opt.value
                    ? "bg-brand text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto" ref={filterRef}>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFilterOpen((o) => !o); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
                  filterOpen || (discountMin > 0 || priceRange[1] < 250000)
                    ? "bg-brand border-brand text-gray-900"
                    : "bg-white border-gray-200 text-gray-600 hover:border-brand/50 hover:bg-brand/5"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Lọc
                {(discountMin > 0 || priceRange[1] < 250000) && (
                  <span className="w-5 h-5 rounded-full bg-white/40 flex items-center justify-center text-xs font-bold">!</span>
                )}
                <svg className={`w-4 h-4 transition ${filterOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl p-5 z-50">
                  <p className="text-sm font-semibold text-gray-800 mb-4">Bộ lọc</p>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Khoảng giá (giá sau giảm)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={250000}
                          step={10000}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="flex-1 h-2 rounded-full bg-gray-100 accent-brand-dark"
                        />
                        <span className="text-sm font-semibold text-gray-700 tabular-nums w-20 text-right">
                          ≤ {priceRange[1].toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Giảm giá tối thiểu</label>
                      <div className="flex flex-wrap gap-2">
                        {[0, 30, 40, 50].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setDiscountMin(v)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                              discountMin === v ? "bg-brand text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {v === 0 ? "Tất cả" : `≥ ${v}%`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDiscountMin(0); setPriceRange([0, 250000]); }}
                      className="text-sm font-medium text-brand-dark hover:underline w-full text-left"
                    >
                      Đặt lại lọc giá & giảm giá
                    </button>
                  </div>
                </div>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Số kết quả + Xóa hết bộ lọc (khi có) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{filtered.length}</span> sản phẩm
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm font-medium text-brand-dark hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa tìm kiếm & lọc
            </button>
          )}
        </div>

        {/* Khu vực sản phẩm + phân trang (full width) */}
        <div className="min-w-0">

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-brand/20 shadow-sm text-center py-16 px-4">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-gray-600 font-medium">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-gray-500 text-sm mt-1">Thử đổi từ khóa, danh mục hoặc bộ lọc.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand/10 text-brand-dark font-medium text-sm hover:bg-brand/20 transition"
                >
                  Xóa tìm kiếm & lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedList.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-xl text-sm font-medium border border-brand/30 text-brand-dark hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                          currentPage === page
                            ? "bg-brand text-gray-900 shadow-sm"
                            : "border border-brand/30 text-brand-dark hover:bg-brand/10"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
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
    </div>
  );
}
