package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
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

    public PageResponse<PostDTO> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Post> postPage = postRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(pageable);

        List<PostDTO> postDTOs = postPage.getContent().stream()
                .map(this::convertToDTO)
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

        PostDTO postDTO = convertToDTO(post);

        // Get related posts
        List<Post> relatedPosts = postRepository.findTop5ByIdNotAndCategoryOrderByCreatedAtDesc(
                postId, post.getCategory());

        List<PostDTO.RelatedPostDTO> relatedPostDTOs = relatedPosts.stream()
                .map(this::convertToRelatedPostDTO)
                .collect(Collectors.toList());

        postDTO.setRelatedPosts(relatedPostDTOs);

        // Set if the current user has liked the post
        // This would need to be implemented with a proper like tracking system
        postDTO.setLikedByCurrentUser(false);

        return postDTO;
    }

    public PostDTO createPost(PostDTO postDTO, String authorId) {
        // Lấy thông tin tác giả từ repository thay vì tạo mới
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
        return convertToDTO(savedPost);
    }

    private PostDTO convertToDTO(Post post) {
        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .excerpt(post.getExcerpt())
                .content(post.getContent())
                .category(post.getCategory())
                .author(convertToAuthorDTO(post.getAuthor()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .likes(post.getLikes())
                .commentsCount(post.getCommentsCount())
                .isPinned(post.isPinned())
                .tags(post.getTags())
                .build();
    }

    private PostDTO.AuthorDTO convertToAuthorDTO(AccountMember author) {
        return PostDTO.AuthorDTO.builder()
                .id(author.getId()) // Sử dụng String ID thay vì chuyển đổi sang Long
                .name(author.getUsername())
                .avatar("/images/avatars/default.jpg") // Setting a default avatar
                .role(author.getRole().name())
                .bio("") // Empty bio since it's not available in AccountMember
                .build();
    }

    private PostDTO.RelatedPostDTO convertToRelatedPostDTO(Post post) {
        return PostDTO.RelatedPostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .category(post.getCategory())
                .author(convertToAuthorDTO(post.getAuthor()))
                .likes(post.getLikes())
                .commentsCount(post.getCommentsCount())
                .build();
    }
}
