USE foodrescue;

-- Extra demo products for waste analytics (idempotent by product_code/variant_code/batch_code)
INSERT INTO products (
  created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province,
  product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type,
  updated_at, brand_id, category_id, seller_id
)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Ca rot huu co', 'Viet Nam', 'Da Lat',
       'WASTE-PROD-001', 'vegetable', 'by_weight', 5, 'Rau cu tuoi', 'waste-prod-001', 'active', 'ambient',
       NOW(), 9, 10, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-001');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Ca chua bi', 'Viet Nam', 'Da Lat', 'WASTE-PROD-002', 'vegetable', 'by_weight', 4, 'Rau cu tuoi', 'waste-prod-002', 'active', 'ambient', NOW(), 9, 10, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-002');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Khoai tay', 'Viet Nam', 'Lam Dong', 'WASTE-PROD-003', 'vegetable', 'by_weight', 7, 'Rau cu tuoi', 'waste-prod-003', 'active', 'ambient', NOW(), 9, 10, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-003');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Sua tuoi 1L', 'Viet Nam', 'TP.HCM', 'WASTE-PROD-004', 'beverage', 'by_unit', 10, 'Do uong', 'waste-prod-004', 'active', 'chilled', NOW(), 11, 2, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-004');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Sua chua hop', 'Viet Nam', 'TP.HCM', 'WASTE-PROD-005', 'ready_to_eat', 'by_unit', 8, 'Do an san', 'waste-prod-005', 'active', 'chilled', NOW(), 11, 11, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-005');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Banh mi nguyen cam', 'Viet Nam', 'TP.HCM', 'WASTE-PROD-006', 'bread', 'by_unit', 3, 'Banh mi', 'waste-prod-006', 'active', 'ambient', NOW(), 8, 4, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-006');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Dua hau mini', 'Viet Nam', 'Long An', 'WASTE-PROD-007', 'fruit', 'by_weight', 6, 'Trai cay', 'waste-prod-007', 'active', 'ambient', NOW(), 9, 12, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-007');

INSERT INTO products (created_at, description, is_active, min_preparation_minutes, name, origin_country, origin_province, product_code, product_type, sell_mode, shelf_life_days, short_description, slug, status, storage_type, updated_at, brand_id, category_id, seller_id)
SELECT NOW(), 'Demo waste analytics product', b'1', 0, 'Cam sanh', 'Viet Nam', 'Ben Tre', 'WASTE-PROD-008', 'fruit', 'by_weight', 7, 'Trai cay', 'waste-prod-008', 'active', 'ambient', NOW(), 9, 12, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'WASTE-PROD-008');

INSERT INTO product_variants (
  barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name,
  net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit,
  updated_at, variant_code, product_id
)
SELECT NULL, 12000, NOW(), b'1', 26000, 200, 1, 'Quy cach chuan', 'kg', 1.000, b'1', 22000, 'active', 1.000, b'1', 'kg', NOW(), 'WASTE-VAR-001', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-001'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-001');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 10000, NOW(), b'1', 24000, 200, 1, 'Quy cach chuan', 'kg', 1.000, b'1', 20000, 'active', 1.000, b'1', 'kg', NOW(), 'WASTE-VAR-002', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-002'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-002');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 9000, NOW(), b'1', 21000, 200, 1, 'Quy cach chuan', 'kg', 1.000, b'1', 18000, 'active', 1.000, b'1', 'kg', NOW(), 'WASTE-VAR-003', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-003'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-003');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 18000, NOW(), b'1', 32000, 300, 1, 'Hop 1L', NULL, NULL, b'1', 29000, 'active', 1.000, b'1', 'piece', NOW(), 'WASTE-VAR-004', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-004'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-004');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 12000, NOW(), b'1', 24000, 250, 1, 'Hop 4 ly', NULL, NULL, b'1', 21000, 'active', 1.000, b'1', 'piece', NOW(), 'WASTE-VAR-005', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-005'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-005');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 6000, NOW(), b'1', 13000, 500, 1, 'Tui 1 chiec', NULL, NULL, b'1', 11000, 'active', 1.000, b'1', 'piece', NOW(), 'WASTE-VAR-006', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-006'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-006');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 13000, NOW(), b'1', 28000, 200, 1, 'Quy cach chuan', 'kg', 1.000, b'1', 25000, 'active', 1.000, b'1', 'kg', NOW(), 'WASTE-VAR-007', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-007'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-007');

INSERT INTO product_variants (barcode, cost_price, created_at, is_default, list_price, max_order_qty, min_order_qty, name, net_weight_unit, net_weight_value, requires_batch, sale_price, status, step_qty, track_inventory, unit, updated_at, variant_code, product_id)
SELECT NULL, 14000, NOW(), b'1', 30000, 200, 1, 'Quy cach chuan', 'kg', 1.000, b'1', 27000, 'active', 1.000, b'1', 'kg', NOW(), 'WASTE-VAR-008', p.id
FROM products p WHERE p.product_code = 'WASTE-PROD-008'
AND NOT EXISTS (SELECT 1 FROM product_variants WHERE variant_code = 'WASTE-VAR-008');

INSERT INTO inventory_batches (
  batch_code, cost_price, created_at, expired_at, manufactured_at, note,
  quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id
)
SELECT 'WASTE-BATCH-001', 12000, NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Demo warning data', 48, 60, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-001'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-001');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-002', 10000, NOW(), DATE_ADD(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Demo warning data', 62, 72, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-002'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-002');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-003', 9000, NOW(), DATE_ADD(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY), 'Demo warning data', 55, 68, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-003'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-003');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-004', 18000, NOW(), DATE_ADD(NOW(), INTERVAL 22 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY), 'Demo warning data', 45, 55, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-004'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-004');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-005', 12000, NOW(), DATE_ADD(NOW(), INTERVAL 28 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY), 'Demo warning data', 72, 92, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-005'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-005');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-006', 6000, NOW(), DATE_ADD(NOW(), INTERVAL 35 HOUR), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Demo warning data', 120, 150, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-006'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-006');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-007', 13000, NOW(), DATE_ADD(NOW(), INTERVAL 43 HOUR), DATE_SUB(NOW(), INTERVAL 4 DAY), 'Demo warning data', 39, 50, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-007'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-007');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-008', 14000, NOW(), DATE_ADD(NOW(), INTERVAL 52 HOUR), DATE_SUB(NOW(), INTERVAL 4 DAY), 'Demo warning data', 58, 70, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-008'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-008');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-009', 13000, NOW(), DATE_ADD(NOW(), INTERVAL 61 HOUR), DATE_SUB(NOW(), INTERVAL 4 DAY), 'Demo warning data', 30, 45, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-001'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-009');

INSERT INTO inventory_batches (batch_code, cost_price, created_at, expired_at, manufactured_at, note, quantity_available, quantity_received, received_at, status, supplier_name, updated_at, seller_id, variant_id)
SELECT 'WASTE-BATCH-010', 10000, NOW(), DATE_ADD(NOW(), INTERVAL 70 HOUR), DATE_SUB(NOW(), INTERVAL 5 DAY), 'Demo warning data', 42, 57, NOW(), 'active', 'Demo Supplier', NOW(), 1, v.id
FROM product_variants v WHERE v.variant_code = 'WASTE-VAR-002'
AND NOT EXISTS (SELECT 1 FROM inventory_batches WHERE batch_code = 'WASTE-BATCH-010');
