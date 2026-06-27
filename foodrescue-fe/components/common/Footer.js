import Link from "next/link";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590746305008";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-sm text-gray-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="mb-2 text-lg font-bold text-white">Food Rescue</p>
          <p className="leading-relaxed">
            Kết nối người mua với cửa hàng có sản phẩm giảm giá/cuối ngày, ưu tiên thông tin rõ ràng và mua đúng nhu
            cầu.
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Người mua</p>
          <ul className="space-y-2">
            <li>
              <Link href="/#deals" className="transition hover:text-brand">
                Ưu đãi gần bạn
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="transition hover:text-brand">
                Cách hoạt động
              </Link>
            </li>
            <li>
              <Link href="/products" className="transition hover:text-brand">
                Tất cả sản phẩm
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Cửa hàng</p>
          <ul className="space-y-2">
            <li>
              <Link href="/#for-stores" className="transition hover:text-brand">
                Dành cho cửa hàng
              </Link>
            </li>
            <li>
              <Link href="/#interest-form" className="transition hover:text-brand">
                Đăng ký quan tâm
              </Link>
            </li>
            <li>
              <Link href="/store/login" className="transition hover:text-brand">
                Đăng nhập cửa hàng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Thông tin</p>
          <ul className="space-y-2">
            <li>
              <Link href="/#about-food-rescue" className="transition hover:text-brand">
                Về Food Rescue
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-brand">
                Trung tâm hỗ trợ FoodRescue
              </Link>
            </li>
            <li>Đang thử nghiệm tại trung tâm Đà Nẵng</li>
            <li>foodrescue888@gmail.com</li>
            <li>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="transition hover:text-brand">
                Fanpage Food Rescue
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs">© 2026 Food Rescue. All rights reserved.</div>
    </footer>
  );
}
