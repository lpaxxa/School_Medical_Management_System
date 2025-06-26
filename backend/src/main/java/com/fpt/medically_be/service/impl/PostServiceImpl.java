package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
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
        Page<Post> postsPage = postRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(pageable);

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
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + postId));

        PostDTO postDTO = postMapper.toDTO(post);

        // Thêm bài viết liên quan
        List<Post> relatedPosts = postRepository.findTop5ByIdNotAndCategoryOrderByCreatedAtDesc(
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
    public PostDTO convertToDTO(Post post) {
        return postMapper.toDTO(post);
    }
}
