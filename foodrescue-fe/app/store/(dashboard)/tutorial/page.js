"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const GUIDE_SECTIONS = [
  {
    id: "dashboard",
    title: "Tổng quan cửa hàng",
    href: "/store",
    badge: "Bắt đầu",
    summary: "Theo dõi tình hình cửa hàng trong ngày: đơn cần xử lý, sản phẩm sắp hết hạn, doanh thu, ví và các hoạt động gần đây.",
    steps: [
      "Kiểm tra các thẻ chỉ số đầu trang để biết việc cần ưu tiên.",
      "Bấm vào từng thẻ để đi nhanh đến đơn hàng, sản phẩm hoặc doanh thu.",
      "Theo dõi mục Ví seller để biết số dư khả dụng và giao dịch mới.",
      "Xem danh sách sản phẩm bán chạy và sản phẩm sắp hết hạn để điều chỉnh bán hàng.",
    ],
    tips: [
      "Nên mở Tổng quan mỗi đầu ca để biết đơn nào đang chờ xác nhận.",
      "Chỉ số Thực nhận ước tính đã trừ hoa hồng nền tảng 5%.",
    ],
  },
  {
    id: "shop",
    title: "Cửa hàng",
    href: "/store/shop",
    badge: "Hồ sơ",
    summary: "Cập nhật thông tin pháp lý, địa chỉ nhận hàng, hình ảnh cửa hàng và tài khoản ngân hàng nhận tiền.",
    steps: [
      "Kiểm tra tên cửa hàng, người liên hệ, số điện thoại và địa chỉ lấy hàng.",
      "Tải đủ giấy tờ hoặc hình ảnh cần xác minh nếu hệ thống yêu cầu.",
      "Cập nhật thông tin ngân hàng để có thể nhận chi trả.",
      "Lưu thay đổi và kiểm tra lại trạng thái hồ sơ.",
    ],
    tips: [
      "Thông tin nhận tiền nên trùng với người đại diện hoặc pháp nhân đã đăng ký.",
      "Địa chỉ lấy hàng càng rõ thì khách càng ít nhầm khi đến nhận.",
    ],
  },
  {
    id: "products",
    title: "Sản phẩm",
    href: "/store/products",
    badge: "Đăng bán",
    summary: "Tạo, chỉnh sửa và quản lý trạng thái sản phẩm giảm lãng phí thực phẩm.",
    steps: [
      "Bấm Thêm sản phẩm mới từ thanh trên cùng hoặc vào trang Sản phẩm.",
      "Nhập tên, mô tả, danh mục, giá gốc và giá giảm.",
      "Thêm biến thể hoặc lô hàng nếu sản phẩm có nhiều lựa chọn.",
      "Cập nhật hạn dùng, tồn kho và hình ảnh chính trước khi đăng bán.",
    ],
    tips: [
      "Ảnh rõ, giá giảm minh bạch và hạn dùng chính xác giúp giảm khiếu nại.",
      "Ẩn sản phẩm khi hết hàng hoặc không còn phù hợp để bán.",
    ],
  },
  {
    id: "orders",
    title: "Đơn hàng",
    href: "/store/orders",
    badge: "Vận hành",
    summary: "Xác nhận, theo dõi và cập nhật trạng thái đơn hàng từ lúc khách đặt đến khi hoàn tất.",
    steps: [
      "Lọc các đơn đang chờ xác nhận để xử lý trước.",
      "Kiểm tra sản phẩm, số lượng, thông tin khách và thời gian nhận hàng.",
      "Cập nhật trạng thái đơn đúng theo tiến trình thực tế.",
      "Theo dõi đơn bị hủy hoặc có vấn đề để phản hồi kịp thời.",
    ],
    tips: [
      "Cập nhật trạng thái sớm giúp khách biết khi nào có thể đến nhận.",
      "Nếu sản phẩm không đủ số lượng, nên xử lý trước khi khách tới cửa hàng.",
    ],
  },
  {
    id: "reviews",
    title: "Đánh giá",
    href: "/store/reviews",
    badge: "Uy tín",
    summary: "Xem phản hồi của khách theo từng sản phẩm để cải thiện chất lượng bán hàng.",
    steps: [
      "Mở danh sách sản phẩm có đánh giá.",
      "Xem điểm trung bình, số lượt đánh giá và nội dung phản hồi.",
      "Ưu tiên xử lý các sản phẩm có điểm thấp hoặc phản hồi lặp lại.",
      "Dùng phản hồi tốt để biết sản phẩm nào nên tiếp tục đẩy bán.",
    ],
    tips: [
      "Đánh giá thường phản ánh độ đúng của mô tả, hạn dùng và trải nghiệm nhận hàng.",
      "Sản phẩm được đánh giá cao có thể dùng làm mẫu cho các bài đăng sau.",
    ],
  },
  {
    id: "stats",
    title: "Doanh thu",
    href: "/store/stats",
    badge: "Số liệu",
    summary: "Theo dõi tổng doanh thu, khoản thực nhận sau hoa hồng, hiệu suất đơn hàng và sản phẩm bán chạy.",
    steps: [
      "Xem các chỉ số chính ở đầu trang để nắm tổng quan.",
      "So sánh doanh thu 7 ngày gần nhất để phát hiện ngày bán tốt hoặc giảm bất thường.",
      "Kiểm tra sản phẩm bán chạy trong 30 ngày để tối ưu tồn kho.",
      "Xuất CSV khi cần đối soát hoặc báo cáo nội bộ.",
    ],
    tips: [
      "Hoa hồng FoodRescue hiện là 5% trên tổng doanh thu.",
      "Thực nhận ước tính = tổng doanh thu - hoa hồng 5%.",
    ],
  },
  {
    id: "wallet",
    title: "Ví & chi trả",
    href: "/store/wallet",
    badge: "Thanh toán",
    summary: "Quản lý số dư, lịch sử giao dịch ví và thông tin tài khoản nhận tiền của seller.",
    steps: [
      "Kiểm tra Số dư khả dụng, Đang chi trả và Đã ghi nhận.",
      "Cập nhật ngân hàng, chủ tài khoản và số tài khoản nhận tiền.",
      "Theo dõi lịch sử ví để biết gross, phí hoa hồng và số tiền thực nhận.",
      "Dùng yêu cầu chi trả demo để mô phỏng flow rút tiền khi trình bày sản phẩm.",
    ],
    tips: [
      "Payout demo không chuyển tiền thật, chỉ tạo giao dịch mô phỏng trong ledger.",
      "Cần đủ thông tin ngân hàng trước khi seller có thể yêu cầu chi trả.",
    ],
  },
  {
    id: "inventory",
    title: "Kho hàng",
    href: "/store/inventory",
    badge: "Tồn kho",
    summary: "Quản lý lô hàng, tồn kho và hạn dùng để tránh bán nhầm sản phẩm không còn khả dụng.",
    steps: [
      "Chọn sản phẩm cần nhập hoặc cập nhật lô hàng.",
      "Nhập số lượng, mã lô và thông tin hạn dùng.",
      "Theo dõi các lô gần hết hạn để chuyển sang chiến dịch bán nhanh.",
      "Điều chỉnh tồn kho khi có sai lệch thực tế tại cửa hàng.",
    ],
    tips: [
      "Kho chính xác giúp dashboard cảnh báo sản phẩm sắp hết hạn tốt hơn.",
      "Nên cập nhật kho ngay sau mỗi ca bán hoặc sau khi hủy đơn.",
    ],
  },
  {
    id: "ads",
    title: "Quảng cáo",
    href: "/store/ads",
    badge: "Hiển thị",
    summary: "Tạo banner hoặc nội dung quảng bá cho sản phẩm/cửa hàng để tăng lượt xem.",
    steps: [
      "Chuẩn bị ảnh banner rõ thông tin sản phẩm hoặc ưu đãi.",
      "Tạo quảng cáo mới và nhập tiêu đề, mô tả, liên kết nếu có.",
      "Kiểm tra trạng thái quảng cáo sau khi gửi.",
      "Theo dõi hiệu quả từ lượt xem hoặc đơn hàng tăng thêm.",
    ],
    tips: [
      "Banner nên tập trung vào sản phẩm thật, giá tốt và thời gian nhận hàng.",
      "Không dùng ảnh gây hiểu nhầm về chất lượng hoặc hạn dùng.",
    ],
  },
  {
    id: "settings",
    title: "Cài đặt",
    href: "/store/settings",
    badge: "Tài khoản",
    summary: "Điều chỉnh các thiết lập vận hành và thông tin liên quan đến tài khoản seller.",
    steps: [
      "Rà soát các thiết lập đang bật cho cửa hàng.",
      "Cập nhật thông tin liên hệ hoặc tùy chọn vận hành nếu có thay đổi.",
      "Kiểm tra lại quyền truy cập trước khi giao tài khoản cho nhân viên.",
      "Lưu thay đổi và quay lại Tổng quan để kiểm tra hoạt động.",
    ],
    tips: [
      "Nên giới hạn người có quyền thay đổi thông tin thanh toán.",
      "Nếu có lỗi tài khoản, chụp lại màn hình và liên hệ admin để kiểm tra nhanh hơn.",
    ],
  },
];

const QUICK_START = [
  "Hoàn thiện hồ sơ cửa hàng và tài khoản nhận tiền.",
  "Đăng sản phẩm đầu tiên với ảnh, giá, hạn dùng và tồn kho rõ ràng.",
  "Theo dõi đơn chờ xác nhận trong Tổng quan hoặc Đơn hàng.",
  "Kiểm tra doanh thu, hoa hồng 5% và khoản thực nhận.",
  "Đối soát ví seller và lịch sử giao dịch sau khi có đơn thanh toán.",
];

export default function SellerTutorialPage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(GUIDE_SECTIONS[0].id);
  const [checked, setChecked] = useState({});

  const filteredSections = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return GUIDE_SECTIONS;

    return GUIDE_SECTIONS.filter((section) => {
      const haystack = [
        section.title,
        section.badge,
        section.summary,
        ...section.steps,
        ...section.tips,
      ].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [query]);

  const activeSection = GUIDE_SECTIONS.find((section) => section.id === activeId) || GUIDE_SECTIONS[0];
  const completedCount = Object.values(checked).filter(Boolean).length;

  const toggleStep = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">Seller guide</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Hướng dẫn sử dụng kênh người bán</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Tài liệu thao tác nhanh cho seller: từ thiết lập cửa hàng, đăng sản phẩm, xử lý đơn, xem doanh thu đến đối soát ví.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Checklist đã tick</p>
          <p className="mt-1 text-2xl font-bold text-brand-dark">{completedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500" htmlFor="seller-guide-search">
              Tìm nội dung
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                id="seller-guide-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm sản phẩm, ví, doanh thu..."
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <nav className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
            {filteredSections.length ? (
              filteredSections.map((section) => {
                const active = section.id === activeSection.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active ? "bg-brand text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="min-w-0 truncate">{section.title}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-white/70 text-gray-800" : "bg-gray-100 text-gray-500"}`}>
                      {section.badge}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-5 text-sm text-gray-400">Không tìm thấy nội dung phù hợp.</p>
            )}
          </nav>
        </aside>

        <main className="space-y-6 min-w-0">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-brand-bg px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
                  {activeSection.badge}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">{activeSection.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{activeSection.summary}</p>
              </div>
              <Link
                href={activeSection.href}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-brand-secondary"
              >
                Mở trang này
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Các bước thao tác</h3>
                <div className="mt-4 space-y-3">
                  {activeSection.steps.map((step, index) => {
                    const key = `${activeSection.id}-${index}`;
                    const isChecked = Boolean(checked[key]);
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => toggleStep(key)}
                        className="flex w-full items-start gap-3 rounded-xl bg-white px-3 py-3 text-left transition hover:bg-emerald-50"
                      >
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${isChecked ? "border-brand-dark bg-brand-dark text-white" : "border-gray-300 text-transparent"}`}>
                          ✓
                        </span>
                        <span className={`text-sm leading-6 ${isChecked ? "text-gray-400 line-through" : "text-gray-700"}`}>{step}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-amber-700">Lưu ý vận hành</h3>
                <ul className="mt-4 space-y-3">
                  {activeSection.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-3 text-sm leading-6 text-amber-900">
                      <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Checklist onboarding seller</h2>
                <p className="mt-1 text-sm text-gray-500">Dùng khi tạo cửa hàng mới hoặc demo flow seller từ đầu đến cuối.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_START.map((item, index) => {
                const key = `quick-${index}`;
                const isChecked = Boolean(checked[key]);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleStep(key)}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition hover:border-brand/40 hover:bg-white"
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isChecked ? "bg-brand-dark text-white" : "bg-white text-gray-400"}`}>
                      {index + 1}
                    </span>
                    <span className={`text-sm leading-6 ${isChecked ? "text-gray-400 line-through" : "text-gray-700"}`}>{item}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function IconBase({ className, children }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function SearchIcon(props) {
  return <IconBase {...props}><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="7" /></IconBase>;
}

function ArrowRightIcon(props) {
  return <IconBase {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></IconBase>;
}

function SparkIcon(props) {
  return <IconBase {...props}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" /></IconBase>;
}