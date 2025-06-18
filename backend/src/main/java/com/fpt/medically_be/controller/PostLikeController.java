package com.fpt.medically_be.controller;

import com.fpt.medically_be.service.PostLikeService;
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
@Tag(name = "Lượt thích bài viết", description = "API quản lý lượt thích (tym) trên các bài viết cộng đồng")
public class PostLikeController {

    private final PostLikeService postLikeService;

    @Operation(summary = "Thích/Bỏ thích bài viết", description = "Chuyển đổi trạng thái thích của người dùng đối với bài viết")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thực hiện thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết")
    })
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isLiked = postLikeService.toggleLike(postId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of(
                "liked", isLiked,
                "likesCount", postLikeService.getPostLikesCount(postId)
        ));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Kiểm tra trạng thái thích", description = "Kiểm tra xem người dùng hiện tại đã thích bài viết hay chưa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Kiểm tra thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết")
    })
    @GetMapping("/posts/{postId}/like")
    public ResponseEntity<Map<String, Object>> checkLikeStatus(@PathVariable Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isLiked = postLikeService.isPostLikedByUser(postId, currentUserId);
        long likesCount = postLikeService.getPostLikesCount(postId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of(
                "liked", isLiked,
                "likesCount", likesCount
        ));

        return ResponseEntity.ok(response);
    }
}
