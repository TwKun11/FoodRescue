"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ScrollReveal from "@/components/common/ScrollReveal";
import { apiGetProducts } from "@/lib/api";
import { resolveVariantPricing } from "@/lib/product-pricing";

const PRODUCTS_ROUTE = "/products"; // TODO: support deep-linking near-me filter when products page reads query params.
const STORE_SIGNUP_URL = "https://foodrescue.store/become-seller";

const CITY_AREAS = {
  "Thành phố Đà Nẵng": [
    "Phường Hải Châu",
    "Phường Thanh Khê",
    "Phường Sơn Trà",
    "Phường Ngũ Hành Sơn",
    "Phường Cẩm Lệ",
    "Phường Liên Chiểu",
    "Phường Hòa Khánh",
    "Phường Hòa Xuân",
    "Phường An Hải",
    "Phường Mỹ An",
  ],
  "Thành phố Hồ Chí Minh": [
    "Khu vực Quận 1",
    "Khu vực Quận 3",
    "Khu vực Bình Thạnh",
    "Khu vực Phú Nhuận",
    "Khu vực Tân Bình",
    "Khu vực Thủ Đức",
  ],
  "Thành phố Hà Nội": [
    "Khu vực Hoàn Kiếm",
    "Khu vực Ba Đình",
    "Khu vực Đống Đa",
    "Khu vực Cầu Giấy",
    "Khu vực Hai Bà Trưng",
    "Khu vực Tây Hồ",
  ],
  "Thành phố Huế": ["Khu vực Thuận Hóa", "Khu vực Phú Xuân", "Khu vực Hương Thủy", "Khu vực Hương Trà"],
  "Thành phố Cần Thơ": ["Khu vực Ninh Kiều", "Khu vực Cái Răng", "Khu vực Bình Thủy", "Khu vực Ô Môn"],
};

const DEMO_STATS = [
  { value: "50+", label: "Cửa hàng quan tâm", icon: StoreIcon },
  { value: "1k+", label: "Sản phẩm được đăng thử nghiệm", icon: BasketIcon },
  { value: "500+", label: "Người dùng tiếp cận", icon: UsersIcon },
  { value: "0.5t", label: "Thực phẩm có cơ hội được cứu", icon: SproutIcon },
];

const BUYER_STEPS = [
  "Tìm deal gần bạn",
  "Xem thông tin sản phẩm",
  "Đặt giữ hoặc mua",
  "Đến cửa hàng nhận",
  "Gửi đánh giá sau khi mua",
];

const STORE_STEPS = [
  "Đăng sản phẩm cuối ngày",
  "Cập nhật giá, số lượng và thời gian còn lại",
  "Khách gần khu vực nhìn thấy deal",
  "Xác nhận đơn hoặc mã nhận hàng",
  "Theo dõi sản phẩm đã bán",
];

const TRANSPARENCY_ITEMS = [
  { title: "Hình ảnh thực tế", text: "Người mua cần thấy món đang được bán trước khi quyết định.", icon: ImageIcon },
  { title: "Giá gốc và giá ưu đãi", text: "Thông tin giá nên rõ ràng để người mua tự so sánh.", icon: TagIcon },
  { title: "Thời gian còn lại", text: "Hiển thị hạn dùng hoặc thời gian khuyến nghị nhận/mua.", icon: ClockIcon },
  { title: "Cửa hàng và vị trí", text: "Tên cửa hàng, khu vực và cách nhận hàng cần dễ kiểm tra.", icon: PinIcon },
  { title: "Số lượng còn lại", text: "Giúp người mua biết deal còn phù hợp để đặt giữ hay không.", icon: BoxIcon },
  { title: "Đánh giá/feedback", text: "Phản hồi sau mua giúp cộng đồng có thêm dữ liệu tham khảo.", icon: ChatIcon },
];

const PRODUCT_INTERESTS = ["Rau củ", "Bánh", "Cơm/hộp", "Đồ uống", "Thực phẩm tươi"];
const FIELD_CLASS =
  "w-full rounded-xl border border-emerald-100 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition focus:border-[#33FF99] focus:ring-2 focus:ring-[#33FF99]/30";

const EMPTY_INTEREST_FORM = {
  fullName: "",
  workArea: "",
  userGroup: "",
  productInterest: "",
  storeName: "",
  storeType: "",
  surplusProducts: "",
  interview: "",
  city: "",
  ward: "",
  contact: "",
};

function mapHomepageDeal(product) {
  const variant = product?.variants?.find((item) => item.isDefault) || product?.variants?.[0] || {};
  const pricing = resolveVariantPricing(variant);
  const stock = Number(variant.stockAvailable ?? variant.stockQuantity ?? 0);
  const shelfLifeDays = Number(product?.shelfLifeDays ?? 0);
  const timeLabel = shelfLifeDays > 0 ? `Còn ${shelfLifeDays} ngày` : "Còn trong hôm nay";
  const area = product?.sellerPickupAddress || product?.originProvince || "Chưa cập nhật khu vực";

  return {
    id: product?.id,
    category: product?.categoryName || "Sản phẩm",
    title: product?.name || "Sản phẩm",
    image: product?.primaryImageUrl || "/images/products/raucai.jpg",
    originalPrice: pricing.originalPrice,
    discountPrice: pricing.discountPrice,
    discountPercent: pricing.discountPercent,
    storeName: product?.sellerName || "Food Rescue",
    area,
    stock,
    status: product?.status,
    label: stock <= 0 ? "Hết hàng" : pricing.discountPercent > 0 ? `Giảm ${pricing.discountPercent}%` : "Deal đang bán",
    info: [product?.sellerName, stock > 0 ? timeLabel : "Hết hàng"].filter(Boolean).join(" · "),
  };
}

function isDisplayableDeal(product) {
  const status = String(product?.status || "").toLowerCase();
  if (status && status !== "active") return false;
  const variant = product?.variants?.find((item) => item.isDefault) || product?.variants?.[0] || {};
  const stock = Number(variant.stockAvailable ?? variant.stockQuantity ?? 0);
  return Boolean(product?.id) && stock > 0;
}

export default function HomePage() {
  const [audience, setAudience] = useState("buyer");
  const [form, setForm] = useState(EMPTY_INTEREST_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dealProducts, setDealProducts] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setDealsLoading(true);
    apiGetProducts({ sort: "discount_desc", page: 0, size: 6 })
      .then((res) => {
        if (cancelled) return;
        const content = res.ok && res.data?.data ? res.data.data.content || res.data.data : [];
        const mapped = Array.isArray(content) ? content.filter(isDisplayableDeal).slice(0, 3).map(mapHomepageDeal) : [];
        setDealProducts(mapped);
      })
      .catch(() => {
        if (!cancelled) setDealProducts([]);
      })
      .finally(() => {
        if (!cancelled) setDealsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "city" ? { ward: "" } : null),
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitted(false);
  };

  const handleAudienceChange = (nextAudience) => {
    setAudience(nextAudience);
    setErrors({});
    setSubmitted(false);
  };

  const handleInterestSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.city) nextErrors.city = "Vui lòng chọn thành phố.";
    if (form.city && !form.ward) nextErrors.ward = "Vui lòng chọn khu vực/phường/xã.";
    if (!form.contact.trim()) nextErrors.contact = "Vui lòng nhập kênh liên hệ.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitted(false);
      return;
    }

    // TODO: Connect to lead/subscribe API when backend endpoint is available.
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fdf9]">
      <Header />

      <main className="flex-1">
        <section id="home" className="relative min-h-screen overflow-hidden pt-24">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/images/landingpage/landingpage.png"
              alt=""
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/92 via-gray-900/72 to-gray-900/24" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/64 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr]">
            <ScrollReveal direction="left">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#33FF99]/35 bg-[#33FF99]/16 px-4 py-1.5 text-sm font-bold text-[#9effc7]">
                  <span className="h-2 w-2 rounded-full bg-[#33FF99]" />
                  Deal ngon gần bạn - tiết kiệm hơn mỗi ngày
                </p>
                <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-800">
                  Phiên bản Beta
                </span>
              </div>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[4.8rem]">
                Tìm thực phẩm giảm giá gần bạn
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                Food Rescue giúp người dùng tìm các sản phẩm giảm giá/cuối ngày từ cửa hàng gần khu vực, đồng thời hỗ
                trợ cửa hàng kết nối nhanh hơn với khách hàng có nhu cầu mua ngay.
              </p>
              <p className="mt-4 text-sm font-semibold text-emerald-100">
                Đang thử nghiệm tại khu vực trung tâm thành phố Đà Nẵng.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={PRODUCTS_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl bg-[#33FF99] px-7 py-3.5 text-sm font-extrabold text-gray-950 shadow-xl shadow-emerald-950/30 transition hover:bg-[#12d18e] focus:outline-none focus:ring-2 focus:ring-[#33FF99]/70"
                >
                  Tìm deal gần bạn
                </Link>
                <Link
                  href={STORE_SIGNUP_URL}
                  className="inline-flex items-center justify-center rounded-xl border border-[#33FF99] bg-[#33FF99] px-7 py-3.5 text-sm font-extrabold text-gray-950 shadow-xl shadow-emerald-950/20 transition hover:bg-[#12d18e] focus:outline-none focus:ring-2 focus:ring-[#33FF99]/70"
                >
                  Đăng ký cửa hàng
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {DEMO_STATS.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/15 bg-gray-950/34 p-4 text-center shadow-xl shadow-gray-950/20 backdrop-blur-md"
                    >
                      <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#33FF99]/16 text-[#33FF99]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="text-2xl font-extrabold text-[#33FF99]">{stat.value}</p>
                      <p className="mt-1 text-[11px] font-semibold leading-4 text-white/70">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={120} className="hidden lg:block">
              <div className="relative ml-auto h-[520px] w-[470px]">
                <div className="absolute left-10 top-16 h-[420px] w-[340px] overflow-hidden rounded-[2rem] border-4 border-white/22 shadow-2xl">
                  <img
                    src="/images/landingpage/anhhoaquatrengia.jpg"
                    alt="Sản phẩm tươi tại cửa hàng"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute bottom-8 left-0 h-48 w-44 overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
                  <img
                    src="/images/landingpage/anhtraicay.jpg"
                    alt="Trái cây và rau củ"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute right-0 top-6 w-64 rounded-3xl bg-white p-5 shadow-2xl">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-red-500">Deal mẫu gần bạn</p>
                  <p className="mt-3 text-base font-extrabold text-gray-900">Rau củ cuối ngày</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-700">Giá tốt hơn</span>
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                      Còn hôm nay
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Thông tin cần rõ trước khi người mua quyết định.</p>
                </div>
                <div className="absolute bottom-0 right-4 rounded-2xl bg-emerald-600 px-5 py-4 text-white shadow-2xl">
                  <p className="text-xs font-semibold text-white/75">Phiên bản thử nghiệm</p>
                  <p className="text-2xl font-extrabold">Beta</p>
                  <p className="text-xs text-white/75">đang mở rộng khu vực</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Cách Food Rescue hoạt động</p>
            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">Từ món còn tốt đến người cần mua</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Food Rescue giúp người mua tìm deal gần khu vực và giúp cửa hàng giới thiệu sản phẩm cuối ngày rõ ràng
              hơn.
            </p>
          </ScrollReveal>

          <div className="grid gap-6 lg:grid-cols-2">
            <FlowPanel
              title="Dành cho người mua"
              subtitle="Tìm, kiểm tra và nhận món theo nhu cầu."
              steps={BUYER_STEPS}
              tone="buyer"
            />
            <FlowPanel
              title="Dành cho cửa hàng"
              subtitle="Đưa sản phẩm cuối ngày đến khách gần khu vực."
              steps={STORE_STEPS}
              tone="store"
            />
          </div>
        </section>

        <section id="deals" className="bg-brand-bg py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ScrollReveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Ưu đãi gần bạn</p>
                <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Deal gần bạn, dễ xem - dễ chọn
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Xem nhanh sản phẩm giảm giá/cuối ngày, thông tin cửa hàng và thời gian áp dụng trước khi quyết định
                  mua.
                </p>
              </div>
              <Link href="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                Xem tất cả →
              </Link>
            </ScrollReveal>

            {dealsLoading ? (
              <div className="grid gap-5 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 animate-pulse rounded-xl border border-emerald-100 bg-white shadow-sm"
                  >
                    <div className="h-40 rounded-t-xl bg-emerald-50" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-24 rounded bg-gray-100" />
                      <div className="h-6 w-3/4 rounded bg-gray-100" />
                      <div className="h-4 w-full rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dealProducts.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-3">
                {dealProducts.map((deal, index) => (
                  <ScrollReveal key={deal.id} direction="up" delay={index * 90}>
                    <Link
                      href={`/products/${deal.id}`}
                      className="block h-full overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-emerald-50">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {deal.category}
                          </span>
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {deal.label}
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-gray-900">{deal.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{deal.info}</p>
                        <p className="mt-1 text-sm text-gray-500">{deal.area}</p>
                        <div className="mt-4">
                          {deal.originalPrice > deal.discountPrice && (
                            <span className="mr-2 text-sm text-gray-400 line-through">
                              {deal.originalPrice.toLocaleString("vi-VN")} đồng
                            </span>
                          )}
                          <span className="font-extrabold text-emerald-700">
                            {deal.discountPrice.toLocaleString("vi-VN")} đồng
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Còn {deal.stock} sản phẩm</p>
                        <span className="mt-5 inline-flex text-sm font-semibold text-emerald-700">
                          Xem chi tiết
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-100 bg-white px-5 py-12 text-center text-sm font-semibold text-gray-600 shadow-sm">
                Chưa có deal phù hợp. Food Rescue sẽ cập nhật thêm sản phẩm gần bạn sớm.
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden py-20 lg:py-24">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(52,255,153,0.22),transparent_32%),linear-gradient(135deg,#ecfdf5_0%,#ffffff_48%,#d1fae5_100%)]" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <ScrollReveal className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">An toàn & minh bạch</p>
              <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Thông tin rõ ràng để mua đúng nhu cầu
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Trước khi quyết định, người mua cần biết món gì còn, còn trong bao lâu, ở cửa hàng nào và thông tin có
                đủ minh bạch không.
              </p>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRANSPARENCY_ITEMS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal
                    key={item.title}
                    direction="up"
                    delay={index * 60}
                    className="rounded-2xl border border-emerald-100 bg-white/92 p-5 shadow-lg shadow-emerald-900/5 backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-[#33FF99] shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="for-stores" className="bg-gray-900 py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <ScrollReveal direction="left">
              <p className="text-sm font-bold uppercase tracking-widest text-brand">Dành cho cửa hàng</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Sản phẩm còn tốt nên có thêm cơ hội đến tay khách hàng
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72">
                Cuối ngày nếu cửa hàng còn sản phẩm cần bán nhanh, Food Rescue giúp sản phẩm được hiển thị đến nhóm
                khách hàng gần khu vực. Nhờ đó, cửa hàng có thêm một kênh tiếp cận người mua tiềm năng, giảm nguy cơ sản
                phẩm bị bỏ lỡ và góp phần hạn chế lãng phí thực phẩm.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/82">
                {[
                  "Đăng sản phẩm cuối ngày nhanh chóng",
                  "Tiếp cận khách hàng gần khu vực",
                  "Theo dõi sản phẩm và đơn đặt giữ trên dashboard",
                  "Có hỗ trợ trong giai đoạn thử nghiệm",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="#interest-form"
                className="mt-8 inline-flex rounded-xl bg-[#33FF99] px-6 py-3 text-sm font-bold text-gray-950 transition hover:bg-[#12d18e]"
              >
                Đăng ký cửa hàng quan tâm
              </Link>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={120}>
              <img
                src="/images/landingpage/anhhoaqua.jpg"
                alt="Cửa hàng có sản phẩm cuối ngày"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
              />
            </ScrollReveal>
          </div>
        </section>

        <section id="about-food-rescue" className="relative overflow-hidden py-20 lg:py-24">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white via-emerald-50 to-white" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <ScrollReveal>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Về Food Rescue</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl lg:text-5xl">
                  Nền tảng kết nối người mua với cửa hàng có sản phẩm giảm giá/cuối ngày
                </h2>
                <p className="mt-5 text-sm leading-7 text-gray-600">
                  Dự án đang ở giai đoạn thử nghiệm/validation. Nhóm đang tìm người dùng góp ý, cửa hàng thử nghiệm và
                  feedback từ cộng đồng để hoàn thiện trải nghiệm phù hợp hơn với nhu cầu thực tế.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Beta", "Đang kiểm chứng nhu cầu"],
                    ["Cộng đồng", "Ưu tiên feedback thật"],
                    ["Minh bạch", "Thông tin từ cửa hàng"],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                      <p className="text-lg font-extrabold text-emerald-800">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <div className="relative rounded-[2rem] border border-emerald-100 bg-gray-950 p-6 text-white shadow-2xl shadow-emerald-900/15">
                  <div className="absolute right-6 top-6 rounded-full bg-[#33FF99] px-3 py-1 text-xs font-black text-gray-950">
                    Phiên bản Beta
                  </div>
                  <h3 className="pr-28 text-2xl font-extrabold">Cam kết minh bạch</h3>
                  <p className="mt-5 text-sm leading-7 text-white/72">
                    Food Rescue không khuyến khích bán sản phẩm không rõ nguồn. Thông tin sản phẩm cần minh bạch từ cửa
                    hàng, bao gồm hình ảnh, giá, số lượng, hạn sử dụng hoặc thời gian khuyến nghị dùng.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      "Không bán hàng không rõ nguồn",
                      "Cửa hàng chịu trách nhiệm thông tin",
                      "Người dùng có thể feedback",
                      "Đang mở rộng thử nghiệm",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold text-white/86"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="interest-form" className="bg-brand-bg py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr]">
            <ScrollReveal>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Đăng ký quan tâm</p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Gửi thông tin để Food Rescue liên hệ khi thử nghiệm mở rộng
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                Form này chỉ ghi nhận mô phỏng trên giao diện trong phạm vi homepage, chưa kết nối API lead/subscribe.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={120}>
              <form
                onSubmit={handleInterestSubmit}
                className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-900/8 sm:p-7"
              >
                <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-emerald-50 p-1.5">
                  <button
                    type="button"
                    onClick={() => handleAudienceChange("buyer")}
                    className={`rounded-xl px-3 py-3 text-sm font-extrabold transition ${
                      audience === "buyer"
                        ? "bg-[#33FF99] text-gray-950 shadow-md shadow-emerald-900/20"
                        : "text-emerald-900 hover:bg-white/70"
                    }`}
                  >
                    Người mua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAudienceChange("store")}
                    className={`rounded-xl px-3 py-3 text-sm font-extrabold transition ${
                      audience === "store"
                        ? "bg-[#33FF99] text-gray-950 shadow-md shadow-emerald-900/20"
                        : "text-emerald-900 hover:bg-white/70"
                    }`}
                  >
                    Cửa hàng
                  </button>
                </div>

                <div className="grid gap-5">
                  {audience === "buyer" ? (
                    <BuyerFields form={form} updateField={updateField} />
                  ) : (
                    <StoreFields form={form} updateField={updateField} />
                  )}
                  <LocationFields form={form} errors={errors} updateField={updateField} />
                </div>

                {submitted && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold leading-6 text-emerald-800">
                    Cảm ơn bạn! Food Rescue đã ghi nhận thông tin và sẽ liên hệ khi có thử nghiệm phù hợp.
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-6 w-full rounded-2xl bg-[#33FF99] px-5 py-3.5 text-sm font-extrabold text-gray-950 shadow-lg shadow-emerald-900/18 transition hover:bg-[#12d18e] focus:outline-none focus:ring-2 focus:ring-[#33FF99]/60"
                >
                  Gửi thông tin quan tâm
                </button>
              </form>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />

      <button
        type="button"
        aria-label="Chat với Food Rescue"
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg transition hover:bg-emerald-800 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
      >
        <ChatIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

function FlowPanel({ title, subtitle, steps, tone }) {
  const buyerTone = tone === "buyer";
  return (
    <ScrollReveal direction="up" className="h-full">
      <div className="h-full rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-7">
        <div
          className={`mb-6 inline-flex rounded-full px-3 py-1 text-xs font-bold ${buyerTone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
        >
          {title}
        </div>
        <p className="text-sm leading-6 text-gray-600">{subtitle}</p>
        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="group flex items-start gap-4 rounded-2xl border border-transparent p-2 transition hover:border-emerald-100 hover:bg-emerald-50/50"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold shadow-sm ${buyerTone ? "bg-emerald-700 text-white" : "bg-amber-400 text-gray-950"}`}
              >
                {index + 1}
              </span>
              <p className="pt-2 text-sm font-semibold text-gray-800">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-600">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}

function BuyerFields({ form, updateField }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Họ tên">
        <input
          required
          value={form.fullName}
          onChange={updateField("fullName")}
          className={FIELD_CLASS}
          placeholder="Nguyễn Văn A"
        />
      </Field>
      <Field label="Khu vực đang sống/làm việc">
        <input
          required
          value={form.workArea}
          onChange={updateField("workArea")}
          className={FIELD_CLASS}
          placeholder="Hải Châu, Đà Nẵng"
        />
      </Field>
      <Field label="Nhóm người dùng">
        <select required value={form.userGroup} onChange={updateField("userGroup")} className={FIELD_CLASS}>
          <option value="">Chọn nhóm</option>
          <option>Sinh viên</option>
          <option>Nhân viên văn phòng</option>
          <option>Nội trợ</option>
          <option>Khác</option>
        </select>
      </Field>
      <Field label="Loại sản phẩm quan tâm">
        <select required value={form.productInterest} onChange={updateField("productInterest")} className={FIELD_CLASS}>
          <option value="">Chọn loại sản phẩm</option>
          {PRODUCT_INTERESTS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function StoreFields({ form, updateField }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Tên cửa hàng">
        <input
          required
          value={form.storeName}
          onChange={updateField("storeName")}
          className={FIELD_CLASS}
          placeholder="Tên cửa hàng"
        />
      </Field>
      <Field label="Loại hình cửa hàng">
        <input
          required
          value={form.storeType}
          onChange={updateField("storeType")}
          className={FIELD_CLASS}
          placeholder="Tiệm bánh, quán ăn..."
        />
      </Field>
      <Field label="Sản phẩm thường còn cuối ngày">
        <input
          required
          value={form.surplusProducts}
          onChange={updateField("surplusProducts")}
          className={FIELD_CLASS}
          placeholder="Bánh, cơm hộp, rau củ..."
        />
      </Field>
      <Field label="Tham gia phỏng vấn/góp ý?">
        <select required value={form.interview} onChange={updateField("interview")} className={FIELD_CLASS}>
          <option value="">Chọn câu trả lời</option>
          <option>Có</option>
          <option>Cần trao đổi thêm</option>
          <option>Chưa chắc</option>
        </select>
      </Field>
    </div>
  );
}

function LocationFields({ form, errors, updateField }) {
  const areas = form.city ? CITY_AREAS[form.city] || [] : [];
  return (
    <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/55 p-4 sm:grid-cols-3">
      <Field label="Thành phố" error={errors.city}>
        <select required value={form.city} onChange={updateField("city")} className={FIELD_CLASS}>
          <option value="">Chọn thành phố</option>
          {Object.keys(CITY_AREAS).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Khu vực/Phường/Xã" error={errors.ward}>
        <select required value={form.ward} onChange={updateField("ward")} className={FIELD_CLASS} disabled={!form.city}>
          <option value="">{form.city ? "Chọn khu vực" : "Chọn thành phố trước"}</option>
          {areas.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Zalo/email/liên hệ" error={errors.contact}>
        <input
          required
          value={form.contact}
          onChange={updateField("contact")}
          className={FIELD_CLASS}
          placeholder="email@example.com hoặc Zalo"
        />
      </Field>
    </div>
  );
}

function IconBase({ className, children }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function StoreIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M4 10h16" />
      <path d="M5 10l1-5h12l1 5" />
      <path d="M6 10v9h12v-9" />
      <path d="M9 19v-5h6v5" />
    </IconBase>
  );
}

function BasketIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M6 10l2-5" />
      <path d="M18 10l-2-5" />
      <path d="M3 10h18l-2 10H5L3 10z" />
      <path d="M8 14v2" />
      <path d="M12 14v2" />
      <path d="M16 14v2" />
    </IconBase>
  );
}

function UsersIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

function SproutIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M7 20h10" />
      <path d="M12 20V10" />
      <path d="M12 10C8 10 5 7 5 3c4 0 7 3 7 7z" />
      <path d="M12 12c4 0 7-3 7-7-4 0-7 3-7 7z" />
    </IconBase>
  );
}

function ImageIcon({ className }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" />
      <path d="M21 15l-5-5L5 19" />
    </IconBase>
  );
}

function TagIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <path d="M7 7h.01" />
    </IconBase>
  );
}

function ClockIcon({ className }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

function PinIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </IconBase>
  );
}

function BoxIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </IconBase>
  );
}

function ChatIcon({ className }) {
  return (
    <IconBase className={className}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 21 12z" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
    </IconBase>
  );
}
