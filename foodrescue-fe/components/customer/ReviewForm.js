"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  apiCreateProductReview, 
  apiUpdateProductReview, 
  apiDeleteProductReview,
  apiUploadReviewImage 
} from "@/lib/api";

// Comprehensive emoji list
const EMOJI_LIST = [
  "😊", "😂", "😍", "😘", "😜", "😎", "😤", "😢",
  "😭", "😡", "😠", "😶", "😳", "🤔", "🤓", "😴",
  "👍", "👎", "👌", "✌️", "🤝", "❤️", "💔", "💪",
  "🎉", "🎊", "🎈", "🎁", "🌟", "⭐", "✨", "🔥",
  "👌", "💯", "🙌", "🙏", "😘", "🥰", "😻", "🤗",
  "🎯", "🏆", "🥇", "👑", "💎", "🌹", "🍔", "🍕",
];

export default function ReviewForm({ productId, existingReview, onSubmit, onDelete }) {
  // Only enable editing if review doesn't exist yet
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [images, setImages] = useState(existingReview?.imageUrls || []);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Keep track of the latest existingReview
  useEffect(() => {
    if (existingReview) {
      console.log("[ReviewForm] Received updated existingReview:", existingReview);
      setIsEditing(false);
    }
  }, [existingReview?.id]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      const container = document.querySelector("[data-emoji-container]");
      if (container && !container.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 3) {
      toast.error("Tối đa 3 ảnh");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const file of files) {
        const res = await apiUploadReviewImage(file);
        if (res.ok && res.data?.data?.imageUrl) {
          setImages((prev) => [...prev, res.data.data.imageUrl]);
        } else {
          toast.error("Lỗi upload ảnh");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng vote sao");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productId,
        rating,
        comment: comment.trim() || null,
        imageUrls: images,
      };

      let res;
      if (existingReview) {
        res = await apiUpdateProductReview(existingReview.id, {
          rating,
          comment: comment.trim() || null,
          imageUrls: images,
        });
      } else {
        res = await apiCreateProductReview(payload);
      }

      if (res.ok) {
        toast.success(existingReview ? "Cập nhật đánh giá thành công!" : "Cảm ơn bạn đã đánh giá!");
        console.log("[ReviewForm] Review submitted successfully. Calling onSubmit...");
        // Call onSubmit to reload data - this will cause parent to update existingReview
        await onSubmit?.();
        console.log("[ReviewForm] onSubmit completed, waiting for parent to update existingReview...");
        // Form will auto-hide via useEffect when existingReview updates
      } else {
        toast.error(res.data?.message || "Có lỗi xảy ra");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Xóa đánh giá này?")) return;
    
    setIsDeleting(true);
    try {
      const res = await apiDeleteProductReview(existingReview.id);
      if (res.ok) {
        toast.success("Đã xóa đánh giá");
        onDelete?.();
      } else {
        toast.error("Lỗi khi xóa");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const insertEmoji = (emoji) => {
    setComment((prev) => prev + emoji);
  };

  // View existing review
  if (existingReview && !isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {existingReview.userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{existingReview.userName || "Bạn"}</p>
                <p className="text-xs text-gray-500">
                  {new Date(existingReview.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i <= existingReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Comment */}
            {existingReview.comment && (
              <p className="text-gray-700 text-sm leading-relaxed mb-3">{existingReview.comment}</p>
            )}

            {/* Images */}
            {existingReview.imageUrls?.length > 0 && (
              <div className="flex gap-2 mb-3">
                {existingReview.imageUrls.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit / Delete buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              Sửa
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium disabled:opacity-50"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit/Create form
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">⭐ Đánh giá sản phẩm</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ hài lòng *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition"
              >
                <svg
                  className={`w-8 h-8 cursor-pointer transition ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 fill-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Bạn đánh giá: {["", "Rất tệ", "Tệ", "Trung bình", "Tốt", "Rất tốt"][rating]}
            </p>
          )}
        </div>

        {/* Comment Section with Emoji & Upload Icons - Facebook Style */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bình luận của bạn</label>
          <div className="border border-gray-300 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-green-500 z-40">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
              className="w-full px-4 py-3 text-sm focus:outline-none resize-none rounded-t-xl"
              rows={4}
            />
            
            {/* Action Bar - Emoji & Upload Icons (Bottom Right) */}
            <div className="flex justify-end items-center gap-2 px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-xl" data-emoji-container>
              {/* Upload Image Icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Thêm ảnh"
                className="text-gray-500 hover:text-green-600 transition p-1 rounded hover:bg-gray-200"
              >
                📎
              </button>

              {/* Emoji Picker Icon */}
              <div className="relative z-50">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-green-600 transition p-1 rounded hover:bg-gray-200"
                  title="Thêm cảm xúc"
                >
                  😊
                </button>
                
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute -bottom-72 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-50 w-80"
                  >
                    <div className="grid grid-cols-8 gap-2">
                      {EMOJI_LIST.map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            insertEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-xl hover:scale-125 transition p-1 rounded hover:bg-gray-100"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Images Preview */}
        {images.length > 0 && (
          <div>
            <div className="flex gap-2 flex-wrap mb-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                  >
                    <span className="text-white text-lg font-bold">✕</span>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">({images.length}/3 ảnh)</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Buttons */}
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          {existingReview && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
}
