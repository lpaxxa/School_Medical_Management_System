package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostBookmark;
import com.fpt.medically_be.mapper.PostMapper;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.PostBookmarkRepository;
import com.fpt.medically_be.repos.PostRepository;
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
public class BookmarkServiceImpl implements BookmarkService {

    private final PostBookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final PostMapper postMapper;

    @Override
    @Transactional
    public boolean toggleBookmark(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        boolean bookmarked = false;

        // Kiểm tra xem người dùng đã ghim bài viết này chưa
        if (bookmarkRepository.existsByPostAndUser(post, user)) {
            // Nếu đã ghim rồi thì bỏ ghim
            bookmarkRepository.deleteByPostAndUser(post, user);
            bookmarked = false;
        } else {
            // Nếu chưa ghim thì thêm bookmark mới
            PostBookmark bookmark = PostBookmark.builder()
                    .post(post)
                    .user(user)
                    .build();
            bookmarkRepository.save(bookmark);
            bookmarked = true;
        }

        return bookmarked;
    }

    @Override
    public boolean isPostBookmarkedByUser(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return bookmarkRepository.existsByPostAndUser(post, user);
    }

    @Override
    public PageResponse<PostDTO> getUserBookmarkedPosts(String userId, int page, int size) {
        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PostBookmark> bookmarks = bookmarkRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        List<PostDTO> postDTOs = bookmarks.getContent().stream()
                .map(bookmark -> postMapper.toDTO(bookmark.getPost()))
                .collect(Collectors.toList());

        return PageResponse.<PostDTO>builder()
                .totalItems(bookmarks.getTotalElements())
                .totalPages(bookmarks.getTotalPages())
                .currentPage(page)
                .posts(postDTOs)
                .build();
    }
}
