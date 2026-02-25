import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <p className="text-white text-lg font-bold mb-2">🍃 FoodRescue</p>
          <p className="leading-relaxed">Giải cứu thực phẩm cuối ngày — giảm lãng phí, tiết kiệm chi phí.</p>
        </div>

        {/* Links */}
        <div>
          <p className="text-white font-semibold mb-3">Mua sắm</p>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="hover:text-orange-400 transition">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/products?category=rau" className="hover:text-orange-400 transition">
                Rau củ
              </Link>
            </li>
            <li>
              <Link href="/products?category=thit" className="hover:text-orange-400 transition">
                Thịt tươi
              </Link>
            </li>
            <li>
              <Link href="/products?category=haisan" className="hover:text-orange-400 transition">
                Hải sản
              </Link>
            </li>
            <li>
              <Link href="/products?category=banh" className="hover:text-orange-400 transition">
                Bánh
              </Link>
            </li>
          </ul>
        </div>

        {/* Store */}
        <div>
          <p className="text-white font-semibold mb-3">Cửa hàng</p>
          <ul className="space-y-2">
            <li>
              <Link href="/store/login" className="hover:text-orange-400 transition">
                Đăng ký / Đăng nhập
              </Link>
            </li>
            <li>
              <Link href="/store" className="hover:text-orange-400 transition">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/store/products" className="hover:text-orange-400 transition">
                Quản lý sản phẩm
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-white font-semibold mb-3">Liên hệ</p>
          <ul className="space-y-2">
            <li>📧 support@foodrescue.vn</li>
            <li>📞 1800 9999</li>
            <li>🕐 8:00 – 22:00 hàng ngày</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">© 2025 FoodRescue. All rights reserved.</div>
    </footer>
  );
}
