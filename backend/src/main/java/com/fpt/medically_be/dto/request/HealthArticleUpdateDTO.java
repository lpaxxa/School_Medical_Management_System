package com.fpt.medically_be.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthArticleUpdateDTO {
    private String title;
    private String summary;
    private String content;
    private String author;
    private String category;
    private String imageUrl;
    private List<String> tags;
}
