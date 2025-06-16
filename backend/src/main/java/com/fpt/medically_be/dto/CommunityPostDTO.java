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
public class CommunityPostDTO {
    private String id;
    private String title;
    private String content;
    private AuthorDTO author;
    private String category;
    private String createdAt;
    private String updatedAt;
    private Integer likes;
    private Integer comments;
    private Boolean isPinned;
    private Set<String> tags;
}

