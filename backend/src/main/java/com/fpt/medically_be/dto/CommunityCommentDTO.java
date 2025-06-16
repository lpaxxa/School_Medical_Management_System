package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityCommentDTO {
    private String id;
    private String postId;
    private AuthorDTO author;
    private String content;
    private String createdAt;
    private Integer likes;
    private Boolean isPinned;
}
