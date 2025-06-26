package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String excerpt;
    private String content;
    private String category;
    private AuthorDTO author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int likes;
    private int commentsCount;
    private boolean isPinned;
    private boolean isLiked; // Người dùng hiện tại đã thích hay chưa
    private boolean isBookmarked; // Người dùng hiện tại đã ghim hay chưa
    private Set<String> tags;
    private List<RelatedPostDTO> relatedPosts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorDTO {
        private String id;
        private String name;
        private String avatar;
        private String role;
        private String bio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedPostDTO {
        private Long id;
        private String title;
        private String category;
        private AuthorDTO author;
        private int likes;
        private int commentsCount;
    }
}
