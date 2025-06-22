package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.HealthArticleDTO;
import com.fpt.medically_be.dto.HealthArticleCreateDTO;

import java.util.List;

public interface HealthArticleService {
    List<HealthArticleDTO> getAllArticles();
    HealthArticleDTO getArticleById(Long id);
    List<HealthArticleDTO> getArticlesByCategory(String category);
    List<HealthArticleDTO> getRelatedArticles(Long articleId, String category);
    HealthArticleDTO createArticle(HealthArticleCreateDTO createDTO);
    void deleteArticle(Long id);
}
