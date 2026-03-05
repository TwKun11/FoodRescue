package com.foodrescue.foodrescue_be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseData<T> {

    private boolean success;
    private String message;
    private T data;

    public static <T> ResponseData<T> ok(T data) {
        return new ResponseData<>(true, null, data);
    }

    public static <T> ResponseData<T> ok(String message, T data) {
        return new ResponseData<>(true, message, data);
    }

    public static <T> ResponseData<T> error(String message) {
        return new ResponseData<>(false, message, null);
    }
}