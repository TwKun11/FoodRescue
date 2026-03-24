# 📋 Hướng Dẫn Sử Dụng Tính Năng Đánh Giá Sản Phẩm

## 🎯 Tổng Quan

Tính năng đánh giá cho phép khách hàng chia sẻ trải nghiệm sau khi mua hàng. Chỉ những người đã **mua sản phẩm và thanh toán thành công** mới có thể đánh giá.

---

## 👥 Đối Với Khách Hàng (Người Mua)

### 1️⃣ **Đánh Giá Sản Phẩm**

#### Cách 1: Từ Trang "Đơn Hàng Của Tôi"
```
Các bước:
1. Vào "Đơn hàng của tôi" (menu người dùng)
2. Tìm đơn hàng có status "Hoàn thành"
3. Mỗi sản phẩm trong đơn sẽ có button "⭐ Đánh giá"
4. Bấm button → Tự động đưa tới trang chi tiết sản phẩm
5. Trang sẽ tự động scroll đến mục "Đánh giá"
```

#### Cách 2: Từ Trang Chi Tiết Sản Phẩm
```
Các bước:
1. Truy cập trang sản phẩm (ví dụ: /products/123)
2. Bấm tab "⭐ Đánh giá" (bên cạnh "Mô tả sản phẩm" và "Cách bảo quản")
3. Nếu bạn đã mua → Form đánh giá sẽ hiển thị
4. Điền thông tin → Gửi
```

### 2️⃣ **Điền Biểu Mẫu Đánh Giá**

#### A. **Chọn Mức Độ Hài Lòng** ⭐
```
- Hover chuột qua các ngôi sao để xem preview
- Bấm vào số sao muốn (1-5)
- Hiển thị: "Rất tệ", "Tệ", "Trung bình", "Tốt", "Rất tốt"
```

#### B. **Viết Bình Luận**
```
- Có thể bỏ trống nếu muốn
- Tối đa 1000 ký tự
- Hỗ trợ tiếng Việt, emoji
```

#### C. **Chèn Emoji**
```
- Dãy emoji nhanh: 😊🎉👍❤️😂😮😢🔥
- Bấm emoji → insert vào bình luận
- Có thể tự gõ emoji
```

#### D. **Tải Ảnh Lên**
```
- Bấm icon 📷 hoặc ảnh preview
- Chọn ảnh từ thiết bị (tối đa 3 ảnh)
- Dung lượng: tối đa 5MB mỗi ảnh
- Định dạng: JPG, PNG, WebP
- Preview: hiển thị trong form
- Xóa: hover → click ✕
```

#### E. **Gửi**
```
- Bấm "Gửi đánh giá"
- Chờ upload xong
- Toast thông báo "Cảm ơn bạn đã đánh giá!"
- Đánh giá ngay lập tức hiển thị ở danh sách
```

### 3️⃣ **Sửa Đánh Giá**

```
Các bước:
1. Tìm đánh giá của bạn (ở dưới form)
2. Bấm button "Sửa"
3. Form chỉnh sửa hiển thị đầy đủ dữ liệu cũ
4. Thay đổi sao, bình luận, ảnh
5. Bấm "Gửi đánh giá" → Lưu thay đổi
6. Bấm "Hủy" để thoát
```

### 4️⃣ **Xóa Đánh Giá**

```
Các bước:
1. Tìm đánh giá của bạn
2. Bấm button "Xóa"
3. Xác nhận "Xóa đánh giá này?"
4. Đánh giá bị xóa hoàn toàn
5. Bạn có thể đánh giá lại sản phẩm này
```

### 5️⃣ **Xem Đánh Giá Sản Phẩm**

#### Phần Tóm Tắt
```
📊 Hiển thị:
- Điểm trung bình (ví dụ: 4.5★)
- Tổng số đánh giá
- Phân bổ sao:
  ⭐⭐⭐⭐⭐ 45 người
  ⭐⭐⭐⭐ 32 người
  ⭐⭐⭐ 15 người
  ⭐⭐ 5 người
  ⭐ 3 người
```

#### Danh Sách Đánh Giá
```
Mỗi đánh giá hiển thị:
- Avatar người dùng (chữ cái đầu tên)
- Tên người đánh giá
- Ngày đánh giá
- Số sao
- Bình luận
- Ảnh (nếu có) - bấm để xem full screen
```

#### Phân Trang
```
- Mỗi trang 10 đánh giá
- Navigate: Nút "← Trước" và "Sau →"
- Hiển thị: "Trang X / Y"
```

---

## 👥 Đối Với Khách Quản Lý (Admin/Seller)

### Quản Lý Đánh Giá Sản Phẩm

```
Backend API có sẵn để kéo dữ liệu:

GET /api/reviews/product/{productId}
  - Lấy danh sách đánh giá (phân trang)
  - Query params: ?page=0&size=10

GET /api/reviews/product/{productId}/summary
  - Lấy thống kê: trung bình, phân bổ sao

GET /api/reviews/product/{productId}/my-review
  - Lấy đánh giá của user hiện tại

GET /api/reviews/product/{productId}/can-review
  - Check có thể review không
```

---

## 🚫 Ràng Buộc & Quy Tắc

| Quy Tắc | Chi Tiết |
|---------|----------|
| **Chỉ reviewer mới sửa/xóa** | Không thể sửa/xóa review của người khác |
| **1 review/sản phẩm/người** | Chỉ có thể review 1 lần mỗi sản phẩm |
| **Phải mua + thanh toán** | Chỉ đơn hàng status "Hoàn thành" mới được review |
| **Validation tự động** | Star bắt buộc, comment tối đa 1000 ký tự |
| **Ảnh có kiểm chứng** | Max 5MB, chỉ JPG/PNG/WebP, tối đa 3 ảnh |
| **Không thể xem trước khi gửi** | Chỉ gửi xong mới hiển thị |

---

## ✨ Tính Năng Nâng Cao

### Emoji Picker
```
8 emoji nhanh có sẵn:
😊 Vui vẻ
🎉 Ăn mừng
👍 Rất ổn
❤️ Yêu thích
😂 Cười lăn
😮 Ngạc nhiên
😢 Buồn
🔥 Tuyệt vời
```

### Image Gallery
```
- Hiển thị grid ảnh 4 cột
- Bấm ảnh → Full screen preview
- Multiple images per review
- Thumbnail preview
```

### Auto-Reload
```
- Sau khi gửi/sửa → Danh sách tự reload
- Không cần refresh trang
- Real-time update
```

---

## 🐛 Troubleshooting

| Vấn Đề | Giải Pháp |
|--------|----------|
| **Button "Đánh giá" không hiển thị** | Đơn hàng chưa status "Hoàn thành" |
| **Không upload được ảnh** | File quá 5MB hoặc định dạng sai |
| **Toast lỗi khi gửi** | Kiểm tra kết nối internet, thử lại |
| **Review không hiển thị** | Trang chưa reload, refresh F5 |
| **Không thể sửa review cũ** | Chỉ bạn mới có thể sửa của bạn |

---

## 📞 Hỗ Trợ

- Lỗi upload ảnh: Kiểm tra kích thước & định dạng
- Lỗi gửi review: Kiểm tra kết nối & điền đầy đủ
- Lỗi hiển thị: Thử refresh trang F5
- Lỗi khác: Liên hệ admin/support

---

## 📱 Responsive Design

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)
- ✅ Tất cả chức năng đều hoạt động trên mobile

---

**Cập nhật**: March 24, 2026
**Phiên bản**: 1.0.0
