// FE02-002 – UI Trang Danh sách sản phẩm
"use client";
import { useState, useMemo } from "react";
import ProductCard from "@/components/customer/ProductCard";
import Badge from "@/components/common/Badge";

// ── Mock Data ─────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    image: "https://placehold.co/400x300/e8f5e9/2e7d32?text=Rau+Cải",
    originalPrice: 35000,
    discountPrice: 17500,
    discountPercent: 50,
    expiryLabel: "Còn 3 giờ",
    storeName: "Vinmart Q1",
    category: "rau",
    expiryHours: 3,
  },
  {
    id: "2",
    name: "Thịt heo ba chỉ 300g",
    image: "https://placehold.co/400x300/fce4ec/b71c1c?text=Thịt+Heo",
    originalPrice: 85000,
    discountPrice: 51000,
    discountPercent: 40,
    expiryLabel: "Còn 5 giờ",
    storeName: "Circle K",
    category: "thit",
    expiryHours: 5,
  },
  {
    id: "3",
    name: "Tôm sú tươi 200g",
    image: "https://placehold.co/400x300/e3f2fd/0d47a1?text=Tôm+Sú",
    originalPrice: 120000,
    discountPrice: 84000,
    discountPercent: 30,
    expiryLabel: "Còn 2 giờ",
    storeName: "Lotte Mart Q7",
    category: "haisan",
    expiryHours: 2,
  },
  {
    id: "4",
    name: "Bánh mì sandwich nguyên cám",
    image: "https://placehold.co/400x300/fff8e1/e65100?text=Bánh+Mì",
    originalPrice: 45000,
    discountPrice: 22500,
    discountPercent: 50,
    expiryLabel: "Còn 1 giờ",
    storeName: "BreadTalk",
    category: "banh",
    expiryHours: 1,
  },
  {
    id: "5",
    name: "Bắp cải tím 700g",
    image: "https://placehold.co/400x300/f3e5f5/4a148c?text=Bắp+Cải",
    originalPrice: 28000,
    discountPrice: 16800,
    discountPercent: 40,
    expiryLabel: "Còn 4 giờ",
    storeName: "Co.opmart",
    category: "rau",
    expiryHours: 4,
  },
  {
    id: "6",
    name: "Cá basa phi lê 400g",
    image: "https://placehold.co/400x300/e0f7fa/006064?text=Cá+Basa",
    originalPrice: 75000,
    discountPrice: 45000,
    discountPercent: 40,
    expiryLabel: "Còn 6 giờ",
    storeName: "Metro Q12",
    category: "haisan",
    expiryHours: 6,
  },
  {
    id: "7",
    name: "Dưa leo 1kg",
    image: "https://placehold.co/400x300/f1f8e9/33691e?text=Dưa+Leo",
    originalPrice: 20000,
    discountPrice: 10000,
    discountPercent: 50,
    expiryLabel: "Còn 2 giờ",
    storeName: "Emart",
    category: "rau",
    expiryHours: 2,
  },
  {
    id: "8",
    name: "Mực ống tươi 250g",
    image: "https://placehold.co/400x300/e8eaf6/1a237e?text=Mực+Ống",
    originalPrice: 95000,
    discountPrice: 66500,
    discountPercent: 30,
    expiryLabel: "Còn 3 giờ",
    storeName: "Aeon",
    category: "haisan",
    expiryHours: 3,
  },
  {
    id: "9",
    name: "Sườn heo non 400g",
    image: "https://placehold.co/400x300/ffebee/c62828?text=Sườn+Heo",
    originalPrice: 110000,
    discountPrice: 55000,
    discountPercent: 50,
    expiryLabel: "Còn 4 giờ",
    storeName: "Vinmart Q3",
    category: "thit",
    expiryHours: 4,
  },
  {
    id: "10",
    name: "Bánh croissant bơ 4 cái",
    image: "https://placehold.co/400x300/fff3e0/e65100?text=Croissant",
    originalPrice: 60000,
    discountPrice: 36000,
    discountPercent: 40,
    expiryLabel: "Còn 2 giờ",
    storeName: "Paris Baguette",
    category: "banh",
    expiryHours: 2,
  },
  {
    id: "11",
    name: "Cua biển tươi 500g",
    image: "https://placehold.co/400x300/e3f2fd/0277bd?text=Cua+Biển",
    originalPrice: 200000,
    discountPrice: 100000,
    discountPercent: 50,
    expiryLabel: "Còn 5 giờ",
    storeName: "Seafood Market",
    category: "haisan",
    expiryHours: 5,
  },
  {
    id: "12",
    name: "Cà chua bi 300g",
    image: "https://placehold.co/400x300/ffebee/b71c1c?text=Cà+Chua",
    originalPrice: 18000,
    discountPrice: 9000,
    discountPercent: 50,
    expiryLabel: "Còn 6 giờ",
    storeName: "GreenMart",
    category: "rau",
    expiryHours: 6,
  },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "rau", label: "🥬 Rau củ" },
  { value: "thit", label: "🥩 Thịt" },
  { value: "haisan", label: "🦐 Hải sản" },
  { value: "banh", label: "🥐 Bánh" },
];

const SORT_OPTIONS = [
  { value: "discount_desc", label: "Giảm giá: cao → thấp" },
  { value: "price_asc", label: "Giá: thấp → cao" },
  { value: "price_desc", label: "Giá: cao → thấp" },
  { value: "expiry_asc", label: "HSD: sắp hết trước" },
];

export default function ProductsPage() {
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("discount_desc");
  const [priceRange, setPriceRange] = useState([0, 250000]);
  const [discountMin, setDiscountMin] = useState(0);

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];

    if (category) list = list.filter((p) => p.category === category);
    list = list.filter((p) => p.discountPrice >= priceRange[0] && p.discountPrice <= priceRange[1]);
    list = list.filter((p) => p.discountPercent >= discountMin);

    switch (sort) {
      case "discount_desc":
        list.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case "price_asc":
        list.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case "price_desc":
        list.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case "expiry_asc":
        list.sort((a, b) => a.expiryHours - b.expiryHours);
        break;
    }
    return list;
  }, [category, sort, priceRange, discountMin]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛍️ Danh sách sản phẩm</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar Filters ── */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">📂 Loại hàng</h3>
            <div className="space-y-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    category === opt.value
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">🏷️ % Giảm giá (tối thiểu)</h3>
            <div className="space-y-2">
              {[0, 30, 40, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => setDiscountMin(v)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    discountMin === v ? "bg-orange-100 text-orange-600 font-semibold" : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {v === 0 ? "Tất cả" : `≥ ${v}%`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">💰 Khoảng giá</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Giá tối đa: {priceRange[1].toLocaleString("vi-VN")}đ</label>
                <input
                  type="range"
                  min={0}
                  max={250000}
                  step={10000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-orange-500"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0đ</span>
                <span>250,000đ</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1">
          {/* Sort + Count */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm text-gray-500">
              {filtered.length} sản phẩm
              {category && (
                <Badge variant="category" className="ml-2">
                  {CATEGORY_OPTIONS.find((c) => c.value === category)?.label}
                </Badge>
              )}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-3">🔍</p>
              <p>Không tìm thấy sản phẩm phù hợp</p>
              <button
                onClick={() => {
                  setCategory("");
                  setDiscountMin(0);
                  setPriceRange([0, 250000]);
                }}
                className="mt-3 text-orange-500 text-sm hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
