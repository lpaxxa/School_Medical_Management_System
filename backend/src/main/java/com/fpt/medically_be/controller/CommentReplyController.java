package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.CommentReplyDTO;
import com.fpt.medically_be.dto.CommentReplyRequest;
import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.service.CommentReplyService;
import com.fpt.medically_be.service.impl.CommentReplyServiceImpl;
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
@Tag(name = "Phản hồi bình luận", description = "API quản lý phản hồi trên các bình luận")
public class CommentReplyController {

    private final CommentReplyService commentReplyService;

    @Operation(summary = "Lấy danh sách phản hồi của bình luận", description = "Trả về danh sách các phản hồi của một bình luận được phân trang")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy danh sách phản hồi thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = PageResponse.class))),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bình luận", content = @Content)
    })
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<Map<String, Object>> getCommentReplies(
            @PathVariable Long commentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Gọi method với currentUserId để kiểm tra trạng thái liked
        PageResponse<CommentReplyDTO> pageResponse =
            ((CommentReplyServiceImpl) commentReplyService).getCommentReplies(commentId, page, size, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Tạo phản hồi bình luận mới", description = "Tạo phản hồi mới cho một bình luận")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Tạo phản hồi thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentReplyDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy bình luận", content = @Content)
    })
    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<Map<String, Object>> createReply(
            @PathVariable Long commentId,
            @RequestBody CommentReplyRequest replyRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        CommentReplyDTO createdReply = commentReplyService.createReply(commentId, replyRequest, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", createdReply);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Cập nhật phản hồi bình luận", description = "Cập nhật nội dung phản hồi bình luận hiện có")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cập nhật phản hồi thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = CommentReplyDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "403", description = "Không có quyền cập nhật", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy phản hồi", content = @Content)
    })
    @PutMapping("/replies/{replyId}")
    public ResponseEntity<Map<String, Object>> updateReply(
            @PathVariable Long replyId,
            @RequestBody CommentReplyRequest replyRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        CommentReplyDTO updatedReply = commentReplyService.updateReply(replyId, replyRequest, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", updatedReply);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xóa phản hồi bình luận", description = "Xóa phản hồi bình luận hiện có")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Xóa phản hồi thành công"),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "403", description = "Không có quyền xóa", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy phản hồi", content = @Content)
    })
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<Map<String, Object>> deleteReply(@PathVariable Long replyId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        commentReplyService.deleteReply(replyId, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Phản hồi đã được xóa thành công");

        return ResponseEntity.ok(response);
    }
}
