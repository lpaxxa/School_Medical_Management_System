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
public class PostLikeServiceImpl implements PostLikeService {

    private final PostLikeRepository likeRepository;
    private final PostRepository postRepository;
    private final AccountMemberRepository accountMemberRepository;

    @Override
    @Transactional
    public boolean toggleLike(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        boolean liked = false;

        // Kiểm tra xem người dùng đã thích bài viết này chưa
        if (likeRepository.existsByPostAndUser(post, user)) {
            // Nếu đã thích rồi thì xóa like
            likeRepository.deleteByPostAndUser(post, user);
            liked = false;
        } else {
            // Nếu chưa thích thì thêm like mới
            PostLike like = PostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            likeRepository.save(like);
            liked = true;
        }

        // Cập nhật số lượng like trong bài viết
        post.setLikes((int)likeRepository.countByPost(post));
        postRepository.save(post);

        return liked;
    }

    @Override
    public boolean isPostLikedByUser(Long postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        AccountMember user = accountMemberRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return likeRepository.existsByPostAndUser(post, user);
    }

    @Override
    public long getPostLikesCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        return likeRepository.countByPost(post);
    }
}
