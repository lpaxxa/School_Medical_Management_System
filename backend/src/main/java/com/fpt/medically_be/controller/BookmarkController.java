package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
@Tag(name = "Ghim bài viết", description = "API quản lý ghim bài viết yêu thích")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @Operation(summary = "Ghim/Bỏ ghim bài viết", description = "Chuyển đổi trạng thái ghim của người dùng đối với bài viết")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thực hiện thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết")
    })
    @PostMapping("/posts/{postId}/bookmark")
    public ResponseEntity<Map<String, Object>> toggleBookmark(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isBookmarked = bookmarkService.toggleBookmark(postId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of("bookmarked", isBookmarked));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Kiểm tra trạng thái ghim", description = "Kiểm tra xem người dùng hiện tại đã ghim bài viết hay chưa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Kiểm tra thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết")
    })
    @GetMapping("/posts/{postId}/bookmark")
    public ResponseEntity<Map<String, Object>> checkBookmarkStatus(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isBookmarked = bookmarkService.isPostBookmarkedByUser(postId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of("bookmarked", isBookmarked));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy danh sách bài viết đã ghim", description = "Lấy danh sách các bài viết mà người dùng hiện tại đã ghim")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực")
    })
    @GetMapping("/bookmarks")
    public ResponseEntity<Map<String, Object>> getBookmarkedPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        PageResponse<PostDTO> pageResponse = bookmarkService.getUserBookmarkedPosts(currentUserId, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);

        return ResponseEntity.ok(response);
    }
}
