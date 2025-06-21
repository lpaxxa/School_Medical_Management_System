package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    Page<PostComment> findByPostOrderByCreatedAtDesc(Post post, Pageable pageable);
    long countByPost(Post post);
}
