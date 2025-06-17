package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostBookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {
    Optional<PostBookmark> findByPostAndUser(Post post, AccountMember user);
    boolean existsByPostAndUser(Post post, AccountMember user);
    Page<PostBookmark> findByUserOrderByCreatedAtDesc(AccountMember user, Pageable pageable);
    void deleteByPostAndUser(Post post, AccountMember user);
}
