package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.HealthArticleDTO;
import com.fpt.medically_be.dto.HealthArticleCreateDTO;
import com.fpt.medically_be.dto.request.HealthArticleUpdateDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.HealthArticle;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.HealthArticleRepository;
import com.fpt.medically_be.service.HealthArticleService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthArticleServiceImpl implements HealthArticleService {

    private final HealthArticleRepository healthArticleRepository;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    public List<HealthArticleDTO> getAllArticles() {
        List<HealthArticle> articles = healthArticleRepository.findByIsActiveTrue();
        return mapToDTOList(articles);
    }

    @Override
    public HealthArticleDTO getArticleById(Long id) {
        HealthArticle article = healthArticleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));

        if (!article.getIsActive()) {
            throw new EntityNotFoundException("Bài viết này không còn tồn tại hoặc đã bị xóa");
        }

        return mapToDTO(article);
    }

    @Override
    public List<HealthArticleDTO> getArticlesByCategory(String category) {
        List<HealthArticle> articles = healthArticleRepository
                .findByCategoryAndIsActiveTrueOrderByPublishDateDesc(category);
        return mapToDTOList(articles);
    }

    @Override
    public List<HealthArticleDTO> getRelatedArticles(Long articleId, String category) {
        // Chỉ lấy tối đa 3 bài viết liên quan (cùng danh mục, không bao gồm bài viết hiện tại)
        List<HealthArticle> relatedArticles = healthArticleRepository.findRelatedArticles(category, articleId);
        if (relatedArticles.isEmpty()) {
            return new ArrayList<>();
        }
        // Giới hạn chỉ lấy tối đa 3 bài viết liên quan
        return mapToDTOList(relatedArticles.stream().limit(3).collect(Collectors.toList()));
    }

    @Override
    public HealthArticleDTO createArticle(HealthArticleCreateDTO createDTO) {
        // Kiểm tra và lấy thông tin thành viên từ memberId
        AccountMember member = null;
        if (createDTO.getMemberId() != null && !createDTO.getMemberId().isEmpty()) {
            member = accountMemberRepository.findById(createDTO.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thành viên với ID: " + createDTO.getMemberId()));
        } else {
            throw new IllegalArgumentException("Member ID không được để trống");
        }

        HealthArticle article = HealthArticle.builder()
                .title(createDTO.getTitle())
                .summary(createDTO.getSummary())
                .content(createDTO.getContent())
                .author(createDTO.getAuthor())
                .member(member)
                .publishDate(LocalDateTime.now())
                .category(createDTO.getCategory())
                .imageUrl(createDTO.getImageUrl())
                .tags(createDTO.getTags())
                .isActive(true)
                .build();

        HealthArticle savedArticle = healthArticleRepository.save(article);
        return mapToDTO(savedArticle);
    }

    @Override
    public HealthArticleDTO updateArticle(Long id, HealthArticleUpdateDTO updateDTO) {
        HealthArticle article = healthArticleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
        // Lấy thông tin người dùng hiện tại đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        AccountMember member = accountMemberRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thành viên với ID: " + currentUserId));
        article.setMember(member);
        article.setPublishDate(LocalDateTime.now());



        // Cập nhật các trường cần thiết

        if (updateDTO.getTitle() != null && !updateDTO.getTitle().trim().isEmpty()) {
            article.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getSummary() != null && !updateDTO.getSummary().trim().isEmpty()) {
            article.setSummary(updateDTO.getSummary());
        }
        if (updateDTO.getContent() != null && !updateDTO.getContent().trim().isEmpty()) {
            article.setContent(updateDTO.getContent());
        }
        if (updateDTO.getAuthor() != null && !updateDTO.getAuthor().trim().isEmpty()) {
            article.setAuthor(updateDTO.getAuthor());
        }
        if (updateDTO.getCategory() != null && !updateDTO.getCategory().trim().isEmpty()) {
            article.setCategory(updateDTO.getCategory());
        }
        if (updateDTO.getImageUrl() != null && !updateDTO.getImageUrl().trim().isEmpty()) {
            article.setImageUrl(updateDTO.getImageUrl());
        }
        if (updateDTO.getTags() != null && !updateDTO.getTags().isEmpty()) {
            article.setTags(updateDTO.getTags());
        }


        // Lưu thay đổi vào cơ sở dữ liệu
        HealthArticle updatedArticle = healthArticleRepository.save(article);
        return mapToDTO(updatedArticle);

    }

    @Override
    public void deleteArticle(Long id) {
        HealthArticle article = healthArticleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));

        // Thực hiện soft delete bằng cách đặt isActive = false
        article.setIsActive(false);
        healthArticleRepository.save(article);
    }

    @Override
    public HealthArticleDTO updateArticleImage(Long id, String imageUrl) {
        HealthArticle article = healthArticleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));

        // Cập nhật đường dẫn hình ảnh mới
        article.setImageUrl(imageUrl);

        // Lưu thay đổi vào cơ sở dữ liệu
        HealthArticle updatedArticle = healthArticleRepository.save(article);

        return mapToDTO(updatedArticle);
    }

    private HealthArticleDTO mapToDTO(HealthArticle article) {
        HealthArticleDTO dto = HealthArticleDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .content(article.getContent())
                .author(article.getAuthor())
                .publishDate(article.getPublishDate())
                .category(article.getCategory())
                .imageUrl(article.getImageUrl())
                .tags(article.getTags())
                .build();

        // Thêm thông tin về thành viên đăng bài nếu có
        if (article.getMember() != null) {
            dto.setMemberId(article.getMember().getId());
            dto.setMemberName(article.getMember().getUsername());
        }

        return dto;
    }

    private List<HealthArticleDTO> mapToDTOList(List<HealthArticle> articles) {
        return articles.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
