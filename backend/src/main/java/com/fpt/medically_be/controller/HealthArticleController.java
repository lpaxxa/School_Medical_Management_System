package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.HealthArticleDTO;
import com.fpt.medically_be.service.HealthArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các API liên quan đến bài viết sức khỏe học đường
 * Cung cấp các endpoint để xem, tìm kiếm, tạo, cập nhật và xóa bài viết
 */
@RestController
@RequestMapping("/api/health-articles")
@Tag(name = "Bài viết sức khỏe học đường", description = "API quản lý bài viết, tài liệu sức khỏe học đường")
public class HealthArticleController {

    private final HealthArticleService healthArticleService;

    @Autowired
    public HealthArticleController(HealthArticleService healthArticleService) {
        this.healthArticleService = healthArticleService;
    }

    /**
     * Lấy danh sách tất cả bài viết sức khỏe
     *
     * @return Danh sách bài viết sức khỏe học đường
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách bài viết sức khỏe", description = "Trả về danh sách tất cả bài viết sức khỏe học đường")
    public ResponseEntity<List<HealthArticleDTO>> getAllArticles() {
        return ResponseEntity.ok(healthArticleService.getAllArticles());
    }

    /**
     * Lấy thông tin chi tiết của một bài viết theo ID
     *
     * @param articleId ID của bài viết cần lấy thông tin
     * @return Thông tin chi tiết của bài viết
     */
    @GetMapping("/{articleId}")
    @Operation(summary = "Lấy bài viết theo ID", description = "Trả về chi tiết bài viết theo ID")
    public ResponseEntity<HealthArticleDTO> getArticleById(@PathVariable String articleId) {
        return ResponseEntity.ok(healthArticleService.getArticleById(articleId));
    }

    /**
     * Lấy danh sách bài viết theo danh mục
     *
     * @param category Danh mục cần lọc (phong-ngua, dinh-duong, so-cap-cuu, ...)
     * @return Danh sách bài viết thuộc danh mục
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Lấy bài viết theo danh mục", description = "Trả về danh sách bài viết theo danh mục")
    public ResponseEntity<List<HealthArticleDTO>> getArticlesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(healthArticleService.getArticlesByCategory(category));
    }

    /**
     * Lấy danh sách các bài viết nổi bật
     *
     * @return Danh sách bài viết nổi bật
     */
    @GetMapping("/featured")
    @Operation(summary = "Lấy bài viết nổi bật", description = "Trả về danh sách bài viết được đánh dấu là nổi bật")
    public ResponseEntity<List<HealthArticleDTO>> getFeaturedArticles() {
        return ResponseEntity.ok(healthArticleService.getFeaturedArticles());
    }

    /**
     * Tìm kiếm bài viết theo từ khóa
     *
     * @param query Từ khóa tìm kiếm
     * @return Danh sách bài viết phù hợp với từ khóa
     */
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm bài viết", description = "Tìm kiếm bài viết theo từ khóa")
    public ResponseEntity<List<HealthArticleDTO>> searchArticles(@RequestParam String query) {
        return ResponseEntity.ok(healthArticleService.searchArticles(query));
    }

    /**
     * Lấy danh sách bài viết theo tag
     *
     * @param tag Tag cần lọc (cúm mùa, dinh dưỡng, trẻ em, ...)
     * @return Danh sách bài viết có chứa tag
     */
    @GetMapping("/tag/{tag}")
    @Operation(summary = "Lấy bài viết theo tag", description = "Trả về danh sách bài viết có tag được chỉ định")
    public ResponseEntity<List<HealthArticleDTO>> getArticlesByTag(@PathVariable String tag) {
        return ResponseEntity.ok(healthArticleService.getArticlesByTag(tag));
    }

    /**
     * Tạo bài viết mới
     * Chỉ admin và y tá mới có quyền thực hiện thao tác này
     *
     * @param articleDTO Thông tin bài viết cần tạo
     * @return Thông tin bài viết đã tạo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Tạo bài viết mới", description = "Tạo một bài viết mới về sức khỏe học đường (chỉ dành cho admin hoặc y tá)")
    public ResponseEntity<HealthArticleDTO> createArticle(@RequestBody HealthArticleDTO articleDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(healthArticleService.createArticle(articleDTO));
    }

    /**
     * Cập nhật thông tin bài viết
     * Chỉ admin và y tá mới có quyền thực hiện thao tác này
     *
     * @param articleId ID của bài viết cần cập nhật
     * @param articleDTO Thông tin mới của bài viết
     * @return Thông tin bài viết sau khi cập nhật
     */
    @PutMapping("/{articleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Cập nhật bài viết", description = "Cập nhật thông tin bài viết (chỉ dành cho admin hoặc y tá)")
    public ResponseEntity<HealthArticleDTO> updateArticle(@PathVariable String articleId, @RequestBody HealthArticleDTO articleDTO) {
        return ResponseEntity.ok(healthArticleService.updateArticle(articleId, articleDTO));
    }

    /**
     * Xóa bài viết
     * Chỉ admin và y tá mới có quyền thực hiện thao tác này
     *
     * @param articleId ID của bài viết cần xóa
     * @return Thông báo xác nhận xóa thành công
     */
    @DeleteMapping("/{articleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Xóa bài viết", description = "Xóa bài viết theo ID (chỉ dành cho admin hoặc y tá)")
    public ResponseEntity<Map<String, String>> deleteArticle(@PathVariable String articleId) {
        healthArticleService.deleteArticle(articleId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bài viết đã được xóa thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách các danh mục bài viết sức khỏe
     *
     * @return Danh sách các danh mục bài viết
     */
    @GetMapping("/categories")
    @Operation(summary = "Lấy danh sách danh mục", description = "Trả về danh sách các danh mục bài viết sức khỏe")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        List<Map<String, String>> categories = List.of(
            Map.of("id", "all", "name", "Tất cả bài viết"),
            Map.of("id", "phong-ngua", "name", "Phòng ngừa bệnh"),
            Map.of("id", "dinh-duong", "name", "Dinh dưỡng học đường"),
            Map.of("id", "so-cap-cuu", "name", "Sơ cấp cứu"),
            Map.of("id", "suc-khoe-tam-than", "name", "Sức khỏe tâm thần"),
            Map.of("id", "ve-sinh", "name", "Vệ sinh học đường")
        );
        return ResponseEntity.ok(categories);
    }
}

