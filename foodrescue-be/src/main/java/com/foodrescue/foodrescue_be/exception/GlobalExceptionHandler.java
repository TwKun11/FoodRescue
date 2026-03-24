package com.foodrescue.foodrescue_be.exception;

import com.foodrescue.foodrescue_be.dto.response.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}