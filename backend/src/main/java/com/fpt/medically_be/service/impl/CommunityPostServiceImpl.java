//package com.fpt.medically_be.service.impl;
//
//import com.fpt.medically_be.dto.CommentDTO;
//import com.fpt.medically_be.dto.CommunityPostDTO;
//import com.fpt.medically_be.dto.UserDTO;
//import com.fpt.medically_be.entity.*;
//import com.fpt.medically_be.repos.*;
//import com.fpt.medically_be.service.CommunityPostService;
//import jakarta.persistence.EntityNotFoundException;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.access.AccessDeniedException;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class CommunityPostServiceImpl implements CommunityPostService {
//
//    private final CommunityPostRepository postRepository;
//    private final CommentRepository commentRepository;
//    private final UserRepository userRepository;
//    private final PostLikeRepository postLikeRepository;
//    private final CommentLikeRepository commentLikeRepository;
//
//    @Autowired
//    public CommunityPostServiceImpl(CommunityPostRepository postRepository,
//                                CommentRepository commentRepository,
//                                UserRepository userRepository,
//                                PostLikeRepository postLikeRepository,
//                                CommentLikeRepository commentLikeRepository) {
//        this.postRepository = postRepository;
//        this.commentRepository = commentRepository;
//        this.userRepository = userRepository;
//        this.postLikeRepository = postLikeRepository;
//        this.commentLikeRepository = commentLikeRepository;
//    }
//
//    // ...existing code...
//
//    @Override
//    @Transactional
//    public CommunityPostDTO likePost(Long id, String username) {
//        CommunityPost post = postRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
//
//        User user = userRepository.findByUsername(username)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
//
//        // Kiểm tra xem người dùng đã thích bài viết này chưa
//        boolean alreadyLiked = postLikeRepository.existsByUserIdAndPostId(user.getId(), post.getId());
//
//        if (!alreadyLiked) {
//            // Nếu chưa thích, thêm vào danh sách thích
//            PostLike like = new PostLike();
//            like.setUser(user);
//            like.setPost(post);
//            postLikeRepository.save(like);
//
//            // Cập nhật số lượng thích trong bài viết
//            post.setLikes(post.getLikes() + 1);
//            postRepository.save(post);
//        }
//
//        return convertToPostDTO(post);
//    }
//
//    @Override
//    @Transactional
//    public CommunityPostDTO unlikePost(Long id, String username) {
//        CommunityPost post = postRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết với ID: " + id));
//
//        User user = userRepository.findByUsername(username)
//                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));
//
//        // Kiểm tra xem người dùng đã thích bài viết này chưa
//        boolean alreadyLiked = postLikeRepository.existsByUserIdAndPostId(user.getId(), post.getId());
//
//        if (alreadyLiked) {
//            // Nếu đã thích, xóa khỏi danh sách thích
//            postLikeRepository.deleteByUserIdAndPostId(user.getId(), post.getId());
//
//            // Cập nhật số lượng thích trong bài viết
//            if (post.getLikes() > 0) {
//                post.setLikes(post.getLikes() - 1);
//                postRepository.save(post);
//            }
//        }
//
//        return convertToPostDTO(post);
//    }
//
//    @Override
//    @Transactional
//    public CommentDTO likeComment(Long commentId, String username) {
//        Comment comment = commentRepository.findById(commentId)
//
