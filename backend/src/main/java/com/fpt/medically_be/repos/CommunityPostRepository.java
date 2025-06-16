package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.CommunityPost;
import com.fpt.medically_be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    Optional<CommunityPost> findByPostId(String postId);

    List<CommunityPost> findAllByOrderByIsPinnedDescCreatedAtDesc();

    List<CommunityPost> findByAuthorOrderByCreatedAtDesc(User author);

    List<CommunityPost> findByCategoryOrderByCreatedAtDesc(String category);

    @Query("SELECT p FROM CommunityPost p WHERE p.author.role = :role ORDER BY p.isPinned DESC, p.createdAt DESC")
    List<CommunityPost> findByAuthorRoleOrderByIsPinnedDescCreatedAtDesc(@Param("role") String role);

    @Query("SELECT p FROM CommunityPost p WHERE p.title LIKE %:searchTerm% OR p.content LIKE %:searchTerm%")
    List<CommunityPost> searchPosts(@Param("searchTerm") String searchTerm);

    @Query("SELECT p FROM CommunityPost p JOIN p.tags t WHERE t = :tag ORDER BY p.createdAt DESC")
    List<CommunityPost> findByTag(@Param("tag") String tag);
}
