package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.CommentDTO;
import com.fpt.medically_be.dto.CommentRequest;
import com.fpt.medically_be.dto.PageResponse;

public interface CommentService {
    PageResponse<CommentDTO> getPostComments(Long postId, int page, int size);
    CommentDTO createComment(Long postId, CommentRequest commentRequest, String authorId);
    CommentDTO updateComment(Long commentId, CommentRequest commentRequest, String userId);
    void deleteComment(Long commentId, String userId);
}
