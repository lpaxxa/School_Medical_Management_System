package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.CommentReplyDTO;
import com.fpt.medically_be.dto.CommentReplyRequest;
import com.fpt.medically_be.dto.PageResponse;

public interface CommentReplyService {
    PageResponse<CommentReplyDTO> getCommentReplies(Long commentId, int page, int size);
    CommentReplyDTO createReply(Long commentId, CommentReplyRequest replyRequest, String authorId);
    CommentReplyDTO updateReply(Long replyId, CommentReplyRequest replyRequest, String userId);
    void deleteReply(Long replyId, String userId);
}
