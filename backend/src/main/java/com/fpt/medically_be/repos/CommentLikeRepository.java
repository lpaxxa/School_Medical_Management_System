package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.CommentLike;
import com.fpt.medically_be.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentAndUser(PostComment comment, AccountMember user);
    boolean existsByCommentAndUser(PostComment comment, AccountMember user);
    long countByComment(PostComment comment);
    void deleteByCommentAndUser(PostComment comment, AccountMember user);
}
