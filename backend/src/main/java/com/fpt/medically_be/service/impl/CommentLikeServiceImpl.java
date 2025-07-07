package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.CommentLike;
import com.fpt.medically_be.entity.PostComment;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.CommentLikeRepository;
import com.fpt.medically_be.repos.PostCommentRepository;
import com.fpt.medically_be.service.CommentLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentLikeServiceImpl implements CommentLikeService {

    private final CommentLikeRepository commentLikeRepository;
    private final PostCommentRepository postCommentRepository;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    public boolean toggleCommentLike(Long commentId, String userId) {
        PostComment comment = postCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        boolean isLiked = commentLikeRepository.existsByCommentAndUser(comment, user);

        if (isLiked) {
            // Bỏ thích
            commentLikeRepository.deleteByCommentAndUser(comment, user);
            comment.setLikesCount(Math.max(0, comment.getLikesCount() - 1));
            postCommentRepository.save(comment);
            return false;
        } else {
            // Thích
            CommentLike commentLike = CommentLike.builder()
                    .comment(comment)
                    .user(user)
                    .build();
            commentLikeRepository.save(commentLike);
            comment.setLikesCount(comment.getLikesCount() + 1);
            postCommentRepository.save(comment);
            return true;
        }
    }

    @Override
    public boolean isCommentLikedByUser(Long commentId, String userId) {
        PostComment comment = postCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return commentLikeRepository.existsByCommentAndUser(comment, user);
    }

    @Override
    public long getCommentLikesCount(Long commentId) {
        PostComment comment = postCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        return commentLikeRepository.countByComment(comment);
    }
}
