# Seller Wallet & Payout Implementation

## Mục tiêu

FoodRescue dùng mô hình marketplace escrow/internal balance:

1. Khách thanh toán PayOS vào kênh thanh toán của hệ thống.
2. Webhook PayOS xác nhận đơn đã thanh toán.
3. Backend ghi nhận tiền phải trả cho từng seller vào `seller_wallet_transactions`.
4. Seller xem số dư, lịch sử ví và tài khoản ngân hàng nhận tiền ở `/store/wallet`.
5. Payout sang ngân hàng seller là một bước riêng, chạy async hoặc qua duyệt admin.

## Flow demo hiện tại

Flow demo đã được implement để phục vụ trình bày sản phẩm mà không gọi ngân hàng thật.

### Seller onboarding

Seller đăng ký/cập nhật các trường ngân hàng:

- `bankName`
- `bankAccountName`
- `bankAccountNumber`

Các trường này đang nằm trong bảng `sellers` và được dùng làm thông tin nhận chi trả.

### Ghi nhận ví seller

Khi PayOS payment chuyển sang `paid`, `OrderServiceImpl.markPaymentPaid()` gọi `creditSellerWallets()`.

Mỗi `OrderSellerOrder` tạo một transaction:

- `type = order_payment`
- `status = available`
- `amount = sellerOrder.totalAmount - commissionAmount`
- `grossAmount = sellerOrder.totalAmount`
- `commissionAmount = grossAmount * seller.commissionRate / 100`

Có unique constraint `(seller_order_id, type)` để webhook/reconcile chạy lại không credit trùng.

### Payout demo

Endpoint demo:

`POST /api/seller/wallet/payouts/simulate`

Backend kiểm tra seller đã có đủ bank info. Nếu có số dư khả dụng, hệ thống tạo transaction:

- `type = payout_debit`
- `status = paid_out`
- `amount = -availableBalance`
- `grossAmount = availableBalance`
- `description = Demo payout to {bankName}`
- `referenceCode = SIM-{timestamp}`

Sau khi tạo transaction âm, số dư khả dụng giảm về 0 và lịch sử ví hiển thị payout demo như một giao dịch đã chi.

## Cách tính số dư

`availableBalance` hiện được tính bằng:

`order_payment available + payout_debit paid_out/payout_processing`

Vì payout debit là số âm, số dư sẽ giảm sau khi tạo payout.

Các tổng khác:

- `totalCredited`: tổng transaction `order_payment`.
- `totalPaidOut`: tổng trị tuyệt đối của `payout_debit` có status `paid_out`.
- `payoutProcessingBalance`: trị tuyệt đối của `payout_debit` có status `payout_processing`.

## Cách triển khai payout thật

Để thay demo bằng payout thật, giữ nguyên UI và ledger, chỉ thay endpoint xử lý payout.

### 1. Chọn provider chi trả

Nếu dùng PayOS Chi, cần cấu hình kênh chi/payout provider cho tài khoản hệ thống. Nếu dùng provider khác, cần API tạo lệnh chuyển tiền và API/webhook tra cứu trạng thái.

Cần thêm env/config riêng, ví dụ:

```env
PAYOUT_PROVIDER=payos
PAYOUT_CLIENT_ID=...
PAYOUT_API_KEY=...
PAYOUT_CHECKSUM_KEY=...
PAYOUT_WEBHOOK_SECRET=...
PAYOUT_MIN_AMOUNT=50000
PAYOUT_MODE=manual_approval
```

Không dùng lại payment credentials nếu provider yêu cầu key khác cho kênh chi.

### 2. Bổ sung thông tin ngân hàng chuẩn hóa

Hiện seller chỉ lưu `bankName`. Payout thật thường cần bank code/bin ổn định, không nên dựa vào tên ngân hàng text tự do.

Nên mở rộng seller bank fields:

- `bankCode` hoặc `bankBin`
- `bankName`
- `bankAccountNumber`
- `bankAccountName`
- `bankVerifiedAt`
- `bankVerificationStatus`

Ở onboarding seller, UI nên dùng dropdown ngân hàng từ danh sách chuẩn thay vì input tự do.

### 3. Tạo trạng thái payout thật

Khi seller yêu cầu chi trả:

1. Lock hoặc transaction DB.
2. Tính available balance.
3. Tạo `payout_debit` âm với `status = payout_processing`.
4. Gọi provider tạo lệnh chi.
5. Lưu provider reference/order id vào `referenceCode` hoặc thêm field riêng.
6. Trả response cho seller: payout đang xử lý.

Không nên đánh dấu `paid_out` ngay sau khi API provider trả về `PROCESSING`.

### 4. Reconcile/webhook payout

Cần một trong hai cơ chế:

- Webhook từ provider báo payout `SUCCEEDED` / `FAILED`.
- Scheduler polling API provider để cập nhật trạng thái.

Mapping trạng thái đề xuất:

- Provider `PROCESSING` -> `payout_processing`
- Provider `SUCCEEDED` -> `paid_out`
- Provider `FAILED` -> `failed`
- Provider `CANCELLED` -> `cancelled`

Nếu payout thất bại, cần hoàn tiền về balance. Có hai hướng:

- Đổi `payout_debit` sang `failed` và không tính vào available balance.
- Hoặc tạo transaction `adjustment` dương để hoàn số dư.

Cách đầu đơn giản hơn nếu query balance loại trừ failed/cancelled payout.

### 5. Quy tắc nghiệp vụ cần quyết định

Trước khi bật tiền thật, cần chốt:

- Seller được rút ngay khi buyer paid hay chỉ khi order completed?
- Có min payout amount không?
- Payout tự động hay seller request?
- Có admin approval trước khi chi không?
- Chi theo từng seller order, theo ngày, hay seller bấm rút toàn bộ?
- Phí chuyển khoản ai chịu?
- Commission/platform fee tính lúc credit hay lúc payout?
- Nếu order refund sau khi đã payout thì xử lý clawback thế nào?

Khuyến nghị production:

- Demo/MVP: seller request payout, admin approve, payout manual hoặc provider API.
- Khi ổn định: auto payout theo lịch hằng ngày, chỉ payout các đơn đã completed hoặc hết thời gian khiếu nại.

## Files liên quan

Backend:

- `SellerWalletTransaction.java`
- `SellerWalletTransactionRepository.java`
- `SellerWalletResponse.java`
- `OrderServiceImpl.creditSellerWallets()`
- `SellerController.getWallet()`
- `SellerController.simulatePayout()`

Frontend:

- `/store/wallet`
- `apiGetSellerWallet()`
- `apiSimulateSellerPayout()`
- Sidebar link `Vi & chi tra`

Migration:

- `migration-seller-wallet.sql`

## Lưu ý demo

Payout demo không chuyển tiền thật. Nó chỉ ghi một transaction âm vào ledger để mô phỏng số dư giảm và lịch sử chi trả hoàn tất. Đây là cách an toàn để demo end-to-end mà không phụ thuộc ngân hàng, PayOS Chi, hạn mức, số dư ví chi hoặc trạng thái NAPAS.
