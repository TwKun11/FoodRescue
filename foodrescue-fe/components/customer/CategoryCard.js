import Link from "next/link";

const CATEGORY_ICONS = {
  rau: "🥬",
  thit: "🥩",
  haisan: "🦐",
  banh: "🥐",
  trai_cay: "🍎",
  do_uong: "🧃",
};

/**
 * CategoryCard - Thẻ danh mục sản phẩm trên trang chủ
 * @param {object} props - { slug, label, count }
 */
export default function CategoryCard({ slug, label, count }) {
  const icon = CATEGORY_ICONS[slug] ?? "🍽️";

  return (
    <Link
      href={`/products?category=${slug}`}
      className="flex flex-col items-center gap-2 bg-white border border-brand/30 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-brand-secondary/50 hover:-translate-y-0.5 transition group"
    >
      <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {count !== undefined && <p className="text-xs text-gray-400">{count} sản phẩm</p>}
    </Link>
  );
}
