//package com.fpt.medically_be.repos;
//
//import com.fpt.medically_be.entity.HealthArticle;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface HealthArticleRepository extends JpaRepository<HealthArticle, Long> {
//    List<HealthArticle> findByPublishedTrue();
//    List<HealthArticle> findByPublishedTrueAndCategoryOrderByCreatedAtDesc(String category);
//    List<HealthArticle> findByAuthorIdAndPublishedTrue(Long authorId);
//    List<HealthArticle> findByTitleContainingAndPublishedTrueOrSummaryContainingAndPublishedTrue(String titleTerm, String summaryTerm);
//}
