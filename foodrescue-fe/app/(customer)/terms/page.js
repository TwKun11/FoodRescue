import TermsContent from "./TermsContent";
import { TERMS } from "./terms";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590746305008";

const POLICY_HIGHLIGHTS = [
  "FoodRescue là nền tảng kết nối người mua với cửa hàng có sản phẩm giảm giá/cuối ngày, không trực tiếp sản xuất hoặc kiểm định sản phẩm thay cho cửa hàng.",
  "Người bán phải đăng đúng thông tin nguồn gốc, hạn dùng, giá, số lượng, điều kiện nhận hàng và chịu trách nhiệm chính về chất lượng sản phẩm.",
  "Người mua cần kiểm tra kỹ mô tả, hạn dùng, thời gian nhận hàng và phản hồi sớm khi sản phẩm sai mô tả, thiếu số lượng hoặc có vấn đề chất lượng.",
  "Các yêu cầu hủy đơn, hoàn tiền, khiếu nại và xử lý vi phạm được xem xét dựa trên mã đơn, hình ảnh, video, nội dung trao đổi và dữ liệu trên hệ thống.",
];

export const metadata = {
  title: "Trung tâm hỗ trợ FoodRescue",
};

export default function TermsPage() {
  return (
    <div className="terms-page min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-emerald-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            FoodRescue Support
          </p>
          <h1
            className="terms-page-heading mt-3 text-3xl font-extrabold sm:text-4xl"
            style={{ color: "var(--terms-heading-color, #064e3b)" }}
          >
            Trung tâm hỗ trợ FoodRescue
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600 dark:text-slate-300">
            Nơi tổng hợp các điều khoản, chính sách và hướng dẫn hỗ trợ người mua, cửa hàng và các bên liên quan khi sử dụng FoodRescue.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {POLICY_HIGHLIGHTS.map((item) => (
              <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-100">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-gray-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            <p
              className="terms-page-heading font-bold"
              style={{ color: "var(--terms-heading-color, #064e3b)" }}
            >
              Thông tin liên hệ chính thức
            </p>
            <p>Email: foodrescue888@gmail.com</p>
            <p>Website: https://foodrescue.store/</p>
            <p>
              Facebook: {" "}
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200">
                Fanpage Food Rescue
              </a>
            </p>
          </div>
        </div>
      </section>

      <TermsContent terms={TERMS} />
    </div>
  );
}
