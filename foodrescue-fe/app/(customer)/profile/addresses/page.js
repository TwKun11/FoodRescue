"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  apiGetAddresses,
  apiCreateAddress,
  apiUpdateAddress,
  apiDeleteAddress,
  apiSetDefaultAddress,
} from "@/lib/api";
import { getCurrentPosition, mapLocationToAddress, reverseGeocode } from "@/lib/location";

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

function validatePhone(value) {
  const text = (value || "").trim();
  if (!text) return "Số điện thoại không được để trống";
  if (!/^\d{10}$/.test(text)) return "Số điện thoại phải đúng 10 chữ số";
  if (text[0] !== "0") return "Số điện thoại phải bắt đầu bằng 0";
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
  const [locating, setLocating] = useState(false);

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
    queueMicrotask(load);
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
    const nextErrors = {};
    if (!form.receiverName.trim()) nextErrors.receiverName = "Không được để trống";
    const phoneErr = validatePhone(form.receiverPhone);
    if (phoneErr) nextErrors.receiverPhone = phoneErr;
    if (!form.province.trim()) nextErrors.province = "Không được để trống";
    if (!form.district.trim()) nextErrors.district = "Không được để trống";
    if (!form.ward.trim()) nextErrors.ward = "Không được để trống";
    if (!form.addressLine.trim()) nextErrors.addressLine = "Không được để trống";
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      province: form.province.trim(),
      district: form.district.trim(),
      ward: form.ward.trim(),
      addressLine: form.addressLine.trim(),
      note: form.note.trim(),
    };
    const res = editingId ? await apiUpdateAddress(editingId, payload) : await apiCreateAddress(payload);
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
    } else {
      alert(res.data?.message || "Xóa thất bại");
    }
  };

  const handleSetDefault = async (id) => {
    const res = await apiSetDefaultAddress(id);
    if (res.ok) {
      load();
      flash("Đã đặt làm địa chỉ mặc định");
    } else {
      alert(res.data?.message || "Thao tác thất bại");
    }
  };

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const data = await reverseGeocode(latitude, longitude);
      const nextAddress = mapLocationToAddress(data?.address);

      if (!nextAddress.province && !nextAddress.district && !nextAddress.ward && !nextAddress.addressLine) {
        throw new Error("Không đọc được địa chỉ phù hợp từ vị trí hiện tại.");
      }

      setForm((prev) => ({
        ...prev,
        province: nextAddress.province || prev.province,
        district: nextAddress.district || prev.district,
        ward: nextAddress.ward || prev.ward,
        addressLine: nextAddress.addressLine || prev.addressLine,
      }));
      setErrors((prev) => ({
        ...prev,
        province: "",
        district: "",
        ward: "",
        addressLine: "",
      }));
      toast.success("Đã lấy vị trí hiện tại và điền địa chỉ.");
    } catch (err) {
      let message = err?.message || "Không thể lấy vị trí hiện tại.";
      if (err?.code === 1) message = "Bạn đã từ chối quyền truy cập vị trí.";
      if (err?.code === 2) message = "Không xác định được vị trí hiện tại.";
      if (err?.code === 3) message = "Hết thời gian lấy vị trí hiện tại.";
      toast.error(message);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Địa chỉ giao hàng</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
        >
          + Thêm địa chỉ
        </button>
      </div>

      {flashMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {flashMsg}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400">Đang tải...</div>
      ) : addresses.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="mb-3 text-4xl">📍</p>
          <p className="font-semibold text-gray-600">Chưa có địa chỉ nào</p>
          <p className="mt-1 text-sm">Thêm địa chỉ để tiện cho việc đặt hàng</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-xl border bg-white p-5 ${
                addr.isDefault ? "border-green-400 ring-1 ring-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-800">{addr.receiverName}</p>
                    <span className="text-sm text-gray-400">·</span>
                    <p className="text-sm text-gray-600">{addr.receiverPhone}</p>
                    {addr.isDefault && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                  </p>
                  {addr.note && <p className="mt-0.5 text-xs text-gray-400">Ghi chú: {addr.note}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button onClick={() => openEdit(addr)} className="text-sm text-blue-600 hover:underline">
                  Chỉnh sửa
                </button>
                {!addr.isDefault && (
                  <>
                    <span className="text-gray-200">|</span>
                    <button onClick={() => handleSetDefault(addr.id)} className="text-sm text-green-600 hover:underline">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-10">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</h2>
              <button onClick={() => setShowModal(false)} className="text-xl leading-none text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            {errors._global && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errors._global}
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-xl border border-green-100 bg-green-50/70 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-800">Dùng vị trí hiện tại</p>
                    <p className="text-xs text-green-700">Cho phép trình duyệt truy cập vị trí để tự điền địa chỉ.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locating ? "Đang lấy vị trí..." : "Lấy vị trí hiện tại"}
                  </button>
                </div>
              </div>

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

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={set("isDefault")}
                  className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                />
                <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
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
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 ${
    error ? "border-red-300 bg-red-50" : "border-gray-300"
  }`;
}
