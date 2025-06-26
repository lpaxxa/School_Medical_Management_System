package com.fpt.medically_be.mapper;

import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostMapper {

    public PostDTO toDTO(Post post) {
        return toDTO(post, null, false, false);
    }

    public PostDTO toDTO(Post post, String currentUserId) {
        return toDTO(post, currentUserId, false, false);
    }

    public PostDTO toDTO(Post post, String currentUserId, boolean isLiked, boolean isBookmarked) {
        if (post == null) {
            return null;
        }

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
                .isLiked(isLiked)
                .isBookmarked(isBookmarked)
                .tags(post.getTags())
                .build();
    }

    public PostDTO.AuthorDTO convertToAuthorDTO(AccountMember author) {
        if (author == null) {
            return null;
        }

        return PostDTO.AuthorDTO.builder()
                .id(author.getId())
                .name(author.getUsername())
                .avatar("/images/avatars/default.jpg") // Giá trị mặc định
                .role(author.getRole().name())
                .bio("") // Bio không có sẵn trong AccountMember
                .build();
    }

    public PostDTO.RelatedPostDTO toRelatedPostDTO(Post post) {
        if (post == null) {
            return null;
        }

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
