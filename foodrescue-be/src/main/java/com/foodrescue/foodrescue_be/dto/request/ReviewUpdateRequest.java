package com.foodrescue.foodrescue_be.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewUpdateRequest {
    @Min(value = 1, message = "Rating phải từ 1 đến 5")
    @Max(value = 5, message = "Rating phải từ 1 đến 5")
    private Integer rating; // 1-5
    
    @Size(max = 1000, message = "Bình luận không vượt quá 1000 ký tự")
    private String comment;
    
    @Size(max = 3, message = "Tối đa 3 ảnh")
    private List<String> imageUrls;
}
