package com.foodrescue.foodrescue_be.exception;

import com.foodrescue.foodrescue_be.dto.response.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ResponseData<Object>> handleResourceNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseData.error(e.getMessage()));
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ResponseData<Object>> handleInvalidOperation(InvalidOperationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseData.error(e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResponseData<Object>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponseData.error(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseData<Map<String, String>>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = e.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, err -> err.getDefaultMessage() != null ? err.getDefaultMessage() : "Invalid"));
        ResponseData<Map<String, String>> response = new ResponseData<>(false, "Dữ liệu không hợp lệ", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ResponseData<Object>> handleDataIntegrity(DataIntegrityViolationException e) {
        String message = toFriendlyDatabaseMessage(e);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ResponseData.error(message));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseData<Object>> handleUnexpectedException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseData.error(e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống"));
    }

    private String toFriendlyDatabaseMessage(DataIntegrityViolationException e) {
        String detail = collectExceptionDetail(e).toLowerCase();

        if (containsAny(detail, "duplicate", "duplicate entry", "unique constraint", "uk_")) {
            if (containsAny(detail, "product_code", "uk_product_code", "products.product_code")) {
                return "Mã sản phẩm đã tồn tại. Vui lòng thử lại hoặc dùng mã sản phẩm khác.";
            }
            if (containsAny(detail, "slug", "products.slug")) {
                return "Slug sản phẩm đã tồn tại. Vui lòng đổi slug khác hoặc để hệ thống tự sinh slug mới.";
            }
            if (containsAny(detail, "voucher", "vouchers", "code")) {
                return "Mã voucher đã tồn tại. Vui lòng nhập mã voucher khác.";
            }
            if (containsAny(detail, "user_voucher", "uk_user_voucher")) {
                return "Bạn đã nhận voucher này rồi.";
            }
            return "Dữ liệu đã tồn tại trong hệ thống. Vui lòng kiểm tra lại thông tin vừa nhập.";
        }

        if (containsAny(detail, "foreign key", "constraint fails", "referential integrity")) {
            if (containsAny(detail, "category_id")) {
                return "Danh mục sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng chọn lại danh mục.";
            }
            if (containsAny(detail, "brand_id")) {
                return "Thương hiệu không tồn tại hoặc đã bị xóa. Vui lòng chọn lại thương hiệu.";
            }
            if (containsAny(detail, "seller_id")) {
                return "Tài khoản bán hàng không hợp lệ. Vui lòng đăng nhập lại kênh người bán.";
            }
            if (containsAny(detail, "voucher_id")) {
                return "Voucher không tồn tại hoặc đã bị xóa. Vui lòng tải lại danh sách voucher.";
            }
            if (containsAny(detail, "product_id")) {
                return "Sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng tải lại trang và thử lại.";
            }
            if (containsAny(detail, "variant_id")) {
                return "Biến thể sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng tải lại trang và thử lại.";
            }
            return "Dữ liệu liên kết không còn tồn tại. Vui lòng tải lại trang và kiểm tra lại thông tin.";
        }

        if (containsAny(detail, "cannot be null", "not-null", "null value")) {
            return "Thiếu thông tin bắt buộc. Vui lòng kiểm tra lại các trường vừa nhập.";
        }

        if (containsAny(detail, "data too long", "value too long")) {
            return "Một số thông tin nhập quá dài. Vui lòng rút gọn nội dung và thử lại.";
        }

        return "Không thể lưu dữ liệu do ràng buộc hệ thống. Vui lòng kiểm tra lại thông tin và thử lại.";
    }

    private String collectExceptionDetail(Throwable throwable) {
        StringBuilder detail = new StringBuilder();
        Throwable current = throwable;
        while (current != null) {
            if (current.getMessage() != null) {
                detail.append(' ').append(current.getMessage());
            }
            current = current.getCause();
        }
        return detail.toString();
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}