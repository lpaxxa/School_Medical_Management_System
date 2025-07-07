package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.dto.PostUpdateDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.mapper.PostMapper;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.PostRepository;
import com.fpt.medically_be.service.PostService;
import com.fpt.medically_be.service.PostLikeService;
import com.fpt.medically_be.service.BookmarkService;
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
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final PostMapper postMapper;
    private final PostLikeService postLikeService;
    private final BookmarkService bookmarkService;

    @Override
    public PageResponse<PostDTO> getAllPosts(int page, int size) {
        return getAllPosts(page, size, null);
    }

    public PageResponse<PostDTO> getAllPosts(int page, int size, String currentUserId) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Post> postsPage = postRepository.findByIsDeletedFalseOrderByIsPinnedDescCreatedAtDesc(pageable);

        List<PostDTO> postDTOs = postsPage.getContent().stream()
                .map(post -> {
                    boolean isLiked = false;
                    boolean isBookmarked = false;

                    if (currentUserId != null) {
                        isLiked = postLikeService.isPostLikedByUser(post.getId(), currentUserId);
                        isBookmarked = bookmarkService.isPostBookmarkedByUser(post.getId(), currentUserId);
                    }

                    return postMapper.toDTO(post, currentUserId, isLiked, isBookmarked);
                })
                .collect(Collectors.toList());

        return PageResponse.<PostDTO>builder()
                .content(postDTOs)
                .page(page)
                .size(size)
                .totalElements(postsPage.getTotalElements())
                .totalPages(postsPage.getTotalPages())
                .first(postsPage.isFirst())
                .last(postsPage.isLast())
                .build();
    }

    @Override
    public PostDTO getPostById(Long postId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));

        PostDTO postDTO = postMapper.toDTO(post);

        // Thêm bài viết liên quan (chỉ lấy các bài viết chưa bị xóa)
        List<Post> relatedPosts = postRepository.findTop5ByIdNotAndCategoryAndIsDeletedFalseOrderByCreatedAtDesc(
                postId, post.getCategory());
        List<PostDTO.RelatedPostDTO> relatedPostDTOs = relatedPosts.stream()
                .map(postMapper::toRelatedPostDTO)
                .collect(Collectors.toList());

        postDTO.setRelatedPosts(relatedPostDTOs);

        return postDTO;
    }

    @Override
    public PostDTO createPost(PostDTO postDTO, String authorId) {
        AccountMember author = accountMemberRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Post post = Post.builder()
                .title(postDTO.getTitle())
                .excerpt(postDTO.getExcerpt())
                .content(postDTO.getContent())
                .category(postDTO.getCategory())
                .author(author)
                .isPinned(postDTO.isPinned())
                .tags(postDTO.getTags())
                .build();

        Post savedPost = postRepository.save(post);
        return postMapper.toDTO(savedPost);
    }

    @Override
    public PostDTO updatePost(Long postId, PostUpdateDTO postUpdateDTO, String currentUserId) {
        // Find the existing post (only non-deleted posts)
        Post existingPost = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));

        // Verify that the current user is the author of the post (authorization check)
        if (!existingPost.getAuthor().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        // Update only the allowed fields: title, excerpt, content, category
        if (postUpdateDTO.getTitle() != null && !postUpdateDTO.getTitle().trim().isEmpty()) {
            existingPost.setTitle(postUpdateDTO.getTitle());
        }
        if (postUpdateDTO.getExcerpt() != null && !postUpdateDTO.getExcerpt().trim().isEmpty()) {
            existingPost.setExcerpt(postUpdateDTO.getExcerpt());
        }
        if (postUpdateDTO.getContent() != null && !postUpdateDTO.getContent().trim().isEmpty()) {
            existingPost.setContent(postUpdateDTO.getContent());
        }
        if (postUpdateDTO.getCategory() != null && !postUpdateDTO.getCategory().trim().isEmpty()) {
            existingPost.setCategory(postUpdateDTO.getCategory());
        }
        if (postUpdateDTO.getTags() != null) {
            existingPost.setTags(postUpdateDTO.getTags());
        }
        

        // Save the updated post (updatedAt will be automatically set by @PreUpdate)
        Post updatedPost = postRepository.save(existingPost);
        return postMapper.toDTO(updatedPost);
    }

    @Override
    public PostDTO convertToDTO(Post post) {
        return postMapper.toDTO(post);
    }

    @Override
    public void deletePost(Long postId) {
        Post post = postRepository.findByIdAndIsDeletedFalse(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));

        // Soft delete related data first
        postLikeService.deleteLikesByPostId(post.getId());
        bookmarkService.deleteBookmarksByPostId(post.getId());

        // Soft delete the post
        postRepository.softDeleteById(post.getId());
    }
}
