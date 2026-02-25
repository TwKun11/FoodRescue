// FE03-003 – UI Quản lý sản phẩm
"use client";
import { useState } from "react";
import ProductForm from "@/components/store/ProductForm";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";

// ── Mock Data ─────────────────────────────────────────────────────────────
const INIT_PRODUCTS = [
  {
    id: "1",
    name: "Rau cải xanh hữu cơ 500g",
    category: "Rau củ",
    originalPrice: 35000,
    discountPercent: 50,
    discountPrice: 17500,
    quantity: 15,
    expiryDate: "2025-02-24",
    image: "https://placehold.co/80x80/e8f5e9/2e7d32?text=Rau",
  },
  {
    id: "2",
    name: "Thịt heo ba chỉ 300g",
    category: "Thịt tươi",
    originalPrice: 85000,
    discountPercent: 40,
    discountPrice: 51000,
    quantity: 8,
    expiryDate: "2025-02-24",
    image: "https://placehold.co/80x80/fce4ec/b71c1c?text=Thịt",
  },
  {
    id: "3",
    name: "Bánh mì sandwich nguyên cám",
    category: "Bánh",
    originalPrice: 45000,
    discountPercent: 50,
    discountPrice: 22500,
    quantity: 20,
    expiryDate: "2025-02-24",
    image: "https://placehold.co/80x80/fff8e1/e65100?text=Bánh",
  },
];

export default function StoreProductsPage() {
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (data) => {
    const newProduct = {
      id: Date.now().toString(),
      ...data,
      discountPrice: Math.round(data.originalPrice * (1 - data.discountPercent / 100)),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setShowForm(false);
  };

  const handleEdit = (data) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...data, discountPrice: Math.round(data.originalPrice * (1 - data.discountPercent / 100)) }
          : p,
      ),
    );
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🛍️ Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} sản phẩm đang bán</p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
          ➕ Thêm sản phẩm
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editingProduct ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm giảm giá cuối ngày"}
          </h2>
          <ProductForm
            initialData={editingProduct}
            onSubmit={editingProduct ? handleEdit : handleAdd}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🛍️</p>
            <p>Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">Danh mục</th>
                  <th className="px-4 py-3 text-left">Giá gốc</th>
                  <th className="px-4 py-3 text-left">Giá bán</th>
                  <th className="px-4 py-3 text-left">% Giảm</th>
                  <th className="px-4 py-3 text-left">Tồn kho</th>
                  <th className="px-4 py-3 text-left">HSD</th>
                  <th className="px-4 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={product.image || "https://placehold.co/40x40/gray/white?text=?"}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-800 max-w-[160px] truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="category">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 line-through">
                      {Number(product.originalPrice).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3 font-semibold text-orange-600">
                      {product.discountPrice.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="discount">-{product.discountPercent}%</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.quantity <= 5 ? "text-red-500" : "text-gray-700"}`}>
                        {product.quantity}
                        {product.quantity <= 5 && <span className="text-xs ml-1">⚠️</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{product.expiryDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(product)}>
                          ✏️ Sửa
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(product.id)}>
                          🗑
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-lg font-bold text-gray-800 mb-2">🗑️ Xóa sản phẩm?</p>
            <p className="text-sm text-gray-500 mb-5">
              Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi danh sách.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setDeleteId(null)} fullWidth>
                Hủy
              </Button>
              <Button variant="danger" onClick={() => handleDelete(deleteId)} fullWidth>
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
