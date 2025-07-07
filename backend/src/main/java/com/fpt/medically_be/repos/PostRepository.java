package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Updated queries to filter out deleted posts
    Page<Post> findByIsDeletedFalseOrderByIsPinnedDescCreatedAtDesc(Pageable pageable);
    
    List<Post> findTop5ByIdNotAndCategoryAndIsDeletedFalseOrderByCreatedAtDesc(Long postId, String category);
    
    // Override findById to only return non-deleted posts
    @Query("SELECT p FROM Post p WHERE p.id = :id AND p.isDeleted = false")
    Optional<Post> findByIdAndIsDeletedFalse(@Param("id") Long id);
    
    // Find posts by author (active posts only)
    Page<Post> findByAuthorIdAndIsDeletedFalseOrderByCreatedAtDesc(String authorId, Pageable pageable);
    
    // Find posts by category (active posts only)
    Page<Post> findByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(String category, Pageable pageable);
    
    // Count active posts
    long countByIsDeletedFalse();
    
    // Count active posts by author
    long countByAuthorIdAndIsDeletedFalse(String authorId);

    @Modifying
    @Query("UPDATE Post p SET p.isDeleted = true WHERE p.id = :id")
    void softDeleteById(@Param("id") Long id);
}
