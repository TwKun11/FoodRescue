-- ============================================================
-- Migration: SPU/SKU → Product/ProductVariant rename
-- Chạy script này một lần trên database fresh_marketplace
-- TRƯỚC KHI khởi động lại backend sau khi đổi tên code.
-- ============================================================

-- 1. Đổi tên bảng chính
RENAME TABLE products_spu TO products;
RENAME TABLE products_sku TO product_variants;

-- 2. Đổi tên cột trong bảng products (cũ: products_spu)
ALTER TABLE products
    RENAME COLUMN spu_code TO product_code,
    CHANGE COLUMN `status` `status` ENUM('draft','pending_approval','active','inactive','rejected') NOT NULL DEFAULT 'draft';

-- 3. Đổi tên cột trong bảng product_variants (cũ: products_sku)
ALTER TABLE product_variants
    RENAME COLUMN spu_id TO product_id,
    RENAME COLUMN sku_code TO variant_code,
    CHANGE COLUMN `status` `status` ENUM('draft','active','inactive','out_of_stock') NOT NULL DEFAULT 'draft',
    CHANGE COLUMN unit unit ENUM('g','kg','piece','pack','bag','bundle','loaf','box','tray','bottle') NOT NULL;

-- 4. Đổi tên cột trong bảng order_items
ALTER TABLE order_items
    RENAME COLUMN spu_id TO product_id,
    RENAME COLUMN sku_id TO variant_id,
    RENAME COLUMN spu_name TO product_name,
    RENAME COLUMN sku_name TO variant_name,
    RENAME COLUMN sku_code TO variant_code;

-- 5. Đổi tên cột trong bảng product_images
ALTER TABLE product_images
    RENAME COLUMN spu_id TO product_id;

-- 6. Đổi tên cột trong bảng inventory_batches
ALTER TABLE inventory_batches
    RENAME COLUMN sku_id TO variant_id;

-- 7. Xóa cột placed_at dư thừa trong bảng orders (đã có created_at)
ALTER TABLE orders DROP COLUMN placed_at;

-- ============================================================
-- Migration: Gộp customers → users (design cleanup)
-- Chỉ cần nếu database CŨ đã có bảng customers.
-- Database mới (Hibernate ddl-auto: create/update): BỎ QUA phần này.
-- ============================================================

-- 8. Thay cột customer_id → user_id trong bảng orders
ALTER TABLE orders
    DROP FOREIGN KEY fk_orders_customer,
    CHANGE COLUMN customer_id user_id BIGINT,
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 9. Thay cột customer_id → user_id trong bảng customer_addresses
ALTER TABLE customer_addresses
    DROP FOREIGN KEY fk_addresses_customer,
    CHANGE COLUMN customer_id user_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 10. Thêm cột user_id vào bảng sellers
ALTER TABLE sellers
    ADD COLUMN user_id BIGINT UNIQUE,
    ADD CONSTRAINT fk_sellers_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 11. Xóa bảng customers (không còn dùng)
DROP TABLE IF EXISTS customers;

-- ============================================================
-- Nếu database CHƯA có dữ liệu (môi trường dev mới):
-- Bỏ qua toàn bộ script này và đặt ddl-auto: create-drop hoặc create
-- để Hibernate tự tạo lại toàn bộ schema.
-- ============================================================
