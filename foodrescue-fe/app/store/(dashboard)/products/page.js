// FE03-003 – UI Quản lý sản phẩm (API-connected)
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiSellerGetProducts, apiSellerAddVariant, apiSellerAddBatch, apiSellerUpdateProduct } from "@/lib/api";
import ProductForm from "@/components/store/ProductForm";

const VARIANT_UNITS = ["piece", "pack", "bag", "bundle", "loaf", "box", "tray", "bottle", "g", "kg"];

function genVariantCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `VAR-${ts}-${rand}`;
}

const EMPTY_VARIANT = {
  variantCode: genVariantCode(),
  name: "",
  unit: "piece",
  listPrice: "",
  salePrice: "",
  stockQuantity: "",
  minOrderQty: "1",
  stepQty: "1",
  maxOrderQty: "",
  barcode: "",
  netWeightValue: "",
  netWeightUnit: "g",
  trackInventory: true,
};

const TABS = [
  { id: "all", label: "Tất cả sản phẩm" },
  { id: "active", label: "Đang hoạt động" },
  { id: "expiring", label: "Sắp hết hạn" },
  { id: "expired", label: "Hết hạn" },
];

// Helper: Tính số ngày còn lại
function calculateRemainingDays(createdAt, shelfLifeDays) {
  if (!createdAt || shelfLifeDays === null || shelfLifeDays === undefined) {
    return null;
  }
  const created = new Date(createdAt);
  const expiryDate = new Date(created);
  expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const remainingDays = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
  return remainingDays;
}

const STATUS_MAP = {
  active: { label: "Đang bán", dot: "bg-brand", text: "text-brand-dark", bg: "bg-brand-bg" },
  pending_approval: { label: "Chờ duyệt", dot: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
  inactive: { label: "Không hoạt động", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50" },
  draft: { label: "Nháp", dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50" },
  rejected: { label: "Bị từ chối", dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50" },
};

function mapProduct(p) {
  const sku = (p.variants && p.variants[0]) || {};
  // Cộng tổng tồn kho tất cả variants (hỗ trợ cả stockQuantity và stockAvailable)
  const totalStock = (p.variants || []).reduce((sum, v) => {
    return sum + (v.stockQuantity ?? v.stockAvailable ?? 0);
  }, 0);
  
  // Tính số ngày còn lại dựa trên createdAt + shelfLifeDays
  const remainingDays = calculateRemainingDays(p.createdAt, p.shelfLifeDays);
  
  // Xác định trạng thái hạn sử dụng
  let expiryStatus = null;
  if (remainingDays !== null) {
    if (remainingDays < 0) {
      expiryStatus = "expired";        // Hết hạn
    } else if (remainingDays <= 3) {
      expiryStatus = "expiring";       // Sắp hết hạn (0-3 ngày)
    }
  }

  return {
    // UI display fields
    id: String(p.id),
    image: p.primaryImageUrl || "/images/products/raucai.jpg",
    name: p.name,
    sku: sku.variantCode || String(p.id),
    originalPrice: sku.listPrice || 0,
    discountPrice: sku.salePrice || sku.listPrice || 0,
    quantity: totalStock,
    quantityLabel: totalStock === 0 ? "Hết hàng" : totalStock <= 5 ? `Còn ${totalStock}` : null,
    status: p.status || "draft",
    expiryStatus: expiryStatus,
    remainingDays: remainingDays,
    shelfLifeDays: p.shelfLifeDays,
    // Fields needed for edit form
    productCode: p.productCode,
    slug: p.slug,
    categoryId: p.categoryId,
    brandId: p.brandId,
    shortDescription: p.shortDescription,
    description: p.description,
    productType: p.productType,
    sellMode: p.sellMode,
    storageType: p.storageType,
    shelfLifeDays: p.shelfLifeDays,
    minPreparationMinutes: p.minPreparationMinutes,
    originCountry: p.originCountry,
    originProvince: p.originProvince,
    primaryImageUrl: p.primaryImageUrl,
    createdAt: p.createdAt,
    // original variants for variant modal
    variants: p.variants || [],
  };
}

export default function StoreProductsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showVariants, setShowVariants] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null); // full mapped product
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState("");
  const [variantSuccess, setVariantSuccess] = useState("");
  const [variantList, setVariantList] = useState([]);
  const [toast, setToast] = useState(null); // { message, type: "success"|"error" }
  const toastTimer = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, confirmText, tone, onConfirm }

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };
  const openEdit = (rawProduct) => {
    setConfirmDialog({
      title: "Xác nhận chỉnh sửa sản phẩm",
      message: `Bạn có muốn mở form chỉnh sửa cho sản phẩm "${rawProduct.name}" không?`,
      confirmText: "Chỉnh sửa",
      tone: "primary",
      onConfirm: () => {
        setEditingProduct(rawProduct);
        setShowForm(true);
      },
    });
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };
  const handleFormSuccess = (data, mode) => {
    closeForm();
    showToast(mode === "edit" ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm mới thành công");
    loadProducts(page);
  };

  const openVariants = (p) => {
    setVariantProduct(p);
    setVariantList(p.variants || []);
    setVariantForm({ ...EMPTY_VARIANT, variantCode: genVariantCode() });
    setVariantError("");
    setVariantSuccess("");
    setShowVariants(true);
  };
  const closeVariants = () => {
    setShowVariants(false);
    setVariantProduct(null);
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    setVariantError("");
    setVariantSuccess("");
    if (!variantForm.name.trim()) {
      setVariantError("Tên biến thể không được để trống");
      return;
    }
    if (!variantForm.listPrice || Number(variantForm.listPrice) <= 0) {
      setVariantError("Giá niêm yết không được để trống");
      return;
    }
    setVariantLoading(true);
    const payload = {
      variantCode: variantForm.variantCode,
      name: variantForm.name,
      unit: variantForm.unit,
      listPrice: Number(variantForm.listPrice),
      salePrice: variantForm.salePrice ? Number(variantForm.salePrice) : Number(variantForm.listPrice),
      minOrderQty: Number(variantForm.minOrderQty) || 1,
      stepQty: Number(variantForm.stepQty) || 1,
      ...(variantForm.maxOrderQty ? { maxOrderQty: Number(variantForm.maxOrderQty) } : {}),
      ...(variantForm.barcode ? { barcode: variantForm.barcode } : {}),
      ...(variantForm.netWeightValue
        ? { netWeightValue: Number(variantForm.netWeightValue), netWeightUnit: variantForm.netWeightUnit }
        : {}),
      trackInventory: variantForm.trackInventory,
    };
    const res = await apiSellerAddVariant(variantProduct.id, payload);
    if (!res.ok) {
      setVariantLoading(false);
      setVariantError(res.data?.message || "Thêm biến thể thất bại");
      return;
    }
    // Update variant list from the returned ProductResponse
    const updatedVariants = res.data?.data?.variants || [];
    setVariantList(updatedVariants);

    // Find the newly created variant by its code to get the correct variant ID
    const addedVariant = updatedVariants.find((v) => v.variantCode === variantForm.variantCode);
    const newVariantId = addedVariant?.id;

    // Create inventory batch to set initial stock
    if (newVariantId && Number(variantForm.stockQuantity) > 0) {
      const batchCode = `BATCH-${Date.now().toString(36).toUpperCase()}`;
      const batchRes = await apiSellerAddBatch({
        variantId: newVariantId,
        batchCode,
        quantityReceived: Number(variantForm.stockQuantity),
        receivedAt: new Date().toISOString().replace("Z", ""),
        costPrice: Number(variantForm.listPrice),
      });
      if (!batchRes.ok) {
        setVariantLoading(false);
        setVariantError(batchRes.data?.message || "Thêm biến thể thành công nhưng không lưu được tồn kho");
        setVariantForm({ ...EMPTY_VARIANT, variantCode: genVariantCode() });
        loadProducts(page);
        return;
      }
    }

    setVariantLoading(false);
    setVariantSuccess(
      "Thêm biến thể thành công" +
        (Number(variantForm.stockQuantity) > 0 ? ` · Tồn kho: ${variantForm.stockQuantity}` : ""),
    );
    setVariantForm({ ...EMPTY_VARIANT, variantCode: genVariantCode() });
    loadProducts(page);
  };

  const loadProducts = useCallback(
    function (p) {
      setLoading(true);
      apiSellerGetProducts({ page: p || 0, size: 10, keyword })
        .then(function (res) {
          if (res.ok && res.data && res.data.data) {
            var d = res.data.data;
            var content = d.content || d;
            if (Array.isArray(content)) {
              setProducts(content.map(mapProduct));
              setTotalPages(d.totalPages || 1);
              setTotalElements(d.totalElements || content.length);
            } else {
              setProducts([]);
            }
          }
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [keyword],
  );

  useEffect(
    function () {
      loadProducts(0);
      setPage(0);
    },
    [loadProducts],
  );

  const closeConfirmDialog = () => setConfirmDialog(null);

  const handleConfirmAction = async () => {
    if (!confirmDialog?.onConfirm) return;
    const action = confirmDialog.onConfirm;
    setConfirmDialog(null);
    await action();
  };

  const requestDeactivateProduct = (product) => {
    setConfirmDialog({
      title: "Xác nhận vô hiệu hóa sản phẩm",
      message: `Sản phẩm "${product.name}" sẽ bị chuyển sang trạng thái không hoạt động. Bạn có muốn tiếp tục không?`,
      confirmText: "Vô hiệu hóa",
      tone: "danger",
      onConfirm: async () => {
        const res = await apiSellerUpdateProduct(product.id, { status: "inactive" });
        if (res.ok) {
          showToast("Đã vô hiệu hóa sản phẩm thành công");
          loadProducts(page);
        } else {
          showToast("Vô hiệu hóa sản phẩm thất bại, vui lòng thử lại", "error");
        }
      },
    });
  };

  const requestActivateProduct = (product) => {
    setConfirmDialog({
      title: "Xác nhận kích hoạt sản phẩm",
      message: `Bạn có muốn kích hoạt lại sản phẩm "${product.name}" không?`,
      confirmText: "Kích hoạt",
      tone: "primary",
      onConfirm: async () => {
        const res = await apiSellerUpdateProduct(product.id, { status: "active" });
        if (res.ok) {
          showToast("Đã kích hoạt sản phẩm thành công");
          loadProducts(page);
        } else {
          showToast("Kích hoạt sản phẩm thất bại, vui lòng thử lại", "error");
        }
      },
    });
  };

  var filteredProducts =
    activeTab === "all"
      ? products
      : activeTab === "active"
        ? products.filter((p) => p.status === "active" && !p.expiryStatus)
        : activeTab === "expiring"
          ? products.filter((p) => p.expiryStatus === "expiring")
          : activeTab === "expired"
            ? products.filter((p) => p.expiryStatus === "expired")
            : products;

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelected(selected.length === filteredProducts.length ? [] : filteredProducts.map((p) => p.id));

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold whitespace-nowrap ${
            toast.type === "error" ? "bg-red-500 text-white" : "bg-brand text-gray-900"
          }`}
        >
          <span>
            {toast.type === "error" ? "✕" : "✓"} {toast.message}
          </span>
          <button onClick={() => setToast(null)} className="ml-1 text-white/70 hover:text-white leading-none text-base">
            ✕
          </button>
        </div>
      )}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900">{confirmDialog.title}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-6">{confirmDialog.message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmDialog}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  confirmDialog.tone === "danger"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-brand hover:bg-brand-secondary text-gray-900"
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 p-6 sm:p-8 space-y-6">
        {/* ── Variant Modal ── */}
        {showVariants && variantProduct && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Biến thể sản phẩm</h2>
                  <p className="text-sm text-gray-400">{variantProduct.name}</p>
                </div>
                <button onClick={closeVariants} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Existing variants */}
              {variantList.length > 0 ? (
                <div className="mb-5 overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide font-semibold">
                        <th className="px-3 py-2 text-left">Mã</th>
                        <th className="px-3 py-2 text-left">Tên</th>
                        <th className="px-3 py-2 text-left">Đơn vị</th>
                        <th className="px-3 py-2 text-right">Tồn kho</th>
                        <th className="px-3 py-2 text-right">Giá niêm yết</th>
                        <th className="px-3 py-2 text-right">Giá bán</th>
                        <th className="px-3 py-2 text-center">Mã vạch</th>
                        <th className="px-3 py-2 text-right">SL tối thiểu</th>
                        <th className="px-3 py-2 text-right">Bước SL</th>
                        <th className="px-3 py-2 text-right">SL tối đa</th>
                        <th className="px-3 py-2 text-center">Khối lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {variantList.map((v, i) => (
                        <tr key={v.id || i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-gray-600">{v.variantCode}</td>
                          <td className="px-3 py-2 text-gray-800 font-medium">{v.name}</td>
                          <td className="px-3 py-2 text-gray-500">{v.unit}</td>
                          <td className="px-3 py-2 text-right">
                            {(() => {
                              const qty = v.stockQuantity ?? v.stockAvailable ?? 0;
                              return (
                                <span
                                  className={
                                    qty === 0
                                      ? "text-red-500 font-semibold"
                                      : qty <= 5
                                        ? "text-orange-500 font-semibold"
                                        : "text-gray-700"
                                  }
                                >
                                  {qty === 0 ? "Hết" : qty}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {v.listPrice ? Number(v.listPrice).toLocaleString("vi-VN") + "đ" : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-green-600">
                            {v.salePrice ? Number(v.salePrice).toLocaleString("vi-VN") + "đ" : "—"}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-500">
                            {v.barcode || "—"}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {v.minOrderQty ?? 1}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {v.stepQty ?? 1}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {v.maxOrderQty ? v.maxOrderQty : "không giới hạn"}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-600">
                            {v.netWeightValue ? `${v.netWeightValue}${v.netWeightUnit}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-5 italic">Chưa có biến thể nào</p>
              )}

              {/* Add variant form */}
              <p className="text-xs font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-4">
                ➕ Thêm biến thể mới
              </p>
              {variantError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-3">
                  {variantError}
                </div>
              )}
              {variantSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">
                  ✓ {variantSuccess}
                </div>
              )}
              <form onSubmit={handleAddVariant} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mã biến thể (tự động)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={variantForm.variantCode}
                        readOnly
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-default"
                      />
                      <button
                        type="button"
                        title="Sinh mã mới"
                        onClick={() => setVariantForm((p) => ({ ...p, variantCode: genVariantCode() }))}
                        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tên biến thể *</label>
                    <input
                      type="text"
                      placeholder="VD: Gói 500g"
                      value={variantForm.name}
                      onChange={(e) => setVariantForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Đơn vị *</label>
                    <select
                      value={variantForm.unit}
                      onChange={(e) => setVariantForm((p) => ({ ...p, unit: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    >
                      {VARIANT_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Giá niêm yết (đ) *</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={variantForm.listPrice}
                      onChange={(e) => setVariantForm((p) => ({ ...p, listPrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Giá bán (đồng)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Mặc định bằng giá niêm yết"
                      value={variantForm.salePrice}
                      onChange={(e) => setVariantForm((p) => ({ ...p, salePrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tồn kho ban đầu</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="VD: 50"
                      value={variantForm.stockQuantity}
                      onChange={(e) => setVariantForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SL tối thiểu / đơn</label>
                    <input
                      type="number"
                      min={1}
                      value={variantForm.minOrderQty}
                      onChange={(e) => setVariantForm((p) => ({ ...p, minOrderQty: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Bước số lượng <span className="text-gray-400">(khách đặt 1, 2, 3...)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={variantForm.stepQty}
                      onChange={(e) => setVariantForm((p) => ({ ...p, stepQty: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                    <p className="text-xs text-gray-400 mt-1">Thường để 1. Nếu 2: khách chỉ đặt 2, 4, 6...</p>
                  </div>
                </div>
                {/* Barcode + Khối lượng */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mã vạch (Barcode)</label>
                    <input
                      type="text"
                      placeholder="VD: 8936082020169"
                      value={variantForm.barcode}
                      onChange={(e) => setVariantForm((p) => ({ ...p, barcode: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Khối lượng tịnh</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="VD: 500"
                      value={variantForm.netWeightValue}
                      onChange={(e) => setVariantForm((p) => ({ ...p, netWeightValue: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Đơn vị KL</label>
                    <select
                      value={variantForm.netWeightUnit}
                      onChange={(e) => setVariantForm((p) => ({ ...p, netWeightUnit: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    >
                      {["g", "kg", "ml", "l"].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* SL tối đa + Track inventory */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SL đặt tối đa / đơn</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Không giới hạn"
                      value={variantForm.maxOrderQty}
                      onChange={(e) => setVariantForm((p) => ({ ...p, maxOrderQty: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variantForm.trackInventory}
                        onChange={(e) => setVariantForm((p) => ({ ...p, trackInventory: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                      />
                      <span className="text-xs text-gray-600">Theo dõi tồn kho</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={variantLoading}
                    className="px-5 py-2 bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold rounded-lg transition disabled:opacity-60"
                  >
                    {variantLoading ? "Đang lưu..." : "Thêm biến thể"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal Form ── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ProductForm initialData={editingProduct} onSuccess={handleFormSuccess} onCancel={closeForm} />
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm sản phẩm
          </button>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-brand text-brand-dark"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 text-xs ${activeTab === tab.id ? "text-green-600" : "text-gray-400"}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tìm kiếm & Bộ lọc */}
          <div className="px-5 py-4 flex flex-wrap items-center gap-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-gray-500 text-sm shrink-0">Tìm kiếm</span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts(0)}
                placeholder="Tên sản phẩm, mã..."
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-dark"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadProducts(0)}
                className="bg-brand hover:bg-brand-secondary text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Tìm kiếm
              </button>
              {keyword && (
                <button
                  type="button"
                  onClick={() => { setKeyword(""); loadProducts(0); }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selected.length === filteredProducts.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-brand focus:ring-brand-dark"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">Giá (gốc / giảm)</th>
                  <th className="px-4 py-3 text-left">Kho hàng</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : null}
                {filteredProducts.map((p) => {
                  const s = STATUS_MAP[p.status] || STATUS_MAP.active;
                  const isInactive = p.status === "inactive";
                  return (
                    <tr 
                      key={p.id} 
                      className={`transition ${isInactive ? "opacity-50 bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded border-gray-300 text-brand focus:ring-brand-dark"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            <img
                              src={p.image || null}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/48x48/f3f4f6/9ca3af?text=?";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm leading-snug">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-gray-400 line-through">{p.originalPrice.toLocaleString("vi-VN")} đồng</p>
                        <p className="text-sm font-bold text-brand-dark">{p.discountPrice.toLocaleString("vi-VN")} đồng</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-sm font-semibold ${p.quantityLabel ? "text-orange-500" : "text-gray-700"}`}
                        >
                          {p.quantityLabel || p.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isInactive
                              ? "bg-gray-100 text-gray-600"
                              : `${s.bg} ${s.text}`
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isInactive ? "bg-gray-400" : s.dot
                            }`}
                          ></span>
                          {isInactive ? "Vô hiệu" : s.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit */}
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-green-600 transition"
                            title="Chỉnh sửa"
                            onClick={() => openEdit(p)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {/* Variants */}
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition"
                            title="Biến thể"
                            onClick={() => openVariants(p)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 10h16M4 14h16M4 18h16"
                              />
                            </svg>
                          </button>
                          {/* Hide */}
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                            title="Ẩn sản phẩm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          </button>
                          {/* Delete / Activate */}
                          {isInactive ? (
                            // Activate button for inactive products
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition"
                              title="Kích hoạt sản phẩm"
                              onClick={() => requestActivateProduct(p)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          ) : (
                            // Deactivate button for active products
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition"
                              title="Vô hiệu hóa sản phẩm"
                              onClick={() => requestDeactivateProduct(p)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination — 10 sản phẩm/trang */}
          <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-700">{filteredProducts.length}</span> / {totalElements} sản phẩm
              {totalPages > 1 && <span className="ml-1">· Trang {page + 1}/{totalPages}</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => { const np = page - 1; setPage(np); loadProducts(np); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-16 text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => { const np = page + 1; setPage(np); loadProducts(np); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-bg hover:border-brand/50 transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        
      </div>

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200 bg-white">
        © 2024 Food Rescue System – Quản lý Cửa Hàng Tiện Lợi v2.1.0
      </footer>
    </div>
  );
}
