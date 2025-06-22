package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthArticleDTO {
    private Long id;
    private String title;
    private String summary;
    private String content;
    private String author;
    private String memberId;
    private String memberName;
    private LocalDateTime publishDate;
    private String category;
    private String imageUrl;
    private List<String> tags;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class HealthArticleSummaryDTO {
    private Long id;
    private String title;
    private String summary;
    private String author;
    private String memberId;
    private String memberName;
    private LocalDateTime publishDate;
    private String category;
    private String imageUrl;
    private List<String> tags;
}
