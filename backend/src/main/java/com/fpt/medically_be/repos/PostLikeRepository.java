package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostAndUser(Post post, AccountMember user);
    boolean existsByPostAndUser(Post post, AccountMember user);
    
    @Query("SELECT COUNT(p) FROM PostLike p WHERE p.post = :post AND p.isDeleted = false")
    long countByPost(@Param("post") Post post);
    
    void deleteByPostAndUser(Post post, AccountMember user);

    @Modifying
    @Query("UPDATE PostLike p SET p.isDeleted = true WHERE p.post.id = :#{#post.id}")
    void deleteByPost(@Param("post") Post post);

    @Modifying
    @Query("UPDATE PostLike p SET p.isDeleted = true WHERE p.user.id = :#{#user.id}")
    void deleteByUser(@Param("user") AccountMember user);
}
