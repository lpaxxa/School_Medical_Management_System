package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostBookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {

    Optional<PostBookmark> findByPostAndUser(Post post, AccountMember user);
    boolean existsByPostAndUser(Post post, AccountMember user);
    
    @Query("SELECT pb FROM PostBookmark pb WHERE pb.user = :user AND pb.isDeleted = false AND pb.post.isDeleted = false ORDER BY pb.createdAt DESC")
    Page<PostBookmark> findByUserOrderByCreatedAtDesc(@Param("user") AccountMember user, Pageable pageable);

    void deleteByPostAndUser(Post post, AccountMember user);

    @Modifying
    @Query("UPDATE PostBookmark p SET p.isDeleted = true WHERE p.post.id = :#{#post.id}")
    void deleteByPost(@Param("post") Post post);
}
