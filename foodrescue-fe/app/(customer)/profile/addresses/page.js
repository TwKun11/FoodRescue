"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGetAddresses, apiCreateAddress, apiUpdateAddress, apiDeleteAddress, apiSetDefaultAddress } from "@/lib/api";

const EMPTY_FORM = {
  receiverName: "",
  receiverPhone: "",
  province: "",
  district: "",
  ward: "",
  addressLine: "",
  note: "",
  isDefault: false,
};

function validatePhone(v) {
  const t = (v || "").trim();
  if (!t) return "Số điện thoại không được để trống";
  if (!/^\d{10}$/.test(t)) return "Số điện thoại phải đúng 10 chữ số";
  if (t[0] !== "0") return "Số điện thoại phải bắt đầu bằng 0";
  return "";
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [flashMsg, setFlashMsg] = useState("");

  const flash = (msg) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(""), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    apiGetAddresses()
      .then((res) => {
        if (res.ok && res.data?.data) setAddresses(res.data.data);
        else if (res.status === 401) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    load();
  }, [load, router]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      receiverName: addr.receiverName || "",
      receiverPhone: addr.receiverPhone || "",
      province: addr.province || "",
      district: addr.district || "",
      ward: addr.ward || "",
      addressLine: addr.addressLine || "",
      note: addr.note || "",
      isDefault: addr.isDefault || false,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.receiverName.trim()) errs.receiverName = "Không được để trống";
    const phoneErr = validatePhone(form.receiverPhone);
    if (phoneErr) errs.receiverPhone = phoneErr;
    if (!form.province.trim()) errs.province = "Không được để trống";
    if (!form.district.trim()) errs.district = "Không được để trống";
    if (!form.ward.trim()) errs.ward = "Không được để trống";
    if (!form.addressLine.trim()) errs.addressLine = "Không được để trống";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    const res = editingId ? await apiUpdateAddress(editingId, form) : await apiCreateAddress(form);
    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      load();
      flash(editingId ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ mới");
    } else {
      setErrors({ _global: res.data?.message || "Có lỗi xảy ra" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    const res = await apiDeleteAddress(id);
    if (res.ok) {
      load();
      flash("Đã xóa địa chỉ");
    } else alert(res.data?.message || "Xóa thất bại");
  };

  const handleSetDefault = async (id) => {
    const res = await apiSetDefaultAddress(id);
    if (res.ok) {
      load();
      flash("Đã đặt làm địa chỉ mặc định");
    } else alert(res.data?.message || "Thao tác thất bại");
  };

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [k]: val }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Địa chỉ giao hàng</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Thêm địa chỉ
        </button>
      </div>

      {flashMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          {flashMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📍</p>
          <p className="font-semibold text-gray-600">Chưa có địa chỉ nào</p>
          <p className="text-sm mt-1">Thêm địa chỉ để tiện cho việc đặt hàng</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-xl border p-5 ${addr.isDefault ? "border-green-400 ring-1 ring-green-200" : "border-gray-200"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{addr.receiverName}</p>
                    <span className="text-gray-400 text-sm">·</span>
                    <p className="text-sm text-gray-600">{addr.receiverPhone}</p>
                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                  </p>
                  {addr.note && <p className="text-xs text-gray-400 mt-0.5">Ghi chú: {addr.note}</p>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <button onClick={() => openEdit(addr)} className="text-sm text-blue-600 hover:underline">
                  Chỉnh sửa
                </button>
                {!addr.isDefault && (
                  <>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Đặt làm mặc định
                    </button>
                  </>
                )}
                <span className="text-gray-200">|</span>
                <button onClick={() => handleDelete(addr.id)} className="text-sm text-red-500 hover:underline">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {errors._global && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {errors._global}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Tên người nhận *" error={errors.receiverName}>
                  <input
                    type="text"
                    value={form.receiverName}
                    onChange={set("receiverName")}
                    placeholder="Nguyễn Văn A"
                    className={inputCls(errors.receiverName)}
                  />
                </FormField>
                <FormField label="Số điện thoại *" error={errors.receiverPhone}>
                  <input
                    type="tel"
                    value={form.receiverPhone}
                    onChange={set("receiverPhone")}
                    placeholder="0912345678"
                    className={inputCls(errors.receiverPhone)}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Tỉnh/Thành phố *" error={errors.province}>
                  <input
                    type="text"
                    value={form.province}
                    onChange={set("province")}
                    placeholder="TP. Hồ Chí Minh"
                    className={inputCls(errors.province)}
                  />
                </FormField>
                <FormField label="Quận/Huyện *" error={errors.district}>
                  <input
                    type="text"
                    value={form.district}
                    onChange={set("district")}
                    placeholder="Quận 1"
                    className={inputCls(errors.district)}
                  />
                </FormField>
                <FormField label="Phường/Xã *" error={errors.ward}>
                  <input
                    type="text"
                    value={form.ward}
                    onChange={set("ward")}
                    placeholder="Phường Bến Nghé"
                    className={inputCls(errors.ward)}
                  />
                </FormField>
              </div>
              <FormField label="Địa chỉ chi tiết *" error={errors.addressLine}>
                <input
                  type="text"
                  value={form.addressLine}
                  onChange={set("addressLine")}
                  placeholder="Số nhà, tên đường..."
                  className={inputCls(errors.addressLine)}
                />
              </FormField>
              <FormField label="Ghi chú" error={errors.note}>
                <input
                  type="text"
                  value={form.note}
                  onChange={set("note")}
                  placeholder="Hướng dẫn giao hàng (tuỳ chọn)"
                  className={inputCls(errors.note)}
                />
              </FormField>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={set("isDefault")}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                />
                <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 ${
    error ? "border-red-300 bg-red-50" : "border-gray-300"
  }`;
}
