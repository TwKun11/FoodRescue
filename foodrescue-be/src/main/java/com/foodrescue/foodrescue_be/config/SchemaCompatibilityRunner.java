package com.foodrescue.foodrescue_be.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SchemaCompatibilityRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        migrateEnumColumnToVarchar("orders", "order_status", "VARCHAR(50) NOT NULL");
        migrateEnumColumnToVarchar("orders", "payment_status", "VARCHAR(50) NOT NULL");
        migrateEnumColumnToVarchar("orders", "payment_method", "VARCHAR(50) NOT NULL");
        migrateEnumColumnToVarchar("order_seller_orders", "order_status", "VARCHAR(50) NOT NULL");
        migrateEnumColumnToVarchar("order_payments", "provider", "VARCHAR(50) NOT NULL");
        migrateEnumColumnToVarchar("order_payments", "status", "VARCHAR(50) NOT NULL");
        migrateEnumColumnToVarchar("inventory_reservations", "status", "VARCHAR(50) NOT NULL");
    }

    private void migrateEnumColumnToVarchar(String tableName, String columnName, String targetDefinition) {
        String sql = """
                SELECT DATA_TYPE
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = ?
                """;

        List<String> dataTypes = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getString("DATA_TYPE"),
                tableName,
                columnName
        );

        if (dataTypes.isEmpty()) {
            return;
        }

        String dataType = dataTypes.getFirst();
        if (!"enum".equalsIgnoreCase(dataType)) {
            return;
        }

        String alterSql = "ALTER TABLE " + tableName + " MODIFY COLUMN " + columnName + " " + targetDefinition;
        jdbcTemplate.execute(alterSql);
        log.info("Migrated {}.{} from ENUM to {}", tableName, columnName, targetDefinition);
    }
}
