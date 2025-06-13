//package com.fpt.medically_be.controller;
//
//import com.fpt.medically_be.dto.HealthArticleDTO;
//import com.fpt.medically_be.service.HealthArticleService;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/health-guides")
//@Tag(name = "Health Guide", description = "API điều khiển tính năng cẩm nang y tế")
//public class HealthArticleController {
//
//    private final HealthArticleService healthArticleService;
//
//    @Autowired
//    public HealthArticleController(HealthArticleService healthArticleService) {
//        this.healthArticleService = healthArticleService;
//    }
//
//    @GetMapping
//    @Operation(summary = "Lấy danh sách tất cả bài viết cẩm nang y tế đã được xuất bản")
//    public ResponseEntity<List<HealthArticleDTO>> getAllPublishedArticles() {
//        return ResponseEntity.ok(healthArticleService.getAllPublishedArticles());
//    }
//
//    @GetMapping("/category/{category}")
//    @Operation(summary = "Lấy danh sách bài viết theo danh mục")
//    public ResponseEntity<List<HealthArticleDTO>> getArticlesByCategory(@PathVariable String category) {
//        return ResponseEntity.ok(healthArticleService.getArticlesByCategory(category));
//    }
//
//    @GetMapping("/{id}")
//    @Operation(summary = "Lấy thông tin chi tiết một bài viết theo ID")
//    public ResponseEntity<HealthArticleDTO> getArticleById(@PathVariable Long id) {
//        return ResponseEntity.ok(healthArticleService.getArticleById(id));
//    }
//
//    @PostMapping
//    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Tạo bài viết mới (chỉ dành cho y tá và admin)")
//    public ResponseEntity<HealthArticleDTO> createArticle(@RequestBody HealthArticleDTO healthArticleDTO, Authentication authentication) {
//        HealthArticleDTO createdArticle = healthArticleService.createArticle(healthArticleDTO, authentication.getName());
//        return new ResponseEntity<>(createdArticle, HttpStatus.CREATED);
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Cập nhật bài viết (chỉ dành cho y tá và admin)")
//    public ResponseEntity<HealthArticleDTO> updateArticle(@PathVariable Long id, @RequestBody HealthArticleDTO healthArticleDTO) {
//        return ResponseEntity.ok(healthArticleService.updateArticle(id, healthArticleDTO));
//    }
//
//    @PutMapping("/{id}/publish")
//    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Xuất bản bài viết (chỉ dành cho y tá và admin)")
//    public ResponseEntity<HealthArticleDTO> publishArticle(@PathVariable Long id) {
//        return ResponseEntity.ok(healthArticleService.publishArticle(id));
//    }
//
//    @PutMapping("/{id}/unpublish")
//    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Hủy xuất bản bài viết (chỉ dành cho y tá và admin)")
//    public ResponseEntity<HealthArticleDTO> unpublishArticle(@PathVariable Long id) {
//        return ResponseEntity.ok(healthArticleService.unpublishArticle(id));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Xóa bài viết (chỉ dành cho y tá và admin)")
//    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
//        healthArticleService.deleteArticle(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping("/search")
//    @Operation(summary = "Tìm kiếm bài viết theo từ khóa")
//    public ResponseEntity<List<HealthArticleDTO>> searchArticles(@RequestParam String term) {
//        return ResponseEntity.ok(healthArticleService.searchArticles(term));
//    }
//}
