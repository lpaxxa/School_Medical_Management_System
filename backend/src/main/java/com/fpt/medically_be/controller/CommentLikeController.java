package com.fpt.medically_be.controller;

import com.fpt.medically_be.service.CommentLikeService;
import com.fpt.medically_be.service.CommentReplyLikeService;
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
@Tag(name = "Lượt thích bình luận", description = "API quản lý lượt thích trên bình luận và phản hồi bình luận")
public class CommentLikeController {

    private final CommentLikeService commentLikeService;
    private final CommentReplyLikeService commentReplyLikeService;

    @Operation(summary = "Thích/Bỏ thích bình luận", description = "Chuyển đổi trạng thái thích của người dùng đối với bình luận")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thực hiện thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bình luận")
    })
    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<Map<String, Object>> toggleCommentLike(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isLiked = commentLikeService.toggleCommentLike(commentId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of(
                "liked", isLiked,
                "likesCount", commentLikeService.getCommentLikesCount(commentId)
        ));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Kiểm tra trạng thái thích bình luận", description = "Kiểm tra xem người dùng hiện tại đã thích bình luận hay chưa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Kiểm tra thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bình luận")
    })
    @GetMapping("/comments/{commentId}/like")
    public ResponseEntity<Map<String, Object>> checkCommentLikeStatus(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isLiked = commentLikeService.isCommentLikedByUser(commentId, currentUserId);
        long likesCount = commentLikeService.getCommentLikesCount(commentId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of(
                "liked", isLiked,
                "likesCount", likesCount
        ));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Thích/Bỏ thích phản hồi bình luận", description = "Chuyển đổi trạng thái thích của người dùng đối với phản hồi bình luận")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thực hiện thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy phản hồi")
    })
    @PostMapping("/replies/{replyId}/like")
    public ResponseEntity<Map<String, Object>> toggleReplyLike(@PathVariable Long replyId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isLiked = commentReplyLikeService.toggleReplyLike(replyId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of(
                "liked", isLiked,
                "likesCount", commentReplyLikeService.getReplyLikesCount(replyId)
        ));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Kiểm tra trạng thái thích phản hồi", description = "Kiểm tra xem người dùng hiện tại đã thích phản hồi bình luận hay chưa")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Kiểm tra thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực"),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy phản hồi")
    })
    @GetMapping("/replies/{replyId}/like")
    public ResponseEntity<Map<String, Object>> checkReplyLikeStatus(@PathVariable Long replyId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        boolean isLiked = commentReplyLikeService.isReplyLikedByUser(replyId, currentUserId);
        long likesCount = commentReplyLikeService.getReplyLikesCount(replyId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", Map.of(
                "liked", isLiked,
                "likesCount", likesCount
        ));

        return ResponseEntity.ok(response);
    }
}
