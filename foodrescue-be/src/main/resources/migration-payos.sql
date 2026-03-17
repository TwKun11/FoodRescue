-- ============================================================
-- PayOS + payment-reservation migration for existing databases
-- Apply this script before starting production with
-- HIBERNATE_DDL_AUTO=validate.
-- ============================================================

ALTER TABLE orders
    ADD COLUMN paid_at DATETIME NULL AFTER cancelled_at;

CREATE TABLE order_payments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    provider_order_code BIGINT NOT NULL,
    provider_payment_link_id VARCHAR(100) NULL,
    checkout_url VARCHAR(1000) NULL,
    deep_link VARCHAR(1000) NULL,
    qr_code LONGTEXT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    description VARCHAR(255) NULL,
    provider_reference VARCHAR(255) NULL,
    failure_reason VARCHAR(500) NULL,
    expires_at DATETIME NULL,
    paid_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    last_webhook_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_order_payments_order_id UNIQUE (order_id),
    CONSTRAINT uk_order_payments_provider_order_code UNIQUE (provider_order_code),
    CONSTRAINT fk_order_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE inventory_reservations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    batch_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    released_at DATETIME NULL,
    consumed_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_inventory_reservations_batch FOREIGN KEY (batch_id) REFERENCES inventory_batches(id),
    CONSTRAINT fk_inventory_reservations_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

-- If your database uses native ENUM columns instead of VARCHAR for the
-- status fields below, widen them manually before starting the app:
--
-- ALTER TABLE orders MODIFY COLUMN order_status
--   ENUM('pending_payment','pending','confirmed','packing','shipping','completed','cancelled','refunded') NOT NULL;
-- ALTER TABLE orders MODIFY COLUMN payment_status
--   ENUM('unpaid','pending','paid','cancelled','expired','failed','partially_paid','refunded') NOT NULL;
-- ALTER TABLE orders MODIFY COLUMN payment_method
--   ENUM('cod','payos','bank_transfer','momo','zalopay','vnpay','card') NOT NULL;
-- ALTER TABLE order_seller_orders MODIFY COLUMN order_status
--   ENUM('pending_payment','pending','confirmed','packing','shipping','completed','cancelled','refunded') NOT NULL;
