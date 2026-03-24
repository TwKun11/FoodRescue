"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { apiGetMyShop, apiSellerUploadShopImage, apiUpdateMyShop } from "@/lib/api";
import { getCurrentPosition, mapLocationToAddress, reverseGeocode } from "@/lib/location";

const TABS = [
  { id: "basic", label: "Thông tin cơ bản", icon: "📋" },
  { id: "legal", label: "Hồ sơ pháp lý", icon: "📄" },
  { id: "bank", label: "Tài khoản ngân hàng", icon: "🏦" },
  { id: "images", label: "Ảnh xác minh", icon: "📸" },
];

const STATUS_META = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Hồ sơ cửa hàng đang chờ admin kiểm tra. Bạn có thể cập nhật thêm thông tin nếu cần.",
  },
  active: {
    label: "Đang hoạt động",
    className: "bg-green-50 text-green-800 border-green-200",
    description: "Cửa hàng đã được duyệt và có thể đăng sản phẩm, xử lý đơn hàng.",
  },
  suspended: {
    label: "Tạm khóa",
    className: "bg-red-50 text-red-700 border-red-200",
    description: "Cửa hàng đang tạm khóa. Hãy liên hệ admin nếu cần hỗ trợ.",
  },
  closed: {
    label: "Đã đóng",
    className: "bg-gray-100 text-gray-700 border-gray-200",
    description: "Hồ sơ seller đang ở trạng thái đã đóng.",
  },
};

const IMAGE_FIELDS = [
  {
    key: "avatarUrl",
    label: "Logo cửa hàng",
    hint: "Ảnh đại diện xuất hiện trên shop và sản phẩm.",
  },
  {
    key: "coverUrl",
    label: "Banner cửa hàng",
    hint: "Ảnh ngang để làm hero cho trang shop.",
  },
  {
    key: "storefrontImageUrl",
    label: "Ảnh mặt tiền / quầy bán",
    hint: "Dùng để admin đối chiếu điểm bán thực tế.",
  },
  {
    key: "businessLicenseImageUrl",
    label: "Ảnh giấy phép kinh doanh",
    hint: "Bản scan/chụp rõ thông tin doanh nghiệp hoặc hộ kinh doanh.",
  },
  {
    key: "identityCardImageUrl",
    label: "Ảnh CCCD/CMND đại diện",
    hint: "Giấy tờ của người đại diện đăng ký seller.",
  },
];

const REQUIRED_FIELDS = {
  basic: ["shopName", "legalName", "businessType", "contactName", "phone", "pickupAddress"],
  legal: ["taxCode", "businessLicenseNumber", "identityNumber"],
  bank: ["bankName", "bankAccountName", "bankAccountNumber"],
  images: ["avatarUrl", "coverUrl", "storefrontImageUrl", "businessLicenseImageUrl", "identityCardImageUrl"],
};

function validateField(field, value) {
  if (!value || value.toString().trim() === "") return "Trường này là bắt buộc";
  if (field === "phone" && !/^\d{10,11}$/.test(value)) return "Số điện thoại không hợp lệ (10-11 chữ số)";
  if (field === "taxCode" && value && !/^\d{10,13}$/.test(value)) return "Mã số thuế không hợp lệ (10-13 chữ số)";
  return null;
}

function getFieldError(form, field) {
  if (!form[field]) return null;
  return validateField(field, form[field]);
}

const EMPTY_SHOP = {
  shopName: "",
  shopSlug: "",
  legalName: "",
  businessType: "",
  contactName: "",
  phone: "",
  pickupAddress: "",
  latitude: null,
  longitude: null,
  description: "",
  taxCode: "",
  businessLicenseNumber: "",
  identityNumber: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  avatarUrl: "",
  coverUrl: "",
  storefrontImageUrl: "",
  businessLicenseImageUrl: "",
  identityCardImageUrl: "",
  email: "",
  status: "",
  isVerified: false,
  code: "",
  termsVersion: "",
  termsAcceptedAt: "",
  reviewedAt: "",
  adminNote: "",
  ratingAvg: null,
  commissionRate: null,
  createdAt: "",
  updatedAt: "",
};

function sanitizeDigits(value, max = 30) {
  return (value || "").replace(/[^\d]/g, "").slice(0, max);
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

function mapShopResponse(data) {
  return {
    shopName: data?.shopName || "",
    shopSlug: data?.shopSlug || "",
    legalName: data?.legalName || "",
    businessType: data?.businessType || "",
    contactName: data?.contactName || "",
    phone: data?.phone || "",
    pickupAddress: data?.pickupAddress || "",
    latitude: data?.latitude ?? null,
    longitude: data?.longitude ?? null,
    description: data?.description || "",
    taxCode: data?.taxCode || "",
    businessLicenseNumber: data?.businessLicenseNumber || "",
    identityNumber: data?.identityNumber || "",
    bankName: data?.bankName || "",
    bankAccountName: data?.bankAccountName || "",
    bankAccountNumber: data?.bankAccountNumber || "",
    avatarUrl: data?.avatarUrl || "",
    coverUrl: data?.coverUrl || "",
    storefrontImageUrl: data?.storefrontImageUrl || "",
    businessLicenseImageUrl: data?.businessLicenseImageUrl || "",
    identityCardImageUrl: data?.identityCardImageUrl || "",
    email: data?.email || "",
    status: data?.status || "",
    isVerified: Boolean(data?.isVerified),
    code: data?.code || "",
    termsVersion: data?.termsVersion || "",
    termsAcceptedAt: data?.termsAcceptedAt || "",
    reviewedAt: data?.reviewedAt || "",
    adminNote: data?.adminNote || "",
    ratingAvg: data?.ratingAvg ?? null,
    commissionRate: data?.commissionRate ?? null,
    createdAt: data?.createdAt || "",
    updatedAt: data?.updatedAt || "",
  };
}

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [message, setMessage] = useState({ type: null, text: "" });
  const [shop, setShop] = useState(EMPTY_SHOP);
  const [form, setForm] = useState(EMPTY_SHOP);
  const [activeTab, setActiveTab] = useState("basic");
  const [touched, setTouched] = useState({});

  const statusMeta = useMemo(() => {
    return STATUS_META[shop.status] || STATUS_META.pending;
  }, [shop.status]);

  useEffect(() => {
    let cancelled = false;

    async function loadShop() {
      setLoading(true);
      const res = await apiGetMyShop();
      if (!cancelled) {
        if (res.ok && res.data?.data) {
          const mapped = mapShopResponse(res.data.data);
          setShop(mapped);
          setForm(mapped);
        } else {
          setMessage({ type: "error", text: res.data?.message || "Không tải được thông tin cửa hàng." });
        }
        setLoading(false);
      }
    }

    loadShop();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (field) => (e) => {
    const raw = e.target.value;
    setMessage({ type: null, text: "" });
    setTouched((prev) => ({ ...prev, [field]: true }));
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "phone"
          ? sanitizeDigits(raw, 11)
          : field === "taxCode"
            ? sanitizeDigits(raw, 20)
            : field === "identityNumber"
              ? sanitizeDigits(raw, 20)
              : field === "bankAccountNumber"
                ? sanitizeDigits(raw, 30)
                : raw,
    }));
  };

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setMessage({ type: null, text: "" });
    try {
      const res = await apiSellerUploadShopImage(file);
      if (!res.ok) {
        setMessage({ type: "error", text: res.data?.message || "Tải ảnh thất bại." });
        return;
      }
      const url = res.data?.data || "";
      setForm((prev) => ({ ...prev, [field]: url }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      setMessage({ type: "success", text: "Đã tải ảnh lên thành công." });
    } finally {
      setUploadingField("");
      e.target.value = "";
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setMessage({ type: null, text: "" });
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const data = await reverseGeocode(latitude, longitude);
      const location = mapLocationToAddress(data?.address);
      const pickupAddress = [
        location.addressLine,
        location.ward,
        location.district,
        location.province,
      ]
        .filter(Boolean)
        .join(", ");

      setForm((prev) => ({
        ...prev,
        pickupAddress: pickupAddress || prev.pickupAddress,
        latitude,
        longitude,
      }));
      setMessage({ type: "success", text: "Đã cập nhật vị trí cửa hàng." });
    } catch (err) {
      let text = err?.message || "Không thể lấy vị trí hiện tại.";
      if (err?.code === 1) text = "Bạn đã từ chối quyền truy cập vị trí.";
      if (err?.code === 2) text = "Không xác định được vị trí hiện tại.";
      if (err?.code === 3) text = "Hết thời gian lấy vị trí hiện tại.";
      setMessage({ type: "error", text });
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: null, text: "" });
    try {
      const res = await apiUpdateMyShop({
        shopName: form.shopName,
        legalName: form.legalName || null,
        businessType: form.businessType || null,
        contactName: form.contactName || null,
        phone: form.phone || null,
        pickupAddress: form.pickupAddress || null,
        latitude: form.latitude,
        longitude: form.longitude,
        description: form.description || null,
        taxCode: form.taxCode || null,
        businessLicenseNumber: form.businessLicenseNumber || null,
        identityNumber: form.identityNumber || null,
        bankName: form.bankName || null,
        bankAccountName: form.bankAccountName || null,
        bankAccountNumber: form.bankAccountNumber || null,
        avatarUrl: form.avatarUrl || null,
        coverUrl: form.coverUrl || null,
        storefrontImageUrl: form.storefrontImageUrl || null,
        businessLicenseImageUrl: form.businessLicenseImageUrl || null,
        identityCardImageUrl: form.identityCardImageUrl || null,
      });

      if (!res.ok) {
        const text =
          typeof res.data?.data === "object" && res.data?.data
            ? Object.values(res.data.data)[0]
            : res.data?.message || "Cập nhật cửa hàng thất bại.";
        setMessage({ type: "error", text });
        return;
      }

      const mapped = mapShopResponse(res.data?.data);
      setShop(mapped);
      setForm(mapped);
      setMessage({ type: "success", text: "✓ Đã cập nhật hồ sơ cửa hàng thành công!" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ════ HEADER CARD ════ */}
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-40 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400">
          {shop.coverUrl && <img src={shop.coverUrl} alt="Banner cửa hàng" className="h-full w-full object-cover opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-xl border-4 border-white bg-white shadow-md">
                {shop.avatarUrl ? (
                  <img src={shop.avatarUrl} alt={shop.shopName || "Logo cửa hàng"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand text-lg font-bold text-gray-900">
                    {(shop.shopName?.charAt(0) || "S").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1 text-white">
                <h1 className="text-2xl font-bold">{shop.shopName || "Cửa hàng của bạn"}</h1>
                <p className="mt-1 text-sm text-white/80">
                  @{shop.shopSlug || "chua-co-slug"} {shop.code ? `· ${shop.code}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                  {shop.isVerified && (
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      ✓ Đã xác minh
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className={`border-t px-6 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {shop.adminNote && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-3">
            <p className="text-xs font-semibold text-red-800">⚠ GHI CHÚ TỪ ADMIN</p>
            <p className="mt-1 whitespace-pre-line text-xs text-red-700">{shop.adminNote}</p>
          </div>
        )}
      </section>

      {/* ════ TAB NAVIGATION ════ */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
              activeTab === tab.id
                ? "border-brand text-brand"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            {activeTab === "basic" && (
              <>
            <h2 className="text-lg font-semibold text-gray-900">Thông tin vận hành</h2>
            <p className="mt-1 text-sm text-gray-500">Cập nhật tên shop, thông tin liên hệ và địa chỉ giao nhận.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Tên cửa hàng *" value={form.shopName} onChange={setField("shopName")} />
              <ReadOnlyField label="Slug cua hang" value={form.shopSlug || "—"} />
              <Field label="Ten phap ly / ho kinh doanh *" value={form.legalName} onChange={setField("legalName")} />
              <Field label="Loại hình kinh doanh *" value={form.businessType} onChange={setField("businessType")} />
              <Field label="Người liên hệ *" value={form.contactName} onChange={setField("contactName")} />
              <Field label="Số điện thoại *" value={form.phone} onChange={setField("phone")} inputMode="numeric" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Vi tri cua hang</p>
                  <p className="mt-1 text-xs text-emerald-700">Luu toa do de tinh khoang cach tu khach hang den cua hang.</p>
                  {form.latitude != null && form.longitude != null && (
                    <p className="mt-2 text-xs text-gray-600">
                      Toa do da luu: {Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                >
                  {locating ? "Dang lay vi tri..." : "Lay vi tri hien tai"}
                </button>
              </div>
              <TextArea label="Dia chi lay hang / giao nhan *" value={form.pickupAddress} onChange={setField("pickupAddress")} rows={3} />
            </div>

            <TextArea
              label="Địa chỉ lấy hàng / giao nhận *"
              value={form.pickupAddress}
              onChange={setField("pickupAddress")}
              rows={3}
              error={touched.pickupAddress ? validateField("pickupAddress", form.pickupAddress) : null}
            />

            <TextArea
              label="Mô tả cửa hàng"
              value={form.description}
              onChange={setField("description")}
              rows={4}
              hint="Viết gì đó để khách hàng biết thêm về cửa hàng của bạn"
            />
          </>
        )}

        {/* TAB: Hồ sơ pháp lý */}
        {activeTab === "legal" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Hồ sơ pháp lý</h2>
              <p className="text-sm text-gray-600">Những thông tin này cần khớp với hồ sơ đã nộp để admin đối chiếu khi cần.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Mã số thuế *"
                value={form.taxCode}
                onChange={setField("taxCode")}
                inputMode="numeric"
                error={touched.taxCode ? validateField("taxCode", form.taxCode) : null}
              />
              <Field
                label="Số giấy phép kinh doanh *"
                value={form.businessLicenseNumber}
                onChange={setField("businessLicenseNumber")}
                error={touched.businessLicenseNumber ? validateField("businessLicenseNumber", form.businessLicenseNumber) : null}
              />
              <Field
                label="Số CCCD/CMND đại diện *"
                value={form.identityNumber}
                onChange={setField("identityNumber")}
                inputMode="numeric"
                error={touched.identityNumber ? validateField("identityNumber", form.identityNumber) : null}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs text-blue-800">
                <strong>Lưu ý:</strong> Nếu bạn cập nhật giấy phép hoặc CCCD, hãy cập nhật lại ảnh xác minh để tránh bị trễ duyệt sản phẩm.
              </p>
            </div>
          </div>
        )}

        {/* TAB: Tài khoản ngân hàng */}
        {activeTab === "bank" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Tài khoản ngân hàng</h2>
              <p className="text-sm text-gray-600">Thông tin đối soát doanh thu và thanh toán cho cửa hàng.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Tên ngân hàng *"
                value={form.bankName}
                onChange={setField("bankName")}
                error={touched.bankName ? validateField("bankName", form.bankName) : null}
              />
              <Field
                label="Chủ tài khoản *"
                value={form.bankAccountName}
                onChange={setField("bankAccountName")}
                error={touched.bankAccountName ? validateField("bankAccountName", form.bankAccountName) : null}
              />
              <Field
                label="Số tài khoản *"
                value={form.bankAccountNumber}
                onChange={setField("bankAccountNumber")}
                inputMode="numeric"
                error={touched.bankAccountNumber ? validateField("bankAccountNumber", form.bankAccountNumber) : null}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs text-blue-800">
                <strong>Di chúc:</strong> Tài khoản ngân hàng phải trùng với người đại diện hoặc pháp nhân đã đăng ký seller. Hãy kiểm tra kỹ lưỡng trước khi lưu.
              </p>
            </div>
          </div>
        )}

        {/* TAB: Ảnh xác minh */}
        {activeTab === "images" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Ảnh xác minh và nhận diện</h2>
              <p className="text-sm text-gray-600">Tải lại ảnh mới bất kỳ lúc nào nếu cần cập nhật hồ sơ.</p>
            </div>

            <div className="space-y-4">
              {IMAGE_FIELDS.map((item) => (
                <UploadCard
                  key={item.key}
                  label={item.label}
                  hint={item.hint}
                  value={form[item.key]}
                  uploading={uploadingField === item.key}
                  onFileChange={handleUpload(item.key)}
                  required
                />
              ))}
            </div>
          </div>
        )}
          </section>
      </div>

      {/* ════ STICKY SAVE BUTTON ════ */}
      </div>
      <div className="sticky bottom-0 z-10 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Lưu thay đổi</p>
            <p className="text-xs text-gray-500">Bất kỳ thay đổi nào sẽ được gửi cho admin để xác minh lại.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploadingField !== ""}
            className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-gray-900 border-t-transparent animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              "✓ Lưu hồ sơ"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wide text-white/75">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function MetaStack({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-300 bg-red-50 focus:ring-red-200"
            : "border-gray-200 focus:ring-brand/40"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">{value}</div>
    </div>
  );
}

function TextArea({ label, error, hint, ...props }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        {...props}
        className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-300 bg-red-50 focus:ring-red-200"
            : "border-gray-200 focus:ring-brand/40"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function UploadCard({ label, hint, value, uploading, onFileChange, required }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
          {value ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-1 text-xs font-medium text-green-700">
                ✓ Đã tải
              </span>
            </div>
          ) : required ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-1 text-xs font-medium text-red-700">
                ⚠ Chưa tải
              </span>
            </div>
          ) : null}
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={uploading} />
          {uploading ? "Đang tải..." : value ? "Thay đổi" : "Tải ảnh"}
        </label>
      </div>

      {value && (
        <div className="mt-4 space-y-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img src={value} alt={label} className="h-32 w-full object-cover" />
          </div>
          <a href={value} target="_blank" rel="noreferrer" className="inline-block text-xs font-medium text-brand-dark hover:underline">
            Xem ảnh gốc →
          </a>
        </div>
      )}
    </div>
  );
}
