"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiGetProductReviews, apiUpdateProductReview, apiDeleteProductReview } from "@/lib/api";

export default function ReviewDisplay({ productId, myReview, onRefresh, refreshTrigger = 0 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [productId, page, refreshTrigger]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      console.log("[ReviewDisplay] Loading reviews for product:", productId);
      const res = await apiGetProductReviews(productId, { page, size: 10 });
      console.log("[ReviewDisplay] API response:", res.data?.data);
      if (res.ok && res.data?.data) {
        const data = res.data.data;
        console.log("[ReviewDisplay] Setting reviews, total:", data.content?.length || 0);
        setReviews(data.content || []);
        setTotalPages(data.totalPages || 1);
        setAvgRating(data.averageRating || 0);
        setRatingCounts(data.ratingCounts || {});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleEditSave = async (reviewId) => {
    try {
      const res = await apiUpdateProductReview(reviewId, {
        rating: editRating,
        comment: editComment.trim() || null,
        imageUrls: myReview?.imageUrls || [],
      });
      if (res.ok) {
        toast.success("Cập nhật đánh giá thành công!");
        setEditingReviewId(null);
        setEditRating(0);
        setEditComment("");
        await loadReviews();
        onRefresh?.();
      } else {
        toast.error(res.data?.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật đánh giá");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Xóa đánh giá này?")) return;
    
    setIsDeleting(reviewId);
    try {
      const res = await apiDeleteProductReview(reviewId);
      if (res.ok) {
        toast.success("Đã xóa đánh giá");
        await loadReviews();
        onRefresh?.();
      } else {
        toast.error("Lỗi khi xóa");
      }
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading && reviews.length === 0) {
    return <div className="text-center py-8 text-gray-400">Đang tải đánh giá...</div>;
  }

  const totalReviews = Object.values(ratingCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {totalReviews > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">📊 Đánh giá sản phẩm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-black text-yellow-500">{avgRating.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i <= Math.round(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">{totalReviews} đánh giá</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i <= stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-20">
                      <div
                        className="h-full bg-yellow-400 transition"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">📝</p>
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const isMyReview = myReview && review.id === myReview.id;
            const isEditing = editingReviewId === review.id;

            if (isEditing) {
              // Edit mode
              return (
                <div key={review.id} className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ hài lòng *</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="transition"
                          >
                            <svg
                              className={`w-8 h-8 cursor-pointer transition ${
                                star <= editRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bình luận của bạn</label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleEditCancel}
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleEditSave(review.id)}
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // View mode
            return (
              <div key={review.id} className={`rounded-xl border p-4 ${isMyReview ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200"}`}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {review.userName?.charAt(0).toUpperCase() || "U"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{review.userName || "Người dùng ẩn danh"}</p>
                          {isMyReview && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Đánh giá của bạn</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      
                      {/* Edit/Delete buttons */}
                      {isMyReview && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditStart(review)}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={isDeleting === review.id}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
                          >
                            {isDeleting === review.id ? "Xóa..." : "Xóa"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
                    )}

                    {/* Images */}
                    {review.imageUrls?.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.imageUrls.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => window.open(img, "_blank")}
                            className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 ring-green-500 transition"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
