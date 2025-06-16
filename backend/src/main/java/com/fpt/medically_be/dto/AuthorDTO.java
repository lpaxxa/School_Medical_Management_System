package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa thông tin về tác giả của bài viết/bình luận trong cộng đồng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorDTO {
    private String id;
    private String name;
    private String avatar;
    private String role;
    private String bio;
}
