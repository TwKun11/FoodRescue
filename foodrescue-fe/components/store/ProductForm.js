"use client";
import { useState, useEffect } from "react";
import {
  apiGetCategories,
  apiGetBrands,
  apiSellerCreateProduct,
  apiSellerUpdateProduct,
  apiSellerUploadImage,
  apiSellerGetProductImages,
  apiSellerAddProductImage,
  apiSellerDeleteProductImage,
  apiSellerSetPrimaryImage,
} from "@/lib/api";

const PRODUCT_TYPES = [
  { value: "fresh_food", label: "Thực phẩm tươi" },
  { value: "vegetable", label: "Rau củ" },
  { value: "fruit", label: "Trái cây" },
  { value: "meat", label: "Thịt" },
  { value: "seafood", label: "Hải sản" },
  { value: "bread", label: "Bánh" },
  { value: "ready_to_eat", label: "Đồ ăn sẵn" },
  { value: "beverage", label: "Đồ uống" },
  { value: "other", label: "Khác" },
];

const STORAGE_TYPES = [
  { value: "ambient", label: "Nhiệt độ thường" },
  { value: "chilled", label: "Ướp lạnh" },
  { value: "frozen", label: "Đông lạnh" },
];

const SELL_MODES = [
  { value: "by_unit", label: "Theo đơn vị (cái, gói...)" },
  { value: "by_weight", label: "Theo cân (kg, g...)" },
  { value: "mixed", label: "Kết hợp" },
];

function genProductCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SP-${ts}-${rand}`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ProductForm({ initialData, onSuccess, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.primaryImageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Gallery images (for edit mode)
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFileQueue, setGalleryFileQueue] = useState([]); // {file, previewUrl} pending add
  const [galleryUploading, setGalleryUploading] = useState(false);

  const isEdit = !!initialData;

  const [form, setForm] = useState({
    productCode: initialData?.productCode ?? genProductCode(),
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    categoryId: initialData?.categoryId ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    description: initialData?.description ?? "",
    productType: initialData?.productType ?? "other",
    sellMode: initialData?.sellMode ?? "by_unit",
    storageType: initialData?.storageType ?? "ambient",
    shelfLifeDays: initialData?.shelfLifeDays ?? "",
    minPreparationMinutes: initialData?.minPreparationMinutes ?? "",
    originCountry: initialData?.originCountry ?? "",
    originProvince: initialData?.originProvince ?? "",
    brandId: initialData?.brandId ? String(initialData.brandId) : "",
    status: initialData?.status ?? "draft",
  });

  useEffect(() => {
    apiGetCategories().then((res) => {
      if (res.ok && res.data?.data) setCategories(res.data.data);
    });
    apiGetBrands().then((res) => {
      if (res.ok && res.data?.data) setBrands(res.data.data);
    });
    if (isEdit && initialData?.id) {
      apiSellerGetProductImages(initialData.id).then((res) => {
        if (res.ok && res.data?.data) setGalleryImages(res.data.data);
      });
    } else if (initialData?.images) {
      setGalleryImages(initialData.images);
    }
  }, []);

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [k]: val };
      if (k === "name" && !isEdit) next.slug = slugify(val);
      return next;
    });
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Tên sản phẩm không được để trống");
      return;
    }
    if (!isEdit && !form.productCode.trim()) {
      setError("Mã sản phẩm không được để trống");
      return;
    }
    if (!form.categoryId) {
      setError("Vui lòng chọn danh mục");
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];

      if (imageFile) {
        setUploading(true);
        const upRes = await apiSellerUploadImage(imageFile);
        setUploading(false);
        if (!upRes.ok) {
          setError(upRes.data?.message || "Tải ảnh thất bại");
          setLoading(false);
          return;
        }
        imageUrls = [upRes.data.data];
      }

      const payload = {
        categoryId: Number(form.categoryId),
        brandId: form.brandId ? Number(form.brandId) : null,
        name: form.name,
        slug: form.slug || slugify(form.name),
        shortDescription: form.shortDescription,
        description: form.description,
        productType: form.productType,
        sellMode: form.sellMode,
        storageType: form.storageType,
        shelfLifeDays: form.shelfLifeDays ? Number(form.shelfLifeDays) : null,
        minPreparationMinutes: form.minPreparationMinutes ? Number(form.minPreparationMinutes) : null,
        originCountry: form.originCountry || null,
        originProvince: form.originProvince || null,
        status: form.status,
        ...(imageUrls.length > 0 && { imageUrls }),
      };

      let res;
      if (isEdit) {
        res = await apiSellerUpdateProduct(initialData.id, payload);
      } else {
        // Nếu mã bị trùng, tự sinh mã mới và thử lại 1 lần
        res = await apiSellerCreateProduct({ ...payload, productCode: form.productCode });
        const isDuplicate =
          !res.ok &&
          (res.data?.message?.toLowerCase().includes("product code") ||
            res.data?.message?.toLowerCase().includes("duplicate") ||
            res.data?.message?.toLowerCase().includes("already exists") ||
            res.status === 409);
        if (isDuplicate) {
          const newCode = genProductCode();
          setForm((prev) => ({ ...prev, productCode: newCode }));
          res = await apiSellerCreateProduct({ ...payload, productCode: newCode });
        }
      }

      if (res.ok) {
        onSuccess?.(res.data?.data);
      } else {
        setError(res.data?.message || "Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  // Gallery helpers (available for edit mode after save)
  const handleGalleryFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newQueue = files.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setGalleryFileQueue((prev) => [...prev, ...newQueue]);
    e.target.value = "";
  };

  const removeQueuedImage = (idx) => {
    setGalleryFileQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadQueuedImages = async () => {
    if (!initialData?.id || galleryFileQueue.length === 0) return;
    setGalleryUploading(true);
    for (const item of galleryFileQueue) {
      const res = await apiSellerAddProductImage(initialData.id, item.file);
      if (res.ok && res.data?.data) {
        setGalleryImages((prev) => [...prev, res.data.data]);
      }
    }
    setGalleryFileQueue([]);
    setGalleryUploading(false);
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!initialData?.id) return;
    await apiSellerDeleteProductImage(initialData.id, imageId);
    setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSetPrimaryImage = async (imageId) => {
    if (!initialData?.id) return;
    const res = await apiSellerSetPrimaryImage(initialData.id, imageId);
    if (res.ok) {
      setGalleryImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Hình ảnh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isEdit ? "Thư viện ảnh sản phẩm" : "Hình ảnh sản phẩm (ảnh đại diện)"}
        </label>

        {isEdit ? (
          /* --- Gallery manager (edit mode) --- */
          <div className="space-y-3">
            {/* Existing images */}
            {galleryImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed group"
                    style={{ borderColor: img.isPrimary ? "#22c55e" : "#e5e7eb" }}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    {img.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-green-500 text-white py-0.5">
                        Chính
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(img.id)}
                          className="text-[10px] text-white bg-green-600 px-1.5 py-0.5 rounded"
                        >
                          Đặt chính
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Queued (not yet uploaded) */}
            {galleryFileQueue.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {galleryFileQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-orange-300"
                  >
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover opacity-70" />
                    <span className="absolute top-0 left-0 right-0 text-center text-[9px] bg-orange-400 text-white py-0.5">
                      Chờ tải
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQueuedImage(idx)}
                      className="absolute bottom-0 left-0 right-0 text-[10px] text-white bg-red-500 py-0.5 text-center"
                    >
                      Bỏ
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Add + Upload  */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition inline-block">
                + Thêm ảnh
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFileSelect} />
              </label>
              {galleryFileQueue.length > 0 && (
                <button
                  type="button"
                  onClick={uploadQueuedImages}
                  disabled={galleryUploading}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {galleryUploading ? "Đang tải lên..." : `Tải lên ${galleryFileQueue.length} ảnh`}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Bấm vào ảnh để đặt làm ảnh chính hoặc xóa • JPG, PNG, WEBP – tối đa 10MB/ảnh
            </p>
          </div>
        ) : (
          /* --- Single thumbnail (create mode) --- */
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
              {imagePreview ? (
                <img src={imagePreview || null} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-300">📷</span>
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition inline-block">
                {uploading ? "Đang tải..." : "Chọn ảnh"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
              </label>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP – tối đa 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Tên + Mã */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tên sản phẩm *</label>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="VD: Rau cải xanh 500g"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        {!isEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mã sản phẩm (tự động)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.productCode}
                readOnly
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-default"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, productCode: genProductCode() }))}
                title="Sinh mã mới"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition"
              >
                🔄
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Bấm 🔄 nếu muốn sinh mã khác</p>
          </div>
        )}
      </div>

      {/* Slug + Danh mục + Thương hiệu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug (URL)</label>
          <input
            type="text"
            value={form.slug}
            onChange={set("slug")}
            placeholder="tu-dong-tao-tu-ten"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục *</label>
          <select
            value={form.categoryId}
            onChange={set("categoryId")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Thương hiệu</label>
          <select
            value={form.brandId}
            onChange={set("brandId")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
          >
            <option value="">-- Không có --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loại / Hình thức / Bảo quản */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Loại sản phẩm</label>
          <select
            value={form.productType}
            onChange={set("productType")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hình thức bán *</label>
          <select
            value={form.sellMode}
            onChange={set("sellMode")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {SELL_MODES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bảo quản</label>
          <select
            value={form.storageType}
            onChange={set("storageType")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {STORAGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Xuất xứ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Quốc gia xuất xứ</label>
          <input
            type="text"
            value={form.originCountry}
            onChange={set("originCountry")}
            placeholder="VD: Việt Nam"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tỉnh/Vùng xuất xứ</label>
          <input
            type="text"
            value={form.originProvince}
            onChange={set("originProvince")}
            placeholder="VD: Đà Lạt, Lâm Đồng"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      {/* Hạn sử dụng + Thời gian chuẩn bị */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hạn sử dụng (ngày)</label>
          <input
            type="number"
            value={form.shelfLifeDays}
            onChange={set("shelfLifeDays")}
            min={0}
            placeholder="VD: 7"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Thời gian chuẩn bị (phút)</label>
          <input
            type="number"
            value={form.minPreparationMinutes}
            onChange={set("minPreparationMinutes")}
            min={0}
            placeholder="VD: 30"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <p className="text-xs text-gray-400 mt-1">Thời gian tối thiểu cần để chuẩn bị đơn hàng</p>
        </div>
      </div>

      {/* Mô tả ngắn */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả ngắn</label>
        <input
          type="text"
          value={form.shortDescription}
          onChange={set("shortDescription")}
          placeholder="Một dòng mô tả ngắn..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
      </div>

      {/* Mô tả chi tiết */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả chi tiết</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={set("description")}
          placeholder="Mô tả chi tiết sản phẩm..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />
      </div>

      {/* Trạng thái */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
        <select
          value={form.status}
          onChange={set("status")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          <option value="draft">Nháp</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </button>
      </div>
    </form>
  );
}
