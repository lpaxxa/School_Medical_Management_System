//package com.fpt.medically_be.service;
//
//import com.fpt.medically_be.dto.CommentDTO;
//import com.fpt.medically_be.dto.CommunityPostDTO;
//
//import java.util.List;
//
//public interface CommunityPostService {
//    List<CommunityPostDTO> getAllPosts();
//    CommunityPostDTO getPostById(Long id);
//    List<CommunityPostDTO> getPostsByCategory(String category);
//    List<CommunityPostDTO> getPostsByAuthorRole(String role);
//    List<CommunityPostDTO> searchPosts(String searchTerm);
//    CommunityPostDTO createPost(CommunityPostDTO postDTO, String username);
//    CommunityPostDTO updatePost(Long id, CommunityPostDTO postDTO, String username);
//    void deletePost(Long id, String username);
//    CommunityPostDTO pinPost(Long id);
//    CommunityPostDTO unpinPost(Long id);
//    CommunityPostDTO likePost(Long id, String username);
//    CommunityPostDTO unlikePost(Long id, String username);
//
//    // Comment operations
//    CommentDTO addComment(Long postId, CommentDTO commentDTO, String username);
//    CommentDTO updateComment(Long commentId, CommentDTO commentDTO, String username);
//    void deleteComment(Long commentId, String username);
//    CommentDTO pinComment(Long commentId, Long postId, String username);
//    CommentDTO unpinComment(Long commentId, String username);
//    CommentDTO likeComment(Long commentId, String username);
//    CommentDTO unlikeComment(Long commentId, String username);
//    List<CommentDTO> getCommentsByPostId(Long postId);
//
//    // Additional methods for like status
//    boolean isPostLikedByUser(Long postId, String username);
//    boolean isCommentLikedByUser(Long commentId, String username);
//    List<Long> getLikedPostIdsByUser(String username);
//    List<Long> getLikedCommentIdsByUser(String username);
//}
//
