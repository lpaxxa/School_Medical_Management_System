package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    @Query("SELECT c FROM PostComment c WHERE c.post = :post AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<PostComment> findByPostOrderByCreatedAtDesc(@Param("post") Post post, Pageable pageable);


    @Query("SELECT c FROM PostComment c WHERE c.id = :id AND c.isDeleted = false")
    Optional<PostComment> findByIdAndIsDeletedFalse(@Param("id") Long id);


}
