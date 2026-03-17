"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  apiGetMe,
  apiGetMySellerApplication,
  apiRefreshToken,
  apiSubmitSellerApplication,
  apiUploadSellerApplicationImage,
} from "@/lib/api";

const STATUS_META = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-50 border-amber-200 text-amber-800",
    description: "Hồ sơ đã được gửi và đang chờ admin kiểm tra.",
  },
  active: {
    label: "Đã duyệt",
    className: "bg-green-50 border-green-200 text-green-800",
    description: "Hồ sơ đã được duyệt. Hãy làm mới phiên đăng nhập để dùng quyền seller.",
  },
  closed: {
    label: "Từ chối",
    className: "bg-red-50 border-red-200 text-red-700",
    description: "Hồ sơ bị từ chối. Bạn có thể cập nhật thông tin và gửi lại.",
  },
};

const TERMS = [
  "Thông tin cửa hàng, người liên hệ và giấy tờ cung cấp phải trung thực và còn hiệu lực.",
  "Chỉ được đăng bán thực phẩm hợp pháp, an toàn và đúng mô tả trên hệ thống.",
  "Nhà bán hàng chịu trách nhiệm về chất lượng sản phẩm, khiếu nại và nghĩa vụ pháp lý phát sinh.",
  "FoodRescue có quyền từ chối hoặc khóa cửa hàng nếu phát hiện gian lận, hàng cấm hoặc thông tin sai lệch.",
  "Thông tin tài khoản ngân hàng phải thuộc quyền sử dụng hợp pháp của nhà bán hàng.",
];

const UPLOAD_LABELS = {
  storefrontImageUrl: "Ảnh mặt tiền / quầy bán",
  businessLicenseImageUrl: "Ảnh giấy phép kinh doanh",
  identityCardImageUrl: "Ảnh CCCD/CMND người đại diện",
};

function slugify(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
}

function sanitizeDigits(value, max = 30) {
  return (value || "").replace(/[^\d]/g, "").slice(0, max);
}

export default function BecomeSellerPage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingRole, setRefreshingRole] = useState(false);
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [message, setMessage] = useState({ type: null, text: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [form, setForm] = useState({
    shopName: "",
    shopSlug: "",
    legalName: "",
    businessType: "",
    contactName: "",
    phone: "",
    pickupAddress: "",
    taxCode: "",
    businessLicenseNumber: "",
    identityNumber: "",
    description: "",
    storefrontImageUrl: "",
    businessLicenseImageUrl: "",
    identityCardImageUrl: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    acceptedTerms: false,
  });

  const statusMeta = useMemo(() => {
    return application?.status ? STATUS_META[application.status] ?? STATUS_META.pending : null;
  }, [application]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [meRes, appRes] = await Promise.all([apiGetMe(), apiGetMySellerApplication()]);
        if (cancelled) return;

        if (!meRes.ok) {
          router.replace("/login");
          return;
        }

        const nextUser = meRes.data?.data ?? null;
        setUser(nextUser);
        if (nextUser && typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(nextUser));
          window.dispatchEvent(new Event("storage"));
        }

        const nextApplication = appRes.ok ? appRes.data?.data ?? null : null;
        setApplication(nextApplication);
        if (nextApplication) {
          setForm({
            shopName: nextApplication.shopName || "",
            shopSlug: nextApplication.shopSlug || "",
            legalName: nextApplication.legalName || "",
            businessType: nextApplication.businessType || "",
            contactName: nextApplication.contactName || nextUser?.fullName || "",
            phone: nextApplication.phone || nextUser?.phone || "",
            pickupAddress: nextApplication.pickupAddress || "",
            taxCode: nextApplication.taxCode || "",
            businessLicenseNumber: nextApplication.businessLicenseNumber || "",
            identityNumber: nextApplication.identityNumber || "",
            description: nextApplication.description || "",
            storefrontImageUrl: nextApplication.storefrontImageUrl || "",
            businessLicenseImageUrl: nextApplication.businessLicenseImageUrl || "",
            identityCardImageUrl: nextApplication.identityCardImageUrl || "",
            bankName: nextApplication.bankName || "",
            bankAccountName: nextApplication.bankAccountName || "",
            bankAccountNumber: nextApplication.bankAccountNumber || "",
            acceptedTerms: true,
          });
          setSlugTouched(true);
        } else {
          setForm((prev) => ({
            ...prev,
            contactName: nextUser?.fullName || prev.contactName,
            phone: nextUser?.phone || prev.phone,
          }));
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleField = (field) => (e) => {
    const raw = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setMessage({ type: null, text: "" });
    setForm((prev) => {
      const next = { ...prev };
      if (field === "phone") next[field] = sanitizeDigits(raw, 10);
      else if (field === "taxCode") next[field] = sanitizeDigits(raw, 20);
      else if (field === "identityNumber") next[field] = sanitizeDigits(raw, 20);
      else if (field === "bankAccountNumber") next[field] = sanitizeDigits(raw, 30);
      else next[field] = raw;

      if (field === "shopName" && !slugTouched) {
        next.shopSlug = slugify(raw);
      }
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setMessage({ type: null, text: "" });
    setForm((prev) => ({ ...prev, shopSlug: slugify(e.target.value) }));
  };

  const handleUpload = (field) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setMessage({ type: null, text: "" });
    try {
      const res = await apiUploadSellerApplicationImage(file);
      if (!res.ok) {
        setMessage({ type: "error", text: res.data?.message || `Tải ${UPLOAD_LABELS[field]} thất bại.` });
        return;
      }
      const url = res.data?.data || "";
      setForm((prev) => ({ ...prev, [field]: url }));
      setMessage({ type: "success", text: `Đã tải ${UPLOAD_LABELS[field].toLowerCase()} thành công.` });
    } finally {
      setUploadingField("");
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: null, text: "" });
    if (!form.storefrontImageUrl || !form.businessLicenseImageUrl || !form.identityCardImageUrl) {
      setMessage({ type: "error", text: "Vui long tai day du 3 anh ho so truoc khi gui don." });
      return;
    }
    setSaving(true);
    try {
      const res = await apiSubmitSellerApplication({
        ...form,
        shopSlug: slugify(form.shopSlug),
      });
      if (!res.ok) {
        const text =
          typeof res.data?.data === "object" && res.data?.data
            ? Object.values(res.data.data)[0]
            : res.data?.message || "Gửi đơn đăng ký thất bại.";
        setMessage({ type: "error", text });
        return;
      }
      const data = res.data?.data ?? null;
      setApplication(data);
      setForm((prev) => ({ ...prev, acceptedTerms: true }));
      setMessage({ type: "success", text: "Đã lưu hồ sơ seller thành công." });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshRole = async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (!refreshToken) {
      setMessage({ type: "error", text: "Phiên hiện tại chưa có refresh token. Hãy đăng nhập lại." });
      return;
    }

    setRefreshingRole(true);
    setMessage({ type: null, text: "" });
    try {
      const refreshed = await apiRefreshToken(refreshToken);
      if (!refreshed.ok) {
        setMessage({ type: "error", text: refreshed.data?.message || "Không làm mới được quyền truy cập." });
        return;
      }

      const payload = refreshed.data?.data ?? null;
      if (payload?.accessToken) localStorage.setItem("accessToken", payload.accessToken);
      if (payload?.refreshToken) localStorage.setItem("refreshToken", payload.refreshToken);
      if (payload?.user) {
        localStorage.setItem("user", JSON.stringify(payload.user));
        setUser(payload.user);
      }
      window.dispatchEvent(new Event("storage"));
      router.push(payload?.user?.role === "SELLER" ? "/store" : "/profile");
    } finally {
      setRefreshingRole(false);
    }
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role === "SELLER") {
    return (
      <div className="min-h-screen bg-brand-bg py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Bạn đã là nhà bán hàng</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tài khoản hiện đã có quyền seller. Hãy làm mới phiên đăng nhập để cập nhật access token trước khi vào khu
            vực quản lý cửa hàng.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRefreshRole}
              disabled={refreshingRole}
              className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-brand-dark transition disabled:opacity-50"
            >
              {refreshingRole ? "Đang cập nhật quyền..." : "Cập nhật phiên seller"}
            </button>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Quay lại hồ sơ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Đăng ký trở thành nhà bán hàng</h1>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                Hoàn thiện hồ sơ cửa hàng, giấy tờ pháp lý và thông tin thanh toán để admin xét duyệt.
              </p>
            </div>
            <Link href="/profile" className="text-sm font-medium text-brand-dark hover:underline">
              ← Quay lại hồ sơ
            </Link>
          </div>

          {message.text && (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            <Section title="Thông tin cửa hàng">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tên cửa hàng *" value={form.shopName} onChange={handleField("shopName")} placeholder="Ví dụ: Rau sạch cuối ngày Quận 3" required />
                <Field
                  label="Slug cửa hàng *"
                  value={form.shopSlug}
                  onChange={handleSlugChange}
                  placeholder="rau-sach-cuoi-ngay-quan-3"
                  help="Slug duy nhất để định danh cửa hàng."
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tên pháp lý / hộ kinh doanh *" value={form.legalName} onChange={handleField("legalName")} placeholder="Hộ kinh doanh ABC" required />
                <Field label="Loại hình kinh doanh *" value={form.businessType} onChange={handleField("businessType")} placeholder="Cửa hàng thực phẩm / Quán ăn / Siêu thị mini..." required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Người liên hệ *" value={form.contactName} onChange={handleField("contactName")} placeholder="Nguyễn Văn A" required />
                <Field label="Số điện thoại *" value={form.phone} onChange={handleField("phone")} placeholder="0901234567" required />
              </div>
              <TextArea label="Địa chỉ lấy hàng / giao nhận *" value={form.pickupAddress} onChange={handleField("pickupAddress")} rows={3} placeholder="Địa chỉ đầy đủ nơi khách đến nhận hoặc nơi shop xử lý đơn." required />
              <TextArea label="Mô tả cửa hàng" value={form.description} onChange={handleField("description")} rows={4} placeholder="Loại hàng bán, khung giờ nhận hàng, cam kết chất lượng, lưu ý vận hành..." />
            </Section>

            <Section title="Thông tin pháp lý">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Mã số thuế" value={form.taxCode} onChange={handleField("taxCode")} placeholder="0312345678" />
                <Field label="Số giấy phép kinh doanh *" value={form.businessLicenseNumber} onChange={handleField("businessLicenseNumber")} placeholder="GPKD-..." required />
                <Field label="Số CCCD/CMND đại diện *" value={form.identityNumber} onChange={handleField("identityNumber")} placeholder="0792..." required />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <UploadField
                  label="Ảnh mặt tiền / quầy bán *"
                  value={form.storefrontImageUrl}
                  uploading={uploadingField === "storefrontImageUrl"}
                  onFileChange={handleUpload("storefrontImageUrl")}
                />
                <UploadField
                  label="Ảnh giấy phép kinh doanh *"
                  value={form.businessLicenseImageUrl}
                  uploading={uploadingField === "businessLicenseImageUrl"}
                  onFileChange={handleUpload("businessLicenseImageUrl")}
                />
                <UploadField
                  label="Ảnh CCCD/CMND *"
                  value={form.identityCardImageUrl}
                  uploading={uploadingField === "identityCardImageUrl"}
                  onFileChange={handleUpload("identityCardImageUrl")}
                />
              </div>
            </Section>

            <Section title="Thông tin ngân hàng">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Ngân hàng *" value={form.bankName} onChange={handleField("bankName")} placeholder="Vietcombank" required />
                <Field label="Chủ tài khoản *" value={form.bankAccountName} onChange={handleField("bankAccountName")} placeholder="NGUYEN VAN A" required />
                <Field label="Số tài khoản *" value={form.bankAccountNumber} onChange={handleField("bankAccountNumber")} placeholder="0123456789" required />
              </div>
            </Section>

            <Section title="Điều khoản sử dụng">
              <div className="space-y-2 text-sm text-gray-600">
                {TERMS.map((term) => (
                  <p key={term}>• {term}</p>
                ))}
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={handleField("acceptedTerms")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span>Tôi đã đọc, hiểu và đồng ý với điều khoản sử dụng dành cho nhà bán hàng trên FoodRescue.</span>
              </label>
            </Section>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving || uploadingField !== ""}
                className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-brand-dark transition disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : application ? "Cập nhật hồ sơ" : "Gửi hồ sơ đăng ký"}
              </button>
              <p className="text-sm text-gray-500">
                Admin sẽ duyệt dựa trên thông tin vận hành, giấy tờ pháp lý và thông tin thanh toán.
              </p>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái hồ sơ</h2>
            {!application ? (
              <p className="mt-3 text-sm text-gray-500">Bạn chưa có hồ sơ seller nào. Hãy điền form để bắt đầu.</p>
            ) : (
              <>
                <div className={`mt-4 rounded-2xl border px-4 py-3 ${statusMeta?.className ?? ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{statusMeta?.label}</span>
                    <span className="text-xs uppercase tracking-wide">@{application.shopSlug}</span>
                  </div>
                  <p className="mt-2 text-sm">{statusMeta?.description}</p>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <Item label="Cửa hàng" value={application.shopName} />
                  <Item label="Người liên hệ" value={application.contactName || "—"} />
                  <Item label="Địa chỉ lấy hàng" value={application.pickupAddress || "—"} />
                  <Item label="Ngày gửi" value={application.createdAt ? new Date(application.createdAt).toLocaleString("vi-VN") : "—"} />
                  <Item label="Điều khoản đã chấp nhận" value={`Phiên bản ${application.termsVersion || "seller-terms-v1"}`} />
                  {application.adminNote && <Item label="Ghi chú từ admin" value={application.adminNote} multiline />}
                </dl>

                {application.status === "active" && (
                  <button
                    type="button"
                    onClick={handleRefreshRole}
                    disabled={refreshingRole}
                    className="mt-5 w-full rounded-xl border border-brand/40 bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-brand transition disabled:opacity-50"
                  >
                    {refreshingRole ? "Đang cập nhật quyền..." : "Cập nhật quyền seller và vào trang quản lý"}
                  </button>
                )}
              </>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">Checklist để được duyệt nhanh</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>• Điền đầy đủ thông tin pháp lý và địa chỉ cửa hàng.</p>
              <p>• Tải rõ ảnh mặt tiền, giấy phép và giấy tờ đại diện.</p>
              <p>• Dùng tài khoản ngân hàng hợp lệ để tiện đối soát sau này.</p>
              <p>• Chỉ gửi hồ sơ khi bạn đã sẵn sàng đăng sản phẩm và xử lý đơn thật.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, help, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      {help && <p className="mt-1.5 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        {...props}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
      />
    </div>
  );
}

function UploadField({ label, value, uploading, onFileChange }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 p-4">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        {uploading ? "Đang tải ảnh..." : "Chọn ảnh"}
      </label>
      {value ? (
        <a href={value} target="_blank" rel="noreferrer" className="mt-3 block text-xs text-brand-dark hover:underline break-all">
          Xem ảnh đã tải
        </a>
      ) : (
        <p className="mt-3 text-xs text-gray-400">Chưa có ảnh</p>
      )}
    </div>
  );
}

function Item({ label, value, multiline = false }) {
  return (
    <div>
      <dt className="text-gray-400">{label}</dt>
      <dd className={`text-gray-800 ${multiline ? "mt-1 rounded-xl bg-gray-50 px-3 py-2 whitespace-pre-line" : ""}`}>{value}</dd>
    </div>
  );
}
