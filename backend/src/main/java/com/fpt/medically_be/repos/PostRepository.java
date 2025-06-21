package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);
    List<Post> findTop5ByIdNotAndCategoryOrderByCreatedAtDesc(Long postId, String category);
}
