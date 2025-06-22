package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.HealthArticleDTO;
import com.fpt.medically_be.dto.HealthArticleCreateDTO;
import com.fpt.medically_be.service.HealthArticleService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthArticleController {

    private final HealthArticleService healthArticleService;

    @Operation(summary = "Lấy danh sách tất cả các bài viết y tế", description = "Trả về danh sách tất cả các bài viết y tế")
    @GetMapping("/health-articles")
    public ResponseEntity<List<HealthArticleDTO>> getAllHealthArticles() {
        return ResponseEntity.ok(healthArticleService.getAllArticles());
    }

    @Operation(summary = "Lấy chi tiết một bài viết y tế theo ID", description = "Trả về thông tin chi tiết của một bài viết y tế dựa trên ID")
    @GetMapping("/health-articles/{id}")
    public ResponseEntity<HealthArticleDTO> getHealthArticleById(@PathVariable Long id) {
        HealthArticleDTO article = healthArticleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    @Operation(summary = "Lấy danh sách bài viết y tế theo danh mục", description = "Trả về danh sách các bài viết y tế thuộc một danh mục cụ thể")
    @GetMapping("/health-articles/category/{category}")
    public ResponseEntity<List<HealthArticleDTO>> getHealthArticlesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(healthArticleService.getArticlesByCategory(category));
    }

    @Operation(summary = "Đăng bài viết y tế mới", description = "Tạo mới một bài viết y tế và trả về thông tin bài viết đã được tạo (yêu cầu đăng nhập)")
    @PostMapping("/health-articles")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HealthArticleDTO> createHealthArticle(@RequestBody HealthArticleCreateDTO createDTO) {
        // Lấy thông tin người dùng hiện tại đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Gán ID người dùng hiện tại vào DTO
        createDTO.setMemberId(currentUserId);

        HealthArticleDTO createdArticle = healthArticleService.createArticle(createDTO);
        return new ResponseEntity<>(createdArticle, HttpStatus.CREATED);
    }

    @Operation(summary = "Xóa bài viết y tế", description = "Xóa một bài viết y tế dựa trên ID (yêu cầu quyền quản trị hoặc là người đã đăng bài)")
    @DeleteMapping("/health-articles/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteHealthArticle(@PathVariable Long id) {
        // Lấy thông tin người dùng hiện tại đang đăng nhập để kiểm tra quyền
        // Chức năng này hiện tại chỉ triển khai soft-delete
        healthArticleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}

