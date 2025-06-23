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

    /**
     * Cập nhật đường dẫn hình ảnh của bài viết y tế
     *
     * @param id ID của bài viết cần cập nhật
     * @param imageUrl Đường dẫn hình ảnh mới
     * @return HealthArticleDTO đối tượng bài viết sau khi cập nhật
     */
    HealthArticleDTO updateArticleImage(Long id, String imageUrl);
}
