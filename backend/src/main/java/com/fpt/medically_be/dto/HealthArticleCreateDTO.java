package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthArticleCreateDTO {
    private String title;
    private String summary;
    private String content;
    private String author;
    private String memberId;  // ID của thành viên đăng bài
    private String category;
    private String imageUrl;
    private List<String> tags;
}
