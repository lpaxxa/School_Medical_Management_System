package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.CommentDTO;
import com.fpt.medically_be.dto.CommentRequest;
import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostComment;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.PostCommentRepository;
import com.fpt.medically_be.repos.PostRepository;
import com.fpt.medically_be.service.CommentLikeService;
import com.fpt.medically_be.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final PostCommentRepository commentRepository;
    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final CommentLikeService commentLikeService;

    @Override
    public PageResponse<CommentDTO> getPostComments(Long postId, int page, int size) {
        return getPostComments(postId, page, size, null);
    }

    public PageResponse<CommentDTO> getPostComments(Long postId, int page, int size, String currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PostComment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post, pageable);

        List<CommentDTO> commentDTOs = comments.getContent().stream()
                .map(comment -> convertToDTO(comment, currentUserId))
                .collect(Collectors.toList());

        return PageResponse.<CommentDTO>builder()
                .content(commentDTOs)
                .page(page)
                .size(size)
                .totalElements(comments.getTotalElements())
                .totalPages(comments.getTotalPages())
                .first(comments.isFirst())
                .last(comments.isLast())
                .build();
    }

    @Override
    public CommentDTO createComment(Long postId, CommentRequest commentRequest, String authorId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        AccountMember author = accountMemberRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        PostComment comment = PostComment.builder()
                .post(post)
                .author(author)
                .content(commentRequest.getContent())
                .build();

        PostComment savedComment = commentRepository.save(comment);

        // Cập nhật số lượng bình luận trong bài viết
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return convertToDTO(savedComment);
    }

    @Override
    public CommentDTO updateComment(Long commentId, CommentRequest commentRequest, String userId) {
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa bình luận này");
        }

        comment.setContent(commentRequest.getContent());
        PostComment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    @Override
    public void deleteComment(Long commentId, String userId) {
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này");
        }

        Post post = comment.getPost();
        commentRepository.delete(comment);

        // Cập nhật số lượng bình luận trong bài viết
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
    }

    private CommentDTO convertToDTO(PostComment comment) {
        return convertToDTO(comment, null);
    }

    private CommentDTO convertToDTO(PostComment comment, String currentUserId) {
        boolean isLiked = false;
        if (currentUserId != null) {
            isLiked = commentLikeService.isCommentLikedByUser(comment.getId(), currentUserId);
        }

        return CommentDTO.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .likesCount(comment.getLikesCount())
                .repliesCount(comment.getRepliesCount())
                .isLiked(isLiked)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(CommentDTO.AuthorDTO.builder()
                        .id(comment.getAuthor().getId())
                        .name(comment.getAuthor().getUsername())
                        .avatar("/images/avatars/default.jpg")
                        .role(comment.getAuthor().getRole().name())
                        .build())
                .build();
    }
}
