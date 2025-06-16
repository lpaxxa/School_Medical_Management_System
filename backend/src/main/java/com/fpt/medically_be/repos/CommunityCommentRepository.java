package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.CommunityComment;
import com.fpt.medically_be.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    Optional<CommunityComment> findByCommentId(String commentId);

    List<CommunityComment> findByPostOrderByIsPinnedDescCreatedAtDesc(CommunityPost post);

    List<CommunityComment> findByPostOrderByCreatedAtAsc(CommunityPost post);

    List<CommunityComment> findByPostOrderByLikesCountDesc(CommunityPost post);

    Integer countByPost(CommunityPost post);
}
