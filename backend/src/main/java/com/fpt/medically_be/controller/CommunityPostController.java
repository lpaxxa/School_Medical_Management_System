//package com.fpt.medically_be.controller;
//
//import com.fpt.medically_be.dto.CommentDTO;
//import com.fpt.medically_be.dto.CommunityPostDTO;
//import com.fpt.medically_be.service.CommunityPostService;
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
//@RequestMapping("/api/community")
//@Tag(name = "Community", description = "API điều khiển tính năng cộng đồng sức khỏe học đường")
//public class CommunityPostController {
//
//    private final CommunityPostService communityPostService;
//
//    @Autowired
//    public CommunityPostController(CommunityPostService communityPostService) {
//        this.communityPostService = communityPostService;
//    }
//
//    // ...existing code...
//
//    @GetMapping("/{id}/like/status")
//    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Kiểm tra trạng thái thích của bài viết đối với người dùng hiện tại")
//    public ResponseEntity<Boolean> isPostLikedByCurrentUser(@PathVariable Long id, Authentication authentication) {
//        return ResponseEntity.ok(communityPostService.isPostLikedByUser(id, authentication.getName()));
//    }
//
//    @GetMapping("/comments/{commentId}/like/status")
//    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Kiểm tra trạng thái thích của bình luận đối với người dùng hiện tại")
//    public ResponseEntity<Boolean> isCommentLikedByCurrentUser(@PathVariable Long commentId, Authentication authentication) {
//        return ResponseEntity.ok(communityPostService.isCommentLikedByUser(commentId, authentication.getName()));
//    }
//
//    @GetMapping("/likes/posts")
//    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Lấy danh sách ID bài viết mà người dùng hiện tại đã thích")
//    public ResponseEntity<List<Long>> getLikedPostIdsByCurrentUser(Authentication authentication) {
//        return ResponseEntity.ok(communityPostService.getLikedPostIdsByUser(authentication.getName()));
//    }
//
//    @GetMapping("/likes/comments")
//    @PreAuthorize("hasRole('PARENT') or hasRole('NURSE') or hasRole('ADMIN')")
//    @Operation(summary = "Lấy danh sách ID bình luận mà người dùng hiện tại đã thích")
//    public ResponseEntity<List<Long>> getLikedCommentIdsByCurrentUser(Authentication authentication) {
//        return ResponseEntity.ok(communityPostService.getLikedCommentIdsByUser(authentication.getName()));
//    }
//}
//
