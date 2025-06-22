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
public class CommentServiceImpl implements CommentService {

    private final PostCommentRepository commentRepository;
    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    public PageResponse<CommentDTO> getPostComments(Long postId, int page, int size) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PostComment> comments = commentRepository.findByPostOrderByCreatedAtDesc(post, pageable);

        List<CommentDTO> commentDTOs = comments.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return PageResponse.<CommentDTO>builder()
                .totalItems(comments.getTotalElements())
                .totalPages(comments.getTotalPages())
                .currentPage(page)
                .posts(commentDTOs) // Mặc dù tên field là "posts", nhưng chúng ta sẽ sử dụng nó cho comments
                .build();
    }

    @Override
    @Transactional
    public CommentDTO createComment(Long postId, CommentRequest commentRequest, String authorId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        AccountMember author = accountMemberRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));

        PostComment comment = PostComment.builder()
                .post(post)
                .author(author)
                .content(commentRequest.getContent())
                .build();

        PostComment savedComment = commentRepository.save(comment);

        // Cập nhật số lượng bình luận trong bài viết
        post.setCommentsCount((int)commentRepository.countByPost(post));
        postRepository.save(post);

        return convertToDTO(savedComment);
    }

    @Override
    @Transactional
    public CommentDTO updateComment(Long commentId, CommentRequest commentRequest, String userId) {
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Kiểm tra xem người dùng có quyền sửa bình luận không
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this comment");
        }

        comment.setContent(commentRequest.getContent());
        PostComment updatedComment = commentRepository.save(comment);

        return convertToDTO(updatedComment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String userId) {
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Kiểm tra xem người dùng có quyền xóa bình luận không
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }

        Post post = comment.getPost();
        commentRepository.delete(comment);

        // Cập nhật số lượng bình luận trong bài viết
        post.setCommentsCount((int)commentRepository.countByPost(post));
        postRepository.save(post);
    }

    private CommentDTO convertToDTO(PostComment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(convertToAuthorDTO(comment.getAuthor()))
                .build();
    }

    private CommentDTO.AuthorDTO convertToAuthorDTO(AccountMember author) {
        return CommentDTO.AuthorDTO.builder()
                .id(author.getId())
                .name(author.getUsername())
                .avatar("/images/avatars/default.jpg") // Giá trị mặc định
                .role(author.getRole().name())
                .build();
    }
}
