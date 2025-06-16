package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthArticleRepository extends JpaRepository<HealthArticle, Long> {

    Optional<HealthArticle> findByArticleId(String articleId);

    List<HealthArticle> findAllByOrderByCreatedDateDesc();

    List<HealthArticle> findByCategoryOrderByCreatedDateDesc(String category);

    List<HealthArticle> findByFeaturedTrueOrderByCreatedDateDesc();

    @Query("SELECT h FROM HealthArticle h WHERE h.title LIKE %:searchTerm% OR h.summary LIKE %:searchTerm% OR h.content LIKE %:searchTerm%")
    List<HealthArticle> searchArticles(@Param("searchTerm") String searchTerm);

    @Query("SELECT h FROM HealthArticle h JOIN h.tags t WHERE t = :tag")
    List<HealthArticle> findByTag(@Param("tag") String tag);
}
