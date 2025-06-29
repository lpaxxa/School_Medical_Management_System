package com.fpt.medically_be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentReplyDTO {
    private Long id;
    private Long commentId;
    private String content;
    private int likesCount;
    private boolean isLiked; // Người dùng hiện tại đã thích hay chưa
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private AuthorDTO author;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorDTO {
        private String id;
        private String name;
        private String avatar;
        private String role;
    }
}
