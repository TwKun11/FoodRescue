USE foodrescue;
UPDATE inventory_batches SET expired_at = DATE_ADD(NOW(), INTERVAL 12 HOUR) WHERE batch_code = 'BTEST-20260319001728';
UPDATE inventory_batches SET expired_at = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE batch_code = 'DIST-FRUIT-001';
UPDATE inventory_batches SET expired_at = DATE_ADD(NOW(), INTERVAL 6 HOUR) WHERE batch_code = 'DIST-READY-001';
UPDATE inventory_batches SET expired_at = DATE_ADD(NOW(), INTERVAL 48 HOUR) WHERE batch_code = 'DIST-VEG-001';
UPDATE inventory_batches SET expired_at = DATE_ADD(NOW(), INTERVAL 72 HOUR) WHERE batch_code = 'DIST-DRINK-001';
SELECT batch_code, expired_at, TIMESTAMPDIFF(HOUR, NOW(), expired_at) as hours_to_expire FROM inventory_batches WHERE TIMESTAMPDIFF(HOUR, NOW(), expired_at) > -24 ORDER BY expired_at ASC;
