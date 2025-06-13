//package com.fpt.medically_be.service.impl;
//
//import com.fpt.medically_be.dto.HealthArticleDTO;
//import com.fpt.medically_be.dto.UserDTO;
//import com.fpt.medically_be.entity.HealthArticle;
//import com.fpt.medically_be.entity.User;
//import com.fpt.medically_be.repos.HealthArticleRepository;
//import com.fpt.medically_be.repos.UserRepository;
//import com.fpt.medically_be.service.HealthArticleService;
//import jakarta.persistence.EntityNotFoundException;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.access.AccessDeniedException;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class HealthArticleServiceImpl implements HealthArticleService {
//
//    private final HealthArticleRepository healthArticleRepository;
//    private final UserRepository userRepository;
//
//    @Autowired
//    public HealthArticleServiceImpl(HealthArticleRepository healthArticleRepository, UserRepository userRepository) {
//        this.healthArticleRepository = healthArticleRepository;
//        this.userRepository = userRepository;
//    }
//
//    @Override
//    public List<HealthArticleDTO> getAllPublishedArticles() {
//        return healthArticleRepository.findByPublishedTrue().stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<HealthArticleDTO> getArticlesByCategory(String category) {
//        return healthArticleRepository.findByPublishedTrueAndCategoryOrderByCreatedAtDesc(category).stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public HealthArticleDTO getArticleById(Long id) {
//        HealthArticle article = healthArticleRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
//
//        // Kiểm tra xem bài viết đã được xuất bản chưa
//        if (!article.isPublished()) {
//            throw new AccessDeniedException("Bài viết này chưa được xuất bản");
//        }
//
//        return convertToDTO(article);
//    }
//
//    @Override
//    public HealthArticleDTO createArticle(HealthArticleDTO healthArticleDTO, String authorUsername) {
//        User author = userRepository.findByUsername(authorUsername)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài khoản người dùng"));
//
//        // Chỉ cho phép y tá tạo bài viết cẩm nang
//        if (!author.getRole().getName().equals("ROLE_NURSE") && !author.getRole().getName().equals("ROLE_ADMIN")) {
//            throw new AccessDeniedException("Chỉ y tá hoặc quản trị viên mới được phép tạo bài viết cẩm nang y tế");
//        }
//
//        HealthArticle article = new HealthArticle();
//        article.setTitle(healthArticleDTO.getTitle());
//        article.setSummary(healthArticleDTO.getSummary());
//        article.setContent(healthArticleDTO.getContent());
//        article.setAuthor(author);
//        article.setCategory(healthArticleDTO.getCategory());
//        article.setImageUrl(healthArticleDTO.getImageUrl());
//        article.setTags(healthArticleDTO.getTags());
//        article.setPublished(healthArticleDTO.isPublished());
//        article.setCreatedAt(LocalDateTime.now());
//
//        HealthArticle savedArticle = healthArticleRepository.save(article);
//        return convertToDTO(savedArticle);
//    }
//
//    @Override
//    public HealthArticleDTO updateArticle(Long id, HealthArticleDTO healthArticleDTO) {
//        HealthArticle existingArticle = healthArticleRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
//
//        existingArticle.setTitle(healthArticleDTO.getTitle());
//        existingArticle.setSummary(healthArticleDTO.getSummary());
//        existingArticle.setContent(healthArticleDTO.getContent());
//        existingArticle.setCategory(healthArticleDTO.getCategory());
//        existingArticle.setImageUrl(healthArticleDTO.getImageUrl());
//        existingArticle.setTags(healthArticleDTO.getTags());
//        existingArticle.setUpdatedAt(LocalDateTime.now());
//
//        HealthArticle updatedArticle = healthArticleRepository.save(existingArticle);
//        return convertToDTO(updatedArticle);
//    }
//
//    @Override
//    public HealthArticleDTO publishArticle(Long id) {
//        HealthArticle article = healthArticleRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
//
//        article.setPublished(true);
//        article.setUpdatedAt(LocalDateTime.now());
//
//        HealthArticle updatedArticle = healthArticleRepository.save(article);
//        return convertToDTO(updatedArticle);
//    }
//
//    @Override
//    public HealthArticleDTO unpublishArticle(Long id) {
//        HealthArticle article = healthArticleRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
//
//        article.setPublished(false);
//        article.setUpdatedAt(LocalDateTime.now());
//
//        HealthArticle updatedArticle = healthArticleRepository.save(article);
//        return convertToDTO(updatedArticle);
//    }
//
//    @Override
//    public void deleteArticle(Long id) {
//        if (!healthArticleRepository.existsById(id)) {
//            throw new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id);
//        }
//        healthArticleRepository.deleteById(id);
//    }
//
//    @Override
//    public List<HealthArticleDTO> searchArticles(String searchTerm) {
//        return healthArticleRepository.findByTitleContainingAndPublishedTrueOrSummaryContainingAndPublishedTrue(searchTerm, searchTerm)
//                .stream()
//                .map(this::convertToDTO)
//                .collect(Collectors.toList());
//    }
//
//    private HealthArticleDTO convertToDTO(HealthArticle article) {
//        HealthArticleDTO dto = new HealthArticleDTO();
//        dto.setId(article.getId());
//        dto.setTitle(article.getTitle());
//        dto.setSummary(article.getSummary());
//        dto.setContent(article.getContent());
//
//        // Chuyển đổi thông tin tác giả
//        UserDTO authorDTO = new UserDTO();
//        authorDTO.setId(article.getAuthor().getId());
//        authorDTO.setName(article.getAuthor().getName());
//        // Các thông tin khác của author nếu cần
//
//        dto.setAuthor(authorDTO);
//        dto.setCreatedAt(article.getCreatedAt());
//        dto.setUpdatedAt(article.getUpdatedAt());
//        dto.setCategory(article.getCategory());
//        dto.setImageUrl(article.getImageUrl());
//        dto.setTags(article.getTags());
//        dto.setPublished(article.isPublished());
//
//        return dto;
//    }
//}
