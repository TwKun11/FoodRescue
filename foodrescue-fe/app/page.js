// FE02-001 – UI Trang Home (Food Rescue – Landing Page Pro)
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ScrollReveal from "@/components/common/ScrollReveal";
import ProductCard from "@/components/customer/ProductCard";
import Link from "next/link";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    image: "/images/products/raucai.jpg",
    originalPrice: 35000,
    discountPrice: 17500,
    discountPercent: 50,
    expiryLabel: "Còn 3 giờ",
    storeName: "Vinmart Q1",
  },
  {
    id: "2",
    name: "Thịt heo ba chỉ 300g",
    image: "/images/products/thitheo.jpg",
    originalPrice: 85000,
    discountPrice: 51000,
    discountPercent: 40,
    expiryLabel: "Còn 5 giờ",
    storeName: "Circle K Hai Bà Trưng",
  },
  {
    id: "3",
    name: "Tôm sú tươi 200g",
    image: "/images/products/tomsu.jpg",
    originalPrice: 120000,
    discountPrice: 84000,
    discountPercent: 30,
    expiryLabel: "Còn 2 giờ",
    storeName: "Lotte Mart Q7",
  },
  {
    id: "4",
    name: "Bánh mì sandwich nguyên cám",
    image: "/images/products/banhmi.jpg",
    originalPrice: 45000,
    discountPrice: 22500,
    discountPercent: 50,
    expiryLabel: "Còn 1 giờ",
    storeName: "BreadTalk Vincom",
  },
];

const IMPACT_STATS = [
  { value: "500+", label: "Cửa hàng đối tác", icon: "🏪" },
  { value: "10K+", label: "Sản phẩm giải cứu", icon: "🛒" },
  { value: "50K+", label: "Khách hàng hài lòng", icon: "👥" },
  { value: "5 tấn", label: "Thực phẩm được cứu", icon: "🌍" },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Thị Lan",
    role: "Nội trợ, Quận 3",
    quote: "Mỗi ngày tôi tiết kiệm được 30–50% chi phí thực phẩm. Chất lượng rau củ lại tươi ngon hơn tôi nghĩ!",
    avatar: "L",
    stars: 5,
  },
  {
    name: "Trần Minh Khoa",
    role: "Sinh viên, Bình Thạnh",
    quote:
      "App dùng cực tiện, ưu đãi cập nhật liên tục. Mình tiết kiệm được hơn 500k mỗi tháng từ khi dùng FoodRescue.",
    avatar: "K",
    stars: 5,
  },
  {
    name: "Lê Thị Hương",
    role: "Chủ cửa hàng, Gò Vấp",
    quote: "Nhờ FoodRescue, hàng tồn cuối ngày của tôi không còn bị bỏ đi nữa. Doanh thu tăng thêm 20% mỗi tháng!",
    avatar: "H",
    stars: 5,
  },
];

const GALLERY_IMAGES = [
  {
    src: "/images/landingpage/anhhoaquatrengia.jpg",
    alt: "Trái cây tươi trên kệ",
    label: "Trái cây tươi mỗi ngày",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/images/landingpage/veggies.jpg",
    alt: "Rau củ tươi",
    label: "Rau củ hữu cơ",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/images/landingpage/anhtraicay.jpg",
    alt: "Trái cây nhiệt đới",
    label: "Đặc sản nhiệt đới",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/images/landingpage/anhbuaan.jpg",
    alt: "Bữa ăn ngon",
    label: "Bữa ăn trọn vẹn",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/images/landingpage/anhhoaqua.jpg",
    alt: "Hoa quả đa dạng",
    label: "Đa dạng lựa chọn",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/images/landingpage/eat%20your%20veg.jpg",
    alt: "Ăn rau củ tốt cho sức khoẻ",
    label: "Sức khoẻ từ thiên nhiên",
    span: "col-span-1 row-span-1",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — HERO  
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background — landingpage.png full bleed */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/images/landingpage/landingpage.png"
              alt=""
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient: strong left for text, fade right for images */}
            <div className="absolute inset-0 bg-linear-to-r from-gray-950/88 via-gray-900/65 to-gray-900/20" />
            <div className="absolute inset-0 bg-linear-to-t from-gray-950/50 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* ── LEFT: content ── */}
              <ScrollReveal className="order-2 lg:order-1" direction="left">
                {/* Badge */}
                <div className="hero-badge inline-flex items-center gap-2 bg-brand/20 backdrop-blur-sm border border-brand/35 text-brand rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-brand animate-pulse inline-block" />
                  Giải pháp chống lãng phí thực phẩm #1 Việt Nam
                </div>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                  Giải cứu thực phẩm —{" "}
                  <span className="relative inline-block">
                    <span className="text-brand">Chung tay</span>
                  </span>
                  <br />
                  bảo vệ hành tinh
                </h1>

                {/* Subtext */}
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                  Kết nối bạn với hàng trăm cửa hàng có thực phẩm cuối ngày chất lượng với giá giảm đến{" "}
                  <strong className="text-white">50%</strong>. Mỗi đơn hàng là một hành động thiết thực bảo vệ môi
                  trường.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 mb-10">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-secondary text-gray-900 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-brand/40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Mua ngay — Tiết kiệm 50%
                  </Link>
                  <Link
                    href="/store/login"
                    className="inline-flex items-center gap-2 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-900/65 text-white font-semibold px-7 py-3.5 rounded-2xl text-sm border border-white/30 transition-all duration-200 hover:scale-105"
                  >
                    Đăng ký cửa hàng →
                  </Link>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {IMPACT_STATS.map((s) => (
                    <div
                      key={s.label}
                      className="bg-gray-900/40 backdrop-blur-sm border border-white/20 rounded-2xl p-3 text-center hover:bg-gray-900/55 transition-colors"
                    >
                      <p className="text-lg mb-0.5">{s.icon}</p>
                      <p className="text-xl font-extrabold text-brand">{s.value}</p>
                      <p className="text-gray-300 text-[11px] mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* ── RIGHT: picture-in-picture collage ── */}
              <ScrollReveal className="order-1 lg:order-2 relative flex justify-center lg:justify-end" direction="right" delay={120}>
                {/* Main picture frame */}
                <div className="relative w-72 h-96 sm:w-80 sm:h-110 lg:w-96 lg:h-125">
                  <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/25">
                    <img
                      src="/images/landingpage/anhhoaquatrengia.jpg"
                      alt="Thực phẩm tươi trên kệ"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Inner picture — bottom-left overlap */}
                  <div className="absolute -bottom-4 -left-6 w-40 h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src="/images/landingpage/anhtraicay.jpg"
                      alt="Trái cây tươi"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Deal card — top-right */}
                  <div className="absolute -top-4 -right-4 z-10 pointer-events-none bg-white rounded-2xl shadow-xl p-4 w-52 border border-brand/20 hero-float">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                        Ưu đãi nóng hôm nay
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">🥦 Rau củ hữu cơ</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-brand-dark font-extrabold text-xl">-50%</span>
                      <span className="text-xs bg-orange-50 border border-orange-200 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        ⏱ Còn 2 giờ
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-brand-dark rounded-full" style={{ width: "68%" }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">68 / 100 phần còn lại</p>
                  </div>

                  {/* Eco badge — bottom-right */}
                  <div className="absolute bottom-6 right-0 translate-x-1/4 bg-brand-dark text-white rounded-2xl px-4 py-3 shadow-xl">
                    <p className="text-xs font-medium opacity-80">Đã cứu được</p>
                    <p className="text-2xl font-extrabold leading-none">5 tấn 🌿</p>
                    <p className="text-xs opacity-70 mt-0.5">thực phẩm tháng này</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-1 text-white/50">
            <p className="text-xs tracking-widest uppercase">Khám phá</p>
            <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-white/60 scroll-dot" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — TICKER / TRUST BAND
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-brand-dark py-3 overflow-hidden">
          <div className="ticker-track flex gap-0 whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="ticker-content flex items-center gap-0 shrink-0">
                {[
                  "🏪 500+ Cửa hàng đối tác",
                  "🥗 Thực phẩm tươi mỗi ngày",
                  "💚 Giảm lãng phí thực phẩm",
                  "⚡ Ưu đãi cập nhật liên tục",
                  "🌍 Vì tương lai xanh",
                  "🛒 10.000+ sản phẩm giải cứu",
                  "⭐ Chất lượng đảm bảo 100%",
                  "🔒 Thanh toán an toàn",
                ].map((item) => (
                  <span key={item} className="text-white font-semibold text-sm px-8">
                    {item}
                    <span className="ml-8 text-white/40">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — MISSION / STORY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image side */}
            <ScrollReveal className="relative" direction="left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-4/3">
                <img
                  src="/images/landingpage/Eating%20Like%20This%20Could%20Give%20You%20The%20Best%20Skin%20Of%20Your%20Life.jpg"
                  alt="Bữa ăn bổ dưỡng tự nhiên"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-brand-dark/40 to-transparent" />
              </div>
              {/* Floating tag */}
              <div className="absolute -bottom-5 -right-3 lg:-right-8 pointer-events-none bg-white rounded-2xl shadow-xl px-5 py-4 border border-brand/20 max-w-50">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">♻️</span>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Đã giải cứu</p>
                    <p className="font-extrabold text-brand-dark text-lg leading-none">5 tấn</p>
                    <p className="text-xs text-gray-400">thực phẩm / tháng</p>
                  </div>
                </div>
              </div>
              {/* Green blob decoration */}
              <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-brand/20 -z-10 blur-xl" />
            </ScrollReveal>

            {/* Content side */}
            <ScrollReveal direction="right" delay={120}>
              <span className="inline-block text-brand-dark font-bold text-sm tracking-widest uppercase mb-3">
                Sứ mệnh của chúng tôi
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
                Không để thực phẩm{" "}
                <span className="text-brand-dark relative">
                  tốt
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    height="6"
                  >
                    <path d="M0,5 Q50,0 100,5" stroke="#33ff99" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                bị lãng phí
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-8">
                Mỗi ngày, hàng tấn thực phẩm tươi ngon bị bỏ đi vì không được bán kịp. FoodRescue kết nối cửa hàng với
                người tiêu dùng, tạo ra giá trị cho cả hai phía trong khi bảo vệ hành tinh.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: "💰",
                    title: "Tiết kiệm thực sự",
                    desc: "Giảm đến 50% so với giá niêm yết trên kệ siêu thị.",
                  },
                  {
                    icon: "🥗",
                    title: "Chất lượng đảm bảo",
                    desc: "Thực phẩm còn hạn sử dụng, được kiểm soát bởi cửa hàng uy tín.",
                  },
                  {
                    icon: "🌿",
                    title: "Tác động môi trường",
                    desc: "Giảm khí CO₂ từ rác thải thực phẩm, vì tương lai xanh hơn.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center text-xl shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 mt-8 bg-brand-dark hover:bg-brand-secondary text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 text-sm"
              >
                Khám phá sản phẩm ngay
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — IMAGE FEATURES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-brand-bg py-20 lg:py-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ScrollReveal className="text-center mb-12">
              <span className="text-brand-dark font-bold text-sm tracking-widest uppercase">Tươi ngon mỗi ngày</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Chất lượng nói lên tất cả</h2>
            </ScrollReveal>

            {/* 3-column image cards */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Card 1 */}
              <ScrollReveal className="group relative overflow-hidden rounded-3xl shadow-md transition-shadow duration-300 hover:shadow-xl aspect-3/4" direction="up">
                <img
                  src="/images/landingpage/veggies.jpg"
                  alt="Rau củ tươi sạch"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block bg-brand text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Rau củ
                  </span>
                  <h3 className="text-white font-bold text-xl leading-tight">Rau sạch hữu cơ tươi mỗi ngày</h3>
                  <p className="text-white/70 text-sm mt-1">Đảm bảo nguồn gốc, không hóa chất</p>
                </div>
              </ScrollReveal>

              {/* Card 2 — taller, center hero */}
              <ScrollReveal
                className="group relative overflow-hidden rounded-3xl shadow-md transition-shadow duration-300 hover:shadow-xl aspect-3/4 md:-mt-6 md:mb-6"
                direction="up"
                delay={120}
              >
                <img
                  src="/images/landingpage/download.jpg"
                  alt="Thực phẩm tươi ngon"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                {/* Floating badge */}
                <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg border border-brand/20">
                  <p className="text-xs text-gray-500 font-medium">Tiết kiệm tới</p>
                  <p className="text-2xl font-extrabold text-brand-dark leading-none">50%</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block bg-brand text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Hôm nay
                  </span>
                  <h3 className="text-white font-bold text-xl leading-tight">Thực phẩm cuối ngày giá tốt nhất</h3>
                  <p className="text-white/70 text-sm mt-1">Cập nhật liên tục theo giờ</p>
                </div>
              </ScrollReveal>

              {/* Card 3 */}
              <ScrollReveal className="group relative overflow-hidden rounded-3xl shadow-md transition-shadow duration-300 hover:shadow-xl aspect-3/4" direction="up" delay={220}>
                <img
                  src="/images/landingpage/eat%20your%20veg.jpg"
                  alt="Ăn rau tốt cho sức khoẻ"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block bg-brand text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Sức khoẻ
                  </span>
                  <h3 className="text-white font-bold text-xl leading-tight">Ăn đúng — Sống khoẻ mỗi ngày</h3>
                  <p className="text-white/70 text-sm mt-1">Đa dạng dinh dưỡng, giá phải chăng</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Bottom CTA strip */}
            <ScrollReveal
              className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/15 bg-white px-6 py-5 shadow-sm"
              direction="up"
              delay={160}
            >
              <div className="flex items-center gap-4">
                {[
                  { icon: "🥬", text: "Rau củ quả" },
                  { icon: "🍖", text: "Thịt tươi" },
                  { icon: "🐟", text: "Hải sản" },
                  { icon: "🥐", text: "Bánh & đồ ăn sẵn" },
                ].map((cat) => (
                  <span
                    key={cat.text}
                    className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 font-medium"
                  >
                    <span>{cat.icon}</span> {cat.text}
                  </span>
                ))}
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-dark hover:bg-brand-secondary text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
              >
                Xem tất cả →
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — PHOTO GALLERY
        ═══════════════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
          <ScrollReveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
            <div>
              <span className="text-brand-dark font-bold text-sm tracking-widest uppercase">Thực phẩm tươi sống</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Từ thiên nhiên đến bàn ăn</h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-brand-dark hover:text-brand-secondary flex items-center gap-1.5 shrink-0"
            >
              Xem tất cả sản phẩm
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-3 grid-rows-3 gap-3 h-130 sm:h-150">
            {GALLERY_IMAGES.map((img, index) => (
              <ScrollReveal
                key={img.src}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl ${img.span}`}
                direction="up"
                delay={index * 80}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-gray-900/70 via-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-white font-semibold text-sm bg-brand-dark/80 px-3 py-1 rounded-full">
                    {img.label}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6 — FEATURED DEALS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-brand-bg py-20 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ScrollReveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
              <div>
                <span className="text-brand-dark font-bold text-sm tracking-widest uppercase">
                  Giải cứu ngay hôm nay
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Ưu đãi sắp hết hạn ⚡</h2>
                <p className="text-gray-500 mt-2 text-sm">Nhanh tay kẻo hết — cập nhật theo giờ</p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark hover:text-brand-secondary shrink-0"
              >
                Xem tất cả →
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURED_PRODUCTS.map((product, index) => (
                <ScrollReveal key={product.id} direction="up" delay={index * 90}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>

            {/* CTA under products */}
            <ScrollReveal className="mt-10 text-center" direction="up" delay={120}>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white font-semibold px-8 py-3 rounded-2xl text-sm transition-all duration-200"
              >
                Xem thêm ưu đãi
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 7 — IMPACT NUMBERS  (full-bleed dark green)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Background with image */}
          <div className="absolute inset-0 pointer-events-none">
            <img src="/images/landingpage/veggies.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-brand-dark/92" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24 text-center">
            <span className="text-brand font-bold text-sm tracking-widest uppercase">Con số biết nói</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-14">Tác động thực sự của chúng ta</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {IMPACT_STATS.map((stat, index) => (
                <ScrollReveal
                  key={stat.label}
                  className="bg-gray-900/30 backdrop-blur-sm rounded-3xl py-8 px-4 border border-white/15 hover:bg-gray-900/45 transition-colors"
                  direction="up"
                  delay={index * 90}
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <p className="text-4xl lg:text-5xl font-extrabold text-brand mb-2">{stat.value}</p>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 8 — STORE PARTNER CTA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden grid lg:grid-cols-2 min-h-100">
            {/* Content */}
            <ScrollReveal className="p-10 lg:p-14 flex flex-col justify-center" direction="left">
              <span className="inline-block bg-brand/20 text-brand text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider w-fit">
                Dành cho cửa hàng
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-5">
                Biến hàng tồn thành <span className="text-brand">doanh thu</span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                Đừng để thực phẩm cuối ngày trở thành rác. Đăng ký làm đối tác FoodRescue, tiếp cận hàng nghìn khách
                hàng quanh bạn và tăng doanh thu thêm 20% mỗi tháng.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "✅ Đăng ký miễn phí, không phí hoa hồng ban đầu",
                  "✅ Tiếp cận 50.000+ khách hàng tiềm năng",
                  "✅ Dashboard quản lý đơn hàng trực quan",
                  "✅ Hỗ trợ kỹ thuật 24/7",
                ].map((item) => (
                  <li key={item} className="text-gray-300 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/store/login"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-secondary text-gray-900 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105"
                >
                  Đăng ký ngay — Miễn phí
                </Link>
                <Link
                  href="/store/login"
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium px-4 py-3 transition-colors"
                >
                  Tìm hiểu thêm →
                </Link>
              </div>
            </ScrollReveal>

            {/* Image */}
            <ScrollReveal className="relative hidden lg:block" direction="right" delay={140}>
              <img
                src="/images/landingpage/anhhoaqua.jpg"
                alt="Cửa hàng đối tác FoodRescue"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 pointer-events-none bg-linear-to-r from-gray-900/60 to-transparent" />
              {/* Floating success card */}
              <div className="absolute bottom-10 right-8 pointer-events-none bg-white rounded-2xl shadow-xl p-4 w-48">
                <p className="text-xs text-gray-500 mb-1">Doanh thu thêm mỗi tháng</p>
                <p className="text-2xl font-extrabold text-brand-dark">+23%</p>
                <p className="text-xs text-gray-400 mt-0.5">trung bình các đối tác</p>
                <div className="mt-2 flex gap-0.5">
                  {[60, 80, 70, 90, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-brand" style={{ height: `${h * 0.28}px` }} />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 9 — TESTIMONIALS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="bg-brand-bg py-20 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <ScrollReveal className="text-center mb-12">
              <span className="text-brand-dark font-bold text-sm tracking-widest uppercase">Khách hàng nói gì</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Hàng nghìn người đã tin dùng</h2>
              <div className="flex justify-center items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-gray-500 text-sm ml-2">4.9/5 — 2,300+ đánh giá</span>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, index) => (
                <ScrollReveal
                  key={t.name}
                  className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-md border border-gray-100 hover:border-brand/20 transition-all duration-300"
                  direction="up"
                  delay={index * 110}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 10 — FINAL CTA BANNER
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <img src="/images/landingpage/anhtraicay.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-brand-dark/90" />
          </div>
          <ScrollReveal className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-20 lg:py-24 text-center">
            <div className="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 text-brand rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse inline-block" />
              Bắt đầu tiết kiệm ngay hôm nay
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Hãy cùng chúng tôi <span className="text-brand">giải cứu</span>
              <br />
              thực phẩm Việt Nam
            </h2>
            <p className="text-white/70 text-base mb-10 max-w-xl mx-auto">
              Tham gia cộng đồng 50.000+ người đang hành động vì môi trường và ví tiền của mình.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-secondary text-gray-900 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 hover:shadow-xl hover:shadow-brand/30"
              >
                🛒 Mua ngay — Giảm đến 50%
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-gray-900/50 hover:bg-gray-900/65 text-white font-semibold px-8 py-4 rounded-2xl text-base border border-white/30 transition-all hover:scale-105"
              >
                Đăng ký miễn phí →
              </Link>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />

      {/* ── Floating Chat Button ── */}
      <button
        type="button"
        aria-label="Chat với AI"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-dark text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    </div>
  );
}
