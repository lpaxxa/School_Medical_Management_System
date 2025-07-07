package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateDTO {
    private String title;
    private String excerpt;
    private String content;
    private String category;
    private Set<String> tags;
} 