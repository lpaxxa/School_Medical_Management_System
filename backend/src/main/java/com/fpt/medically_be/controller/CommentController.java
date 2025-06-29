package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.CommentDTO;
import com.fpt.medically_be.dto.CommentRequest;
import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.service.CommentService;
import com.fpt.medically_be.service.impl.CommentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
@Tag(name = "Bình luận bài viết", description = "API quản lý bình luận trên các bài viết cộng đồng")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "Lấy danh sách bình luận", description = "Trả về danh sách các bình luận của bài viết được phân trang")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy danh sách bình luận thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = PageResponse.class))),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết", content = @Content)
    })
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Map<String, Object>> getPostComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Gọi method với currentUserId để kiểm tra trạng thái liked
        PageResponse<CommentDTO> pageResponse =
            ((CommentServiceImpl) commentService).getPostComments(postId, page, size, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Tạo bình luận mới", description = "Tạo bình luận mới cho bài viết")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Tạo bình luận thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết", content = @Content)
    })
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Map<String, Object>> createComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest commentRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        CommentDTO createdComment = commentService.createComment(postId, commentRequest, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", createdComment);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Cập nhật bình luận", description = "Cập nhật nội dung bình luận hiện có")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cập nhật bình luận thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "403", description = "Không có quyền cập nhật", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bình luận", content = @Content)
    })
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest commentRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        CommentDTO updatedComment = commentService.updateComment(commentId, commentRequest, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", updatedComment);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xóa bình luận", description = "Xóa bình luận hiện có")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xóa bình luận thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "403", description = "Không có quyền xóa", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bình luận", content = @Content)
    })
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        commentService.deleteComment(commentId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Bình luận đã được xóa thành công");

        return ResponseEntity.ok(response);
    }
}
