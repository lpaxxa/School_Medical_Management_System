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
@Transactional
public class BookmarkServiceImpl implements BookmarkService {

    private final PostBookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;
    private final PostMapper postMapper;

    @Override
    public boolean toggleBookmark(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        boolean isBookmarked = bookmarkRepository.existsByPostAndUser(post, user);

        if (isBookmarked) {
            // Bỏ ghim
            bookmarkRepository.deleteByPostAndUser(post, user);
            return false;
        } else {
            // Ghim
            PostBookmark bookmark = PostBookmark.builder()
                    .post(post)
                    .user(user)
                    .build();
            bookmarkRepository.save(bookmark);
            return true;
        }
    }

    @Override
    public boolean isPostBookmarkedByUser(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return bookmarkRepository.existsByPostAndUser(post, user);
    }

    @Override
    public PageResponse<PostDTO> getUserBookmarkedPosts(String userId, int page, int size) {
        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PostBookmark> bookmarksPage = bookmarkRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        List<PostDTO> postDTOs = bookmarksPage.getContent().stream()
                .map(bookmark -> postMapper.toDTO(bookmark.getPost()))
                .collect(Collectors.toList());

        return PageResponse.<PostDTO>builder()
                .content(postDTOs)
                .page(page)
                .size(size)
                .totalElements(bookmarksPage.getTotalElements())
                .totalPages(bookmarksPage.getTotalPages())
                .first(bookmarksPage.isFirst())
                .last(bookmarksPage.isLast())
                .build();
    }
}
