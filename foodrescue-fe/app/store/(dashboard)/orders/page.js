// FE03-004 – UI Quản lý đơn hàng
"use client";
import { useState } from "react";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "preparing", label: "Chuẩn bị hàng", count: 6 },
  { id: "packing", label: "Đang đóng gói" },
  { id: "waiting", label: "Chờ lấy hàng" },
  { id: "shipped", label: "Đã giao đơn vị vận chuyển", tip: true },
  { id: "outofstock", label: "Hết hàng" },
  { id: "cancelling", label: "Đang hủy" },
];

const MOCK_ORDERS = [
  {
    group: "Facebook / Shop Facebook",
    channelId: "ID Kênh Quản Lý: 1315241051373576",
    orderId: "ID đơn hàng: –",
    items: [
      {
        id: "1",
        image: "/images/products/banhmi.jpg",
        name: "Miss Dior Perfume - NH101",
        variant: "Full Size",
        type: "Thực tế",
        qty: 1,
        revenue: 189998,
        status: "Đã giao đơn vị vận chuyển",
        subStatus: "Giao không thà...",
        carrier: "–",
        createdAt: "29/11/2021\n01:42",
        deliveryDate: "–",
      },
      {
        id: "2",
        image: null,
        name: "hahaha 2021-10-19 14:39:05.758 Oct 25 ...",
        variant: "",
        type: "",
        qty: 1,
        revenue: null,
        status: "",
        subStatus: "",
        carrier: "",
        createdAt: "",
        deliveryDate: "",
      },
    ],
  },
];

export default function StoreOrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="p-6 space-y-4 text-sm text-gray-700">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <div className="flex items-center gap-3">
          <span className="text-green-600 cursor-pointer hover:underline">Không tìm thấy đơn hàng?</span>
          <button className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-gray-700 hover:bg-gray-50">
            <span className="text-base">+</span> Thêm đơn hàng
          </button>
          <button className="flex items-center gap-1.5 bg-red-500 text-white rounded px-3 py-1.5 hover:bg-red-600">
            <span>📋</span> Chuẩn bị đơn hàng loạt
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 whitespace-nowrap font-medium border-b-2 transition flex items-center gap-1 ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-1 bg-gray-200 text-gray-600 text-xs rounded px-1.5 py-0.5">{tab.count}</span>
              )}
              {tab.tip && <span className="text-gray-400 text-xs">?</span>}
            </button>
          ))}
          <button className="px-3 py-2.5 text-gray-400 hover:text-gray-600 ml-auto">···</button>
        </div>

        {/* ── Filters ── */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Row 1 */}
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>ID đơn hàng</option>
              </select>
              <div className="flex-1 relative">
                <input placeholder="Nhập" className="w-full px-3 py-2 outline-none text-sm" />
                <span className="absolute right-2 top-2 text-gray-400">🔍</span>
              </div>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>Tên sản phẩm đã...</option>
              </select>
              <div className="flex-1 relative">
                <input placeholder="Nhập" className="w-full px-3 py-2 outline-none text-sm" />
                <span className="absolute right-2 top-2 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>Tên Shop</option>
              </select>
              <select className="flex-1 px-3 py-2 outline-none text-sm text-gray-400">
                <option value="">Chọn</option>
              </select>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="px-3 py-2 text-gray-700 border-r border-gray-300 whitespace-nowrap">Ngày tạo đơn 📅</span>
              <input type="text" placeholder="Ngày bắt đầu" className="flex-1 px-3 py-2 outline-none text-sm text-gray-400" />
              <span className="px-2 text-gray-400">–</span>
              <input type="text" placeholder="Ngày kết thúc" className="flex-1 px-3 py-2 outline-none text-sm text-gray-400" />
            </div>

            {/* Row 3 */}
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>Đơn vị vận chuyển</option>
              </select>
              <select className="flex-1 px-3 py-2 outline-none text-sm text-gray-400">
                <option value="">Chọn</option>
              </select>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="px-3 py-2 text-gray-700 border-r border-gray-300 whitespace-nowrap">Phương thức thanh toán</span>
              <select className="flex-1 px-3 py-2 outline-none text-sm text-gray-400">
                <option value="">Chọn</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-gray-300 rounded overflow-hidden w-64">
              <span className="px-3 py-2 text-gray-700 border-r border-gray-300 whitespace-nowrap">Chưa được in</span>
              <select className="flex-1 px-3 py-2 outline-none text-sm text-gray-400">
                <option value="">Chọn</option>
              </select>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-green-600 hover:underline flex items-center gap-1"
            >
              Thu gọn <span>▲</span>
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-200 bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3 font-medium">
                  <span className="flex items-center gap-1">Sản phẩm <span className="text-xs">▾</span></span>
                </th>
                <th className="text-left px-4 py-3 font-medium">Doanh thu<br />đơn hàng</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Đơn vị vận<br />chuyển</th>
                <th className="text-left px-4 py-3 font-medium">
                  <span className="flex items-center gap-1">Thời gian<br />tạo <span className="text-xs text-gray-400">❓</span></span>
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  <span className="flex items-center gap-1">Ngày<br />giao<br />hàng <span className="text-xs text-gray-400">❓</span> <span className="text-xs">▾</span></span>
                </th>
                <th className="text-left px-4 py-3 font-medium">Thao<br />tác</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map((group, gi) => (
                <>
                  {/* Group row */}
                  <tr key={`g-${gi}`} className="bg-gray-50 border-t border-gray-200">
                    <td colSpan={7} className="px-4 py-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-300 inline-block"></span>
                          <span className="font-medium text-gray-700">{group.group}</span>
                        </span>
                        <span>
                          {group.channelId} &nbsp;&nbsp; {group.orderId}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Item rows */}
                  {group.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border border-gray-200" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800 text-xs leading-snug">{item.name}</p>
                            {item.variant && <p className="text-gray-500 text-xs">{item.variant}</p>}
                            {item.type && (
                              <p className="text-gray-400 text-xs">
                                {item.type}
                                <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">x{item.qty}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {item.revenue ? `đ ${item.revenue.toLocaleString("vi-VN")}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        {item.status && (
                          <div>
                            <p className="text-gray-700">{item.status}</p>
                            {item.subStatus && (
                              <p className="text-orange-500 text-xs mt-0.5">{item.subStatus}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.carrier || ""}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-pre-line text-xs">{item.createdAt}</td>
                      <td className="px-4 py-3 text-gray-500">{item.deliveryDate}</td>
                      <td className="px-4 py-3">
                        {item.status && (
                          <span className="text-green-600 font-semibold cursor-pointer hover:underline">Xem<br />thêm</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Bottom Filters (repeat) ── */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>ID đơn hàng</option>
              </select>
              <div className="flex-1 relative">
                <input placeholder="Nhập" className="w-full px-3 py-2 outline-none text-sm" />
                <span className="absolute right-2 top-2 text-gray-400">🔍</span>
              </div>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>Tên sản phẩm đã...</option>
              </select>
              <div className="flex-1 relative">
                <input placeholder="Nhập" className="w-full px-3 py-2 outline-none text-sm" />
                <span className="absolute right-2 top-2 text-gray-400">🔍</span>
              </div>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <select className="bg-white px-3 py-2 text-gray-700 border-r border-gray-300 outline-none text-sm">
                <option>Tên Shop</option>
              </select>
              <select className="flex-1 px-3 py-2 outline-none text-sm text-gray-400">
                <option value="">Chọn</option>
              </select>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="px-3 py-2 text-gray-700 border-r border-gray-300 whitespace-nowrap">Ngày tạo đơn 📅</span>
              <input type="text" placeholder="Ngày bắt đầu" className="flex-1 px-3 py-2 outline-none text-sm text-gray-400" />
              <span className="px-2 text-gray-400">–</span>
              <input type="text" placeholder="Ngày kết thúc" className="flex-1 px-3 py-2 outline-none text-sm text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
