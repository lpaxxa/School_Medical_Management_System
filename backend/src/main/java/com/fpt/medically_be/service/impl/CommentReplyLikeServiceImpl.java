package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.CommentReply;
import com.fpt.medically_be.entity.CommentReplyLike;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.CommentReplyLikeRepository;
import com.fpt.medically_be.repos.CommentReplyRepository;
import com.fpt.medically_be.service.CommentReplyLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentReplyLikeServiceImpl implements CommentReplyLikeService {

    private final CommentReplyLikeRepository commentReplyLikeRepository;
    private final CommentReplyRepository commentReplyRepository;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    public boolean toggleReplyLike(Long replyId, String userId) {
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi bình luận"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        boolean isLiked = commentReplyLikeRepository.existsByReplyAndUser(reply, user);

        if (isLiked) {
            // Bỏ thích
            commentReplyLikeRepository.deleteByReplyAndUser(reply, user);
            reply.setLikesCount(Math.max(0, reply.getLikesCount() - 1));
            commentReplyRepository.save(reply);
            return false;
        } else {
            // Thích
            CommentReplyLike replyLike = CommentReplyLike.builder()
                    .reply(reply)
                    .user(user)
                    .build();
            commentReplyLikeRepository.save(replyLike);
            reply.setLikesCount(reply.getLikesCount() + 1);
            commentReplyRepository.save(reply);
            return true;
        }
    }

    @Override
    public boolean isReplyLikedByUser(Long replyId, String userId) {
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi bình luận"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return commentReplyLikeRepository.existsByReplyAndUser(reply, user);
    }

    @Override
    public long getReplyLikesCount(Long replyId) {
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phản hồi bình luận"));

        return commentReplyLikeRepository.countByReply(reply);
    }
}
