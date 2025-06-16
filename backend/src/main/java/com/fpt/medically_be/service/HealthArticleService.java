package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.HealthArticleDTO;
import com.fpt.medically_be.entity.HealthArticle;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.repos.HealthArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HealthArticleService {

    private final HealthArticleRepository healthArticleRepository;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    @Autowired
    public HealthArticleService(HealthArticleRepository healthArticleRepository) {
        this.healthArticleRepository = healthArticleRepository;
    }

    @Transactional(readOnly = true)
    public List<HealthArticleDTO> getAllArticles() {
        return healthArticleRepository.findAllByOrderByCreatedDateDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HealthArticleDTO getArticleById(String articleId) {
        HealthArticle article = healthArticleRepository.findByArticleId(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + articleId));

        // Tăng lượt xem
        article.setViewCount(article.getViewCount() != null ? article.getViewCount() + 1 : 1);
        healthArticleRepository.save(article);

        return convertToDTO(article);
    }

    @Transactional(readOnly = true)
    public List<HealthArticleDTO> getArticlesByCategory(String category) {
        return healthArticleRepository.findByCategoryOrderByCreatedDateDesc(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HealthArticleDTO> getFeaturedArticles() {
        return healthArticleRepository.findByFeaturedTrueOrderByCreatedDateDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HealthArticleDTO> searchArticles(String searchTerm) {
        return healthArticleRepository.searchArticles(searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HealthArticleDTO> getArticlesByTag(String tag) {
        return healthArticleRepository.findByTag(tag)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HealthArticleDTO createArticle(HealthArticleDTO articleDTO) {
        HealthArticle article = convertToEntity(articleDTO);
        article.setArticleId("art" + UUID.randomUUID().toString().substring(0, 6));
        article.setCreatedDate(new Date());
        article.setViewCount(0);

        HealthArticle savedArticle = healthArticleRepository.save(article);
        return convertToDTO(savedArticle);
    }

    @Transactional
    public HealthArticleDTO updateArticle(String articleId, HealthArticleDTO articleDTO) {
        HealthArticle article = healthArticleRepository.findByArticleId(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + articleId));

        article.setTitle(articleDTO.getTitle());
        article.setSummary(articleDTO.getSummary());
        article.setContent(articleDTO.getContent());
        article.setAuthor(articleDTO.getAuthor());
        article.setCategory(articleDTO.getCategory());
        article.setImageUrl(articleDTO.getImageUrl());
        article.setTags(articleDTO.getTags());
        article.setFeatured(articleDTO.getFeatured());

        HealthArticle updatedArticle = healthArticleRepository.save(article);
        return convertToDTO(updatedArticle);
    }

    @Transactional
    public void deleteArticle(String articleId) {
        HealthArticle article = healthArticleRepository.findByArticleId(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết với ID: " + articleId));

        healthArticleRepository.delete(article);
    }

    private HealthArticleDTO convertToDTO(HealthArticle article) {
        return HealthArticleDTO.builder()
                .id(article.getArticleId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .content(article.getContent())
                .author(article.getAuthor())
                .date(dateFormat.format(article.getCreatedDate()))
                .category(article.getCategory())
                .imageUrl(article.getImageUrl())
                .tags(article.getTags())
                .viewCount(article.getViewCount())
                .featured(article.getFeatured())
                .build();
    }

    private HealthArticle convertToEntity(HealthArticleDTO articleDTO) {
        return HealthArticle.builder()
                .articleId(articleDTO.getId())
                .title(articleDTO.getTitle())
                .summary(articleDTO.getSummary())
                .content(articleDTO.getContent())
                .author(articleDTO.getAuthor())
                .category(articleDTO.getCategory())
                .imageUrl(articleDTO.getImageUrl())
                .tags(articleDTO.getTags())
                .featured(articleDTO.getFeatured())
                .build();
    }
}
