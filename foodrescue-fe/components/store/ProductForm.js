"use client";
import { useState } from "react";
import Button from "../common/Button";

const CATEGORIES = ["Rau củ", "Thịt tươi", "Hải sản", "Bánh", "Trái cây", "Đồ uống"];

/**
 * ProductForm - Form thêm / chỉnh sửa sản phẩm giảm giá cuối ngày
 * @param {object} initialData - dữ liệu ban đầu nếu đang edit
 * @param {function} onSubmit - callback(formData)
 * @param {function} onCancel
 */
export default function ProductForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    category: initialData?.category ?? CATEGORIES[0],
    originalPrice: initialData?.originalPrice ?? "",
    discountPercent: initialData?.discountPercent ?? "",
    quantity: initialData?.quantity ?? "",
    expiryDate: initialData?.expiryDate ?? "",
    expiryTime: initialData?.expiryTime ?? "",
    description: initialData?.description ?? "",
    image: null,
    imagePreview: initialData?.image ?? "",
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const discountedPrice =
    form.originalPrice && form.discountPercent
      ? Math.round(form.originalPrice * (1 - form.discountPercent / 100))
      : null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.originalPrice || form.originalPrice <= 0) e.originalPrice = "Nhập giá gốc hợp lệ";
    if (!form.discountPercent || form.discountPercent < 1 || form.discountPercent > 99) e.discountPercent = "1–99%";
    if (!form.quantity || form.quantity < 1) e.quantity = "Nhập số lượng";
    if (!form.expiryDate) e.expiryDate = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Upload hình */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">📷 Hình ảnh sản phẩm</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-300">📷</span>
            )}
          </div>
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
            Chọn ảnh
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        </div>
      </div>

      {/* Tên + Danh mục */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="VD: Rau cải xanh 500g"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              errors.name ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            value={form.category}
            onChange={set("category")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Giá + Giảm giá */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá gốc (đ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.originalPrice}
            onChange={set("originalPrice")}
            placeholder="VD: 50000"
            min={0}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              errors.originalPrice ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            % Giảm giá <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.discountPercent}
            onChange={set("discountPercent")}
            placeholder="VD: 30"
            min={1}
            max={99}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              errors.discountPercent ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.discountPercent && <p className="text-red-500 text-xs mt-1">{errors.discountPercent}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá sau giảm</label>
          <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-orange-50 text-orange-600 font-bold">
            {discountedPrice != null ? `${discountedPrice.toLocaleString("vi-VN")}đ` : "—"}
          </div>
        </div>
      </div>

      {/* Số lượng + HSD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.quantity}
            onChange={set("quantity")}
            placeholder="VD: 20"
            min={1}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              errors.quantity ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày HSD <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={set("expiryDate")}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              errors.expiryDate ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giờ HSD</label>
          <input
            type="time"
            value={form.expiryTime}
            onChange={set("expiryTime")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={set("description")}
          placeholder="Mô tả ngắn về sản phẩm..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">
            Hủy
          </Button>
        )}
        <Button variant="primary" type="submit">
          {initialData ? "💾 Lưu thay đổi" : "➕ Thêm sản phẩm"}
        </Button>
      </div>
    </form>
  );
}
