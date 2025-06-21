package com.fpt.medically_be.repos;

import com.fpt.medically_be.entity.HealthArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthArticleRepository extends JpaRepository<HealthArticle, Long> {

    List<HealthArticle> findByIsActiveTrue();

    List<HealthArticle> findByCategoryAndIsActiveTrueOrderByPublishDateDesc(String category);


    @Query("SELECT h FROM HealthArticle h WHERE h.isActive = true AND h.category = :category " +
           "AND h.id != :articleId ORDER BY h.publishDate DESC")
    List<HealthArticle> findRelatedArticles(@Param("category") String category, @Param("articleId") Long articleId);
}
