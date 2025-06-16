package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.CommunityPostDTO;
import com.fpt.medically_be.service.CommunityPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các API liên quan đến bài đăng trong cộng đồng
 * Cung cấp các endpoint để xem, tìm kiếm, tạo, cập nhật và xóa bài đăng
 */
@RestController
@RequestMapping("/api/community/posts")
@Tag(name = "Bài đăng cộng đồng", description = "API quản lý bài đăng trong cộng đồng sức khỏe học đường")
public class CommunityPostController {

    private final CommunityPostService postService;

    @Autowired
    public CommunityPostController(CommunityPostService postService) {
        this.postService = postService;
    }

    /**
     * Lấy danh sách tất cả bài đăng
     *
     * @return Danh sách bài đăng trong cộng đồng
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách bài đăng", description = "Trả về danh sách tất cả bài đăng trong cộng đồng")
    public ResponseEntity<List<CommunityPostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    /**
     * Lấy thông tin chi tiết của một bài đăng theo ID
     *
     * @param postId ID của bài đăng cần lấy thông tin
     * @return Thông tin chi tiết của bài đăng
     */
    @GetMapping("/{postId}")
    @Operation(summary = "Lấy bài đăng theo ID", description = "Trả về chi tiết bài đăng theo ID")
    public ResponseEntity<CommunityPostDTO> getPostById(@PathVariable String postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    /**
     * Lấy danh sách bài đăng theo danh mục
     *
     * @param category Danh mục cần lọc (question, announcement, health-guide, ...)
     * @return Danh sách bài đăng thuộc danh mục
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Lấy bài đăng theo danh mục", description = "Trả về danh sách bài đăng theo danh mục")
    public ResponseEntity<List<CommunityPostDTO>> getPostsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(postService.getPostsByCategory(category));
    }

    /**
     * Lấy danh sách bài đăng theo vai trò của tác giả
     *
     * @param role Vai trò của tác giả (nurse, parent, etc.)
     * @return Danh sách bài đăng của các tác giả có vai trò được chỉ định
     */
    @GetMapping("/role/{role}")
    @Operation(summary = "Lấy bài đăng theo vai trò tác giả", description = "Trả về danh sách bài đăng theo vai trò của tác giả (nurse, parent, etc.)")
    public ResponseEntity<List<CommunityPostDTO>> getPostsByAuthorRole(@PathVariable String role) {
        return ResponseEntity.ok(postService.getPostsByAuthorRole(role));
    }

    /**
     * Tìm kiếm bài đăng theo từ khóa
     *
     * @param query Từ khóa tìm kiếm
     * @return Danh sách bài đăng phù hợp với từ khóa
     */
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm bài đăng", description = "Tìm kiếm bài đăng theo từ khóa")
    public ResponseEntity<List<CommunityPostDTO>> searchPosts(@RequestParam String query) {
        return ResponseEntity.ok(postService.searchPosts(query));
    }

    /**
     * Tạo bài đăng mới
     *
     * @param postDTO Thông tin bài đăng cần tạo
     * @return Thông tin bài đăng đã tạo
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo bài đăng mới", description = "Tạo một bài đăng mới trong cộng đồng")
    public ResponseEntity<CommunityPostDTO> createPost(@RequestBody CommunityPostDTO postDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName(); // Giả sử getName() trả về userId

        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(postDTO, userId));
    }

    /**
     * Cập nhật thông tin bài đăng
     *
     * @param postId ID của bài đăng cần cập nhật
     * @param postDTO Thông tin mới của bài đăng
     * @return Thông tin bài đăng sau khi cập nhật
     */
    @PutMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật bài đăng", description = "Cập nhật thông tin bài đăng (chỉ tác giả mới có quyền)")
    public ResponseEntity<CommunityPostDTO> updatePost(@PathVariable String postId, @RequestBody CommunityPostDTO postDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(postService.updatePost(postId, postDTO, userId));
    }

    /**
     * Xóa bài đăng
     *
     * @param postId ID của bài đăng cần xóa
     * @return Thông báo xác nhận xóa thành công
     */
    @DeleteMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa bài đăng", description = "Xóa bài đăng theo ID (chỉ tác giả hoặc admin có quyền)")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable String postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        postService.deletePost(postId, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Bài đăng đã được xóa thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * Ghim hoặc bỏ ghim bài đăng
     *
     * @param postId ID của bài đăng cần ghim/bỏ ghim
     * @return Thông tin bài đăng sau khi thực hiện
     */
    @PostMapping("/{postId}/pin")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    @Operation(summary = "Ghim/bỏ ghim bài đăng", description = "Ghim hoặc bỏ ghim bài đăng (chỉ admin hoặc y tá)")
    public ResponseEntity<CommunityPostDTO> togglePin(@PathVariable String postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(postService.togglePin(postId, userId));
    }

    /**
     * Thích bài đăng
     *
     * @param postId ID của bài đăng cần thích
     * @return Thông tin bài đăng sau khi thực hiện
     */
    @PostMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Thích bài đăng", description = "Thích bài đăng")
    public ResponseEntity<CommunityPostDTO> likePost(@PathVariable String postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(postService.likePost(postId, userId));
    }

    /**
     * Bỏ thích bài đăng
     *
     * @param postId ID của bài đăng cần bỏ thích
     * @return Thông tin bài đăng sau khi thực hiện
     */
    @DeleteMapping("/{postId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Bỏ thích bài đăng", description = "Bỏ thích bài đăng")
    public ResponseEntity<CommunityPostDTO> unlikePost(@PathVariable String postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(postService.unlikePost(postId, userId));
    }
}

