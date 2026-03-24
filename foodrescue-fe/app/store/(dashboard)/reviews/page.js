"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiSellerGetProductsWithRatings } from "@/lib/api";
import Button from "@/components/common/Button";

export default function SellerReviewsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchAllProducts();
  }, [page]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiSellerGetProductsWithRatings({
        page,
        size,
      });
      if (response.ok && response.data?.data) {
        const data = response.data.data;
        setAllProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      } else {
        setError(response.data?.message || "Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics - only from products with reviews
  const reviewedProducts = allProducts.filter(p => p.reviewCount > 0);
  const stats = {
    totalProducts: allProducts.length,
    reviewedProducts: reviewedProducts.length,
    unreviewedProducts: allProducts.filter(p => p.reviewCount === 0).length,
    totalReviews: reviewedProducts.reduce((sum, p) => sum + (p.reviewCount || 0), 0),
    avgRating: reviewedProducts.length > 0 
      ? (reviewedProducts.reduce((sum, p) => sum + (p.avgRating * (p.reviewCount || 1)), 0) / reviewedProducts.reduce((sum, p) => sum + (p.reviewCount || 0), 0)).toFixed(1)
      : 0,
    ratingBreakdown: {
      5: reviewedProducts.filter(p => p.avgRating >= 4.5).length,
      4: reviewedProducts.filter(p => p.avgRating >= 3.5 && p.avgRating < 4.5).length,
      3: reviewedProducts.filter(p => p.avgRating >= 2.5 && p.avgRating < 3.5).length,
      2: reviewedProducts.filter(p => p.avgRating >= 1.5 && p.avgRating < 2.5).length,
      1: reviewedProducts.filter(p => p.avgRating < 1.5).length,
    },
    positivePercent: reviewedProducts.length > 0 
      ? Math.round((reviewedProducts.filter(p => p.avgRating >= 4).length / reviewedProducts.length) * 100)
      : 0,
  };

  // Filter products based on search and rating
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === 0 || Math.floor(product.avgRating) === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Get high-rated (4+ stars) and low-rated (<3 stars) products
  const highRatedProducts = allProducts
    .filter((p) => p.avgRating >= 4)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 6);
  const lowRatedProducts = allProducts
    .filter((p) => p.avgRating < 3 && p.reviewCount > 0)
    .sort((a, b) => a.avgRating - b.avgRating)
    .slice(0, 6);

  // Product card component with modern design
  const FeaturedProductCard = ({ product }) => (
    <Link href={`/store/reviews/${product.id}`}>
      <div className="group relative cursor-pointer h-full flex flex-col bg-white rounded-2xl border-2 border-amber-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-amber-400">
        {/* Best Seller Badge */}
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
          BEST SELLER
        </div>

        {/* Rating Badge Top Right */}
        <div className="absolute top-3 right-3 z-10 bg-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg border-2 border-amber-300">
          <span className="text-2xl font-bold text-amber-600">{product.avgRating?.toFixed(1) || "0"}</span>
          <span className="text-xs text-amber-600">⭐</span>
        </div>

        {/* Image */}
        <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
          {product.primaryImageUrl ? (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <span className="text-6xl">📦</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-4 text-lg group-hover:text-amber-600 transition">
            {product.name}
          </h3>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <div>
                <p className="text-xs text-gray-600">Đánh giá</p>
                <p className="font-bold text-gray-900">{product.reviewCount || 0}</p>
              </div>
            </div>
            <div className="flex-1"></div>
            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition transform group-hover:scale-105">
              Xem chi tiết →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );

  // Warning product card - LOW RATED
  const WarningProductCard = ({ product }) => (
    <Link href={`/store/reviews/${product.id}`}>
      <div className="group cursor-pointer flex flex-col rounded-xl border-2 border-red-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white relative">
        {/* Warning Badge */}
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
          ⚠️ CẦN CẢI THIỆN
        </div>

        {/* Image container */}
        <div className="relative w-full h-40 overflow-hidden bg-gray-100">
          {product.primaryImageUrl ? (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <span className="text-4xl">📦</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 text-sm">
            {product.name}
          </h3>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex items-center gap-1">
              <span className="text-base">⭐</span>
              <span className="font-bold text-gray-900">{product.avgRating?.toFixed(1) || "0"}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 ml-auto">
              <span>💬</span>
              <span className="text-sm">{product.reviewCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  // Stats card component
  const StatCounter = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-semibold">Lỗi</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Đánh giá</h1>
          <p className="text-gray-600 text-sm">Theo dõi và phân tích đánh giá từ khách hàng</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCounter 
            label="Tất cả sản phẩm" 
            value={stats.totalProducts}
            icon="📦"
          />
          <StatCounter 
            label="Đã phản hồi" 
            value={stats.reviewedProducts}
            icon="✅"
          />
          <StatCounter 
            label="Chưa phản hồi" 
            value={stats.unreviewedProducts}
            icon="⏳"
          />
          <StatCounter 
            label="Tổng bình luận" 
            value={stats.totalReviews}
            icon="💬"
          />
        </div>

        {/* Featured High Rated Products */}
        {highRatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  ⭐ Sản phẩm xuất sắc
                </h2>
                <p className="text-sm text-gray-600 mt-1">Những sản phẩm được khách hàng yêu thích nhất</p>
              </div>
              <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold">
                {highRatedProducts.length} sản phẩm
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {highRatedProducts.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Low Rated Products Section */}
        {lowRatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  🔧 Cần cải thiện
                </h2>
                <p className="text-sm text-gray-600 mt-1">Những sản phẩm cần sự chú ý để cải thiện chất lượng</p>
              </div>
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">
                {lowRatedProducts.length} sản phẩm
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lowRatedProducts.map((product) => (
                <WarningProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Tìm kiếm</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Lọc theo sao</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setRatingFilter(0);
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    ratingFilter === 0
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tất cả
                </button>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setRatingFilter(star);
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      ratingFilter === star
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {"⭐".repeat(star)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Products Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Tất cả sản phẩm được đánh giá
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="text-center">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 mt-4 font-medium">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">
                {allProducts.length === 0 
                  ? "Bạn chưa có sản phẩm nào được đánh giá"
                  : "Không tìm thấy sản phẩm phù hợp"}
              </p>
            </div>
          ) : (
            <>
              {/* Products Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Đánh giá
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Bình luận
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.primaryImageUrl && (
                                <img
                                  src={product.primaryImageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 rounded object-cover bg-gray-100"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate text-sm">
                                  {product.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">⭐</span>
                              <span className="font-semibold text-gray-900">
                                {product.avgRating?.toFixed(1) || "0"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-gray-700 font-medium text-sm">
                              {product.reviewCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/store/reviews/${product.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                            >
                              Xem chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, page - 3) + i;
                      if (pageNum >= totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`min-w-10 h-10 px-2 rounded-lg font-medium transition text-sm ${
                            page === pageNum
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition text-sm flex items-center gap-2"
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
    </div>
  );
}

