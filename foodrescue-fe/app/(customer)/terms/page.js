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
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-emerald-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            FoodRescue Support
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-950 sm:text-4xl">
            Trung tâm hỗ trợ FoodRescue
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            Nơi tổng hợp các điều khoản, chính sách và hướng dẫn hỗ trợ người mua, cửa hàng và các bên liên quan khi sử dụng FoodRescue.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {POLICY_HIGHLIGHTS.map((item) => (
              <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-gray-700">
            <p className="font-bold text-gray-950">Thông tin liên hệ chính thức</p>
            <p>Email: foodrescue888@gmail.com</p>
            <p>Website: https://foodrescue.store/</p>
            <p>
              Facebook: {" "}
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline">
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
