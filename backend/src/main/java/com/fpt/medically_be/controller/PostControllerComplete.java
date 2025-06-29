package com.fpt.medically_be.controller;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.service.PostService;
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
@Tag(name = "Cẩm nang y tế", description = "API quản lý cẩm nang/tin tức y tế do y tá đăng và phụ huynh đọc")
public class PostControllerComplete {

    private final PostService postService;

    @Operation(summary = "Lấy danh sách cẩm nang y tế", description = "Trả về danh sách các cẩm nang y tế được phân trang")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = PageResponse.class))),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content)
    })
    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<PostDTO> pageResponse = postService.getAllPosts(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", pageResponse);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Xem chi tiết cẩm nang y tế", description = "Trả về thông tin chi tiết của một cẩm nang y tế cụ thể theo ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lấy thông tin thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = PostDTO.class))),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy cẩm nang", content = @Content)
    })
    @GetMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> getPostById(@PathVariable Long postId) {
        PostDTO postDTO = postService.getPostById(postId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", postDTO);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Đăng cẩm nang y tế mới", description = "Cho phép y tá tạo cẩm nang y tế mới")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Tạo cẩm nang thành công",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = PostDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ", content = @Content),
        @ApiResponse(responseCode = "401", description = "Chưa xác thực", content = @Content),
        @ApiResponse(responseCode = "403", description = "Không có quyền thực hiện", content = @Content)
    })
    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(@RequestBody PostDTO postDTO) {
        // Lấy thông tin người dùng hiện tại từ context bảo mật
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName(); // Giả sử getName() trả về ID của user

        PostDTO createdPost = postService.createPost(postDTO, currentUserId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", createdPost);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}


