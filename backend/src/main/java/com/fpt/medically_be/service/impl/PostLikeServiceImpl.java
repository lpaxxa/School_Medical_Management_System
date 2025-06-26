package com.fpt.medically_be.service.impl;

import com.fpt.medically_be.entity.AccountMember;
import com.fpt.medically_be.entity.Post;
import com.fpt.medically_be.entity.PostLike;
import com.fpt.medically_be.repos.AccountMemberRepository;
import com.fpt.medically_be.repos.PostLikeRepository;
import com.fpt.medically_be.repos.PostRepository;
import com.fpt.medically_be.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PostLikeServiceImpl implements PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    public boolean toggleLike(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        boolean isLiked = postLikeRepository.existsByPostAndUser(post, user);

        if (isLiked) {
            // Bỏ thích
            postLikeRepository.deleteByPostAndUser(post, user);
            post.setLikes(Math.max(0, post.getLikes() - 1));
            postRepository.save(post);
            return false;
        } else {
            // Thích
            PostLike postLike = PostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            postLikeRepository.save(postLike);
            post.setLikes(post.getLikes() + 1);
            postRepository.save(post);
            return true;
        }
    }

    @Override
    public boolean isPostLikedByUser(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return postLikeRepository.existsByPostAndUser(post, user);
    }

    @Override
    public long getPostLikesCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        return postLikeRepository.countByPost(post);
    }
}
