package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.CommentReply;
import com.fpt.medically_be.entity.CommentReplyLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentReplyLikeRepository extends JpaRepository<CommentReplyLike, Long> {
    Optional<CommentReplyLike> findByReplyAndUser(CommentReply reply, AccountMember user);
    boolean existsByReplyAndUser(CommentReply reply, AccountMember user);
    long countByReply(CommentReply reply);
    void deleteByReplyAndUser(CommentReply reply, AccountMember user);
}
