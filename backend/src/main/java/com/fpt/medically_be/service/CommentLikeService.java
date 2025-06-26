package com.fpt.medically_be.service;

public interface CommentLikeService {
    boolean toggleCommentLike(Long commentId, String userId);
    boolean isCommentLikedByUser(Long commentId, String userId);
    long getCommentLikesCount(Long commentId);
}
