package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthArticleDTO {
    private String id;
    private String title;
    private String summary;
    private String content;
    private String author;
    private String date;
    private String category;
    private String imageUrl;
    private Set<String> tags;
    private Integer viewCount;
    private Boolean featured;
}
