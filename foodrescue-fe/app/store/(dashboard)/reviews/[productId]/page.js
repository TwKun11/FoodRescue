"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiSellerGetProductReviews } from "@/lib/api";
import Link from "next/link";

export default function ProductReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProductReviews();
    }
  }, [productId, page]);

  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiSellerGetProductReviews(productId, {
        page,
        size,
      });

      if (response.ok && response.data?.data) {
        setReviews(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
        setTotalElements(response.data.data.totalElements || 0);
      } else {
        setError(response.data?.message || "Không thể tải đánh giá");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 2.5) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4.5) return "bg-green-50";
    if (rating >= 3.5) return "bg-yellow-50";
    if (rating >= 2.5) return "bg-orange-50";
    return "bg-red-50";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/store/reviews"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Quay lại
          </Link>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href="/store/reviews"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block font-medium"
        >
          ← Quay lại danh sách sản phẩm
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đánh giá sản phẩm</h1>
          <p className="text-gray-600">
            Tổng số đánh giá: <span className="font-semibold">{totalElements}</span>
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-xl">Sản phẩm này chưa có đánh giá nào</p>
          </div>
        ) : (
          <>
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`${getRatingBgColor(review.rating)} rounded-lg shadow p-6 border-l-4 ${
                    review.rating >= 4
                      ? "border-green-500"
                      : review.rating >= 3
                      ? "border-yellow-500"
                      : "border-red-500"
                  }`}
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">{review.userName || "Ẩn danh"}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>
                      {review.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="mb-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < Math.floor(review.rating) ? "text-lg" : "text-lg"}>
                          {i < Math.floor(review.rating) ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  )}

                  {/* Review Images */}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Hình ảnh:</p>
                      <div className="flex flex-wrap gap-2">
                        {review.imageUrls.map((imageUrl, idx) => (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt={`Review image ${idx + 1}`}
                            className="w-20 h-20 rounded object-cover cursor-pointer hover:opacity-75 transition"
                            onClick={() => window.open(imageUrl, "_blank")}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      📝 Phản hồi
                    </button>
                    <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                      🚫 Báo cáo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 font-medium"
                >
                  ← Trước
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, page - 2) + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 font-medium"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
