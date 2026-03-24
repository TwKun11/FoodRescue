package com.foodrescue.foodrescue_be.exception;

public class InvalidOperationException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public InvalidOperationException(String message) {
        super(message);
    }

    public InvalidOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
