package com.fpt.medically_be.service;

public interface PostLikeService {
    boolean toggleLike(Long postId, String userId);
    boolean isPostLikedByUser(Long postId, String userId);
    long getPostLikesCount(Long postId);
    void deleteLikesByPostId(Long postId);
    void deletePostLikesByUserId(String userId);
}
