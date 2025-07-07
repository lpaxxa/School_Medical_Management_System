package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;

public interface BookmarkService {
    boolean toggleBookmark(Long postId, String userId);
    boolean isPostBookmarkedByUser(Long postId, String userId);
    PageResponse<PostDTO> getUserBookmarkedPosts(String userId, int page, int size);
    void deleteBookmarksByPostId(Long postId);

}
