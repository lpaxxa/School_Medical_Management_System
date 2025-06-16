package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.CommunityCommentDTO;
import com.fpt.medically_be.service.CommunityCommentService;
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
 * Controller xử lý các API liên quan đến bình luận trong cộng đồng
 * Cung cấp các endpoint để xem, tạo, cập nhật và xóa bình luận
 */
@RestController
@RequestMapping("/api/community")
@Tag(name = "Bình luận cộng đồng", description = "API quản lý bình luận trong cộng đồng sức khỏe học đường")
public class CommunityCommentController {

    private final CommunityCommentService commentService;

    @Autowired
    public CommunityCommentController(CommunityCommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * Lấy danh sách bình luận của một bài đăng
     *
     * @param postId ID của bài đăng
     * @param sortBy Tiêu chí sắp xếp: "latest" (mới nhất), "oldest" (cũ nhất), "likes" (nhiều lượt thích)
     * @return Danh sách bình luận của bài đăng
     */
    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "Lấy bình luận theo bài đăng", description = "Trả về danh sách bình luận của một bài đăng")
    public ResponseEntity<List<CommunityCommentDTO>> getCommentsByPostId(
            @PathVariable String postId,
            @RequestParam(defaultValue = "latest") String sortBy) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId, sortBy));
    }

    /**
     * Tạo bình luận mới
     *
     * @param postId ID của bài đăng được bình luận
     * @param commentDTO Thông tin bình luận cần tạo
     * @return Thông tin bình luận đã tạo
     */
    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo bình luận mới", description = "Tạo một bình luận mới cho bài đăng")
    public ResponseEntity<CommunityCommentDTO> createComment(
            @PathVariable String postId,
            @RequestBody CommunityCommentDTO commentDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.createComment(postId, commentDTO, userId));
    }

    /**
     * Cập nhật nội dung bình luận
     *
     * @param commentId ID của bình luận cần cập nhật
     * @param commentDTO Thông tin mới của bình luận
     * @return Thông tin bình luận sau khi cập nhật
     */
    @PutMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật bình luận", description = "Cập nhật nội dung bình luận (chỉ tác giả mới có quyền)")
    public ResponseEntity<CommunityCommentDTO> updateComment(
            @PathVariable String commentId,
            @RequestBody CommunityCommentDTO commentDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(commentService.updateComment(commentId, commentDTO, userId));
    }

    /**
     * Xóa bình luận
     *
     * @param commentId ID của bình luận cần xóa
     * @return Thông báo xác nhận xóa thành công
     */
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa bình luận", description = "Xóa bình luận theo ID (chỉ tác giả hoặc admin có quyền)")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable String commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        commentService.deleteComment(commentId, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Bình luận đã được xóa thành công");
        return ResponseEntity.ok(response);
    }

    /**
     * Ghim hoặc bỏ ghim bình luận
     *
     * @param commentId ID của bình luận cần ghim/bỏ ghim
     * @return Thông tin bình luận sau khi thực hiện
     */
    @PostMapping("/comments/{commentId}/pin")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Ghim/bỏ ghim bình luận", description = "Ghim hoặc bỏ ghim bình luận (chỉ dành cho tác giả bài đăng, admin hoặc y tá)")
    public ResponseEntity<CommunityCommentDTO> togglePinComment(@PathVariable String commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(commentService.togglePinComment(commentId, userId));
    }

    /**
     * Thích bình luận
     *
     * @param commentId ID của bình luận cần thích
     * @return Thông tin bình luận sau khi thực hiện
     */
    @PostMapping("/comments/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Thích bình luận", description = "Thích một bình luận")
    public ResponseEntity<CommunityCommentDTO> likeComment(@PathVariable String commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(commentService.likeComment(commentId, userId));
    }

    /**
     * Bỏ thích bình luận
     *
     * @param commentId ID của bình luận cần bỏ thích
     * @return Thông tin bình luận sau khi thực hiện
     */
    @DeleteMapping("/comments/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Bỏ thích bình luận", description = "Bỏ thích một bình luận")
    public ResponseEntity<CommunityCommentDTO> unlikeComment(@PathVariable String commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();

        return ResponseEntity.ok(commentService.unlikeComment(commentId, userId));
    }
}

