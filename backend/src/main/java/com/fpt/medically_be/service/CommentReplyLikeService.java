package com.fpt.medically_be.service;

public interface CommentReplyLikeService {
    boolean toggleReplyLike(Long replyId, String userId);
    boolean isReplyLikedByUser(Long replyId, String userId);
    long getReplyLikesCount(Long replyId);
}
