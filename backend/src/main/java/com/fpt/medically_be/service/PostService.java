package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.mapper.PostMapper;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final PostLikeService postLikeService;
    private final PostMapper postMapper;

    public PageResponse<PostDTO> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Post> postPage = postRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(pageable);

        List<PostDTO> postDTOs = postPage.getContent().stream()
                .map(postMapper::toDTO)
                .collect(Collectors.toList());

        return PageResponse.<PostDTO>builder()
                .totalItems(postPage.getTotalElements())
                .totalPages(postPage.getTotalPages())
                .currentPage(page)
                .posts(postDTOs)
                .build();
    }

    public PostDTO getPostById(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        PostDTO postDTO = postMapper.toDTO(post);

        // Get related posts
        List<Post> relatedPosts = postRepository.findTop5ByIdNotAndCategoryOrderByCreatedAtDesc(
                postId, post.getCategory());

        List<PostDTO.RelatedPostDTO> relatedPostDTOs = relatedPosts.stream()
                .map(postMapper::toRelatedPostDTO)
                .collect(Collectors.toList());

        postDTO.setRelatedPosts(relatedPostDTOs);

        // Kiểm tra xem người dùng hiện tại đã thích bài viết này chưa
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String currentUserId = authentication.getName();
                postDTO.setLikedByCurrentUser(postLikeService.isPostLikedByUser(postId, currentUserId));

                // Để trạng thái bookmark được xử lý bởi BookmarkService qua API riêng
                postDTO.setBookmarkedByCurrentUser(false);
            }
        } catch (Exception e) {
            // Xử lý ngoại lệ nếu có
            postDTO.setLikedByCurrentUser(false);
            postDTO.setBookmarkedByCurrentUser(false);
        }

        return postDTO;
    }

    public PostDTO createPost(PostDTO postDTO, String authorId) {
        // Lấy thông tin tác giả từ repository
        AccountMember author = accountMemberRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorId));

        Post post = Post.builder()
                .title(postDTO.getTitle())
                .excerpt(postDTO.getExcerpt())
                .content(postDTO.getContent())
                .category(postDTO.getCategory())
                .author(author)
                .isPinned(postDTO.isPinned())
                .likes(0)
                .commentsCount(0)
                .tags(postDTO.getTags())
                .build();

        Post savedPost = postRepository.save(post);
        return postMapper.toDTO(savedPost);
    }

    public PostDTO convertToDTO(Post post) {
        return postMapper.toDTO(post);
    }
}
