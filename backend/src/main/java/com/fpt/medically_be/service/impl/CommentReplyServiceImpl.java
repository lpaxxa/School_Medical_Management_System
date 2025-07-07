package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.CommentReplyDTO;
import com.fpt.medically_be.dto.CommentReplyRequest;
import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.CommentReply;
import com.fpt.medically_be.entity.PostComment;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.CommentReplyRepository;
import com.fpt.medically_be.repos.PostCommentRepository;
import com.fpt.medically_be.service.CommentReplyLikeService;
import com.fpt.medically_be.service.CommentReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentReplyServiceImpl implements CommentReplyService {

    private final CommentReplyRepository commentReplyRepository;
    private final PostCommentRepository postCommentRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final CommentReplyLikeService commentReplyLikeService;

    @Override
    public PageResponse<CommentReplyDTO> getCommentReplies(Long commentId, int page, int size) {
        return getCommentReplies(commentId, page, size, null);
    }

    public PageResponse<CommentReplyDTO> getCommentReplies(Long commentId, int page, int size, String currentUserId) {
        PostComment comment = postCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<CommentReply> repliesPage = commentReplyRepository.findByCommentOrderByCreatedAtAsc(comment, pageable);

        List<CommentReplyDTO> replyDTOs = repliesPage.getContent().stream()
                .map(reply -> convertToDTO(reply, currentUserId))
                .collect(Collectors.toList());

        return PageResponse.<CommentReplyDTO>builder()
                .content(replyDTOs)
                .page(page)
                .size(size)
                .totalElements(repliesPage.getTotalElements())
                .totalPages(repliesPage.getTotalPages())
                .first(repliesPage.isFirst())
                .last(repliesPage.isLast())
                .build();
    }

    @Override
    public CommentReplyDTO createReply(Long commentId, CommentReplyRequest replyRequest, String authorId) {
        PostComment comment = postCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        AccountMember author = accountMemberRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        CommentReply reply = CommentReply.builder()
                .comment(comment)
                .author(author)
                .content(replyRequest.getContent())
                .build();

        CommentReply savedReply = commentReplyRepository.save(reply);

        // Cập nhật số lượng phản hồi trong bình luận
        comment.setRepliesCount(comment.getRepliesCount() + 1);
        postCommentRepository.save(comment);

        return convertToDTO(savedReply);
    }

    @Override
    public CommentReplyDTO updateReply(Long replyId, CommentReplyRequest replyRequest, String userId) {
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi"));

        if (!reply.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa phản hồi này");
        }

        reply.setContent(replyRequest.getContent());
        CommentReply updatedReply = commentReplyRepository.save(reply);
        return convertToDTO(updatedReply);
    }

    @Override
    public void deleteReply(Long replyId, String userId) {
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi"));

        if (!reply.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa phản hồi này");
        }

        PostComment comment = reply.getComment();
        commentReplyRepository.delete(reply);

        // Cập nhật số lượng phản hồi trong bình luận
        comment.setRepliesCount(Math.max(0, comment.getRepliesCount() - 1));
        postCommentRepository.save(comment);
    }

    private CommentReplyDTO convertToDTO(CommentReply reply) {
        return convertToDTO(reply, null);
    }

    private CommentReplyDTO convertToDTO(CommentReply reply, String currentUserId) {
        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = commentReplyLikeService.isReplyLikedByUser(reply.getId(), currentUserId);
        }

        return CommentReplyDTO.builder()
                .id(reply.getId())
                .commentId(reply.getComment().getId())
                .content(reply.getContent())
                .likesCount(reply.getLikesCount())
                .isLiked(isLiked)
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .author(CommentReplyDTO.AuthorDTO.builder()
                        .id(reply.getAuthor().getId())
                        .name(reply.getAuthor().getUsername())
                        .avatar("/images/avatars/default.jpg")
                        .role(reply.getAuthor().getRole().name())
                        .build())
                .build();
    }
}
