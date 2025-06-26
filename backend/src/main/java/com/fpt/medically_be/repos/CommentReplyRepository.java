package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.CommentReply;
import com.fpt.medically_be.entity.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentReplyRepository extends JpaRepository<CommentReply, Long> {
    Page<CommentReply> findByCommentOrderByCreatedAtAsc(PostComment comment, Pageable pageable);
    long countByComment(PostComment comment);
}
