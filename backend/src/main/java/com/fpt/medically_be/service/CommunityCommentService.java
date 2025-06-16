package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.AuthorDTO;
import com.fpt.medically_be.dto.CommunityCommentDTO;
import com.fpt.medically_be.entity.CommunityComment;
import com.fpt.medically_be.entity.CommunityPost;
import com.fpt.medically_be.entity.User;
import com.fpt.medically_be.exception.ResourceNotFoundException;
import com.fpt.medically_be.repos.CommunityCommentRepository;
import com.fpt.medically_be.repos.CommunityPostRepository;
import com.fpt.medically_be.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service xử lý logic nghiệp vụ liên quan đến bình luận trong cộng đồng
 */
@Service
public class CommunityCommentService {

    private final CommunityCommentRepository commentRepository;
    private final CommunityPostRepository postRepository;
    private final UserRepository userRepository;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

    @Autowired
    public CommunityCommentService(CommunityCommentRepository commentRepository,
                                 CommunityPostRepository postRepository,
                                 UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lấy danh sách bình luận của một bài đăng theo tiêu chí sắp xếp
     *
     * @param postId ID của bài đăng
     * @param sortBy Tiêu chí sắp xếp: "latest" (mới nhất), "oldest" (cũ nhất), "likes" (nhiều lượt thích)
     * @return Danh sách bình luận đã sắp xếp
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng với ID cung cấp
     */
    @Transactional(readOnly = true)
    public List<CommunityCommentDTO> getCommentsByPostId(String postId, String sortBy) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        List<CommunityComment> comments;

        switch (sortBy) {
            case "oldest":
                comments = commentRepository.findByPostOrderByCreatedAtAsc(post);
                break;
            case "likes":
                comments = commentRepository.findByPostOrderByLikesCountDesc(post);
                break;
            case "latest":
            default:
                comments = commentRepository.findByPostOrderByIsPinnedDescCreatedAtDesc(post);
                break;
        }

        return comments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tạo bình luận mới
     *
     * @param postId ID của bài đăng được bình luận
     * @param commentDTO Nội dung bình luận
     * @param userId ID của người dùng tạo bình luận
     * @return Thông tin bình luận đã tạo
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng hoặc người dùng
     */
    @Transactional
    public CommunityCommentDTO createComment(String postId, CommunityCommentDTO commentDTO, String userId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        User author = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        CommunityComment comment = new CommunityComment();
        comment.setCommentId("comment" + UUID.randomUUID().toString().substring(0, 6));
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(commentDTO.getContent());
        comment.setCreatedAt(new Date());
        comment.setLikesCount(0);
        comment.setIsPinned(false);

        CommunityComment savedComment = commentRepository.save(comment);

        // Cập nhật số lượng bình luận trong bài đăng
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return convertToDTO(savedComment);
    }

    /**
     * Cập nhật nội dung bình luận
     *
     * @param commentId ID của bình luận cần cập nhật
     * @param commentDTO Nội dung mới của bình luận
     * @param userId ID của người dùng thực hiện (phải là tác giả của bình luận)
     * @return Thông tin bình luận sau khi cập nhật
     * @throws ResourceNotFoundException Nếu không tìm thấy bình luận
     * @throws RuntimeException Nếu người dùng không có quyền sửa bình luận
     */
    @Transactional
    public CommunityCommentDTO updateComment(String commentId, CommunityCommentDTO commentDTO, String userId) {
        CommunityComment comment = commentRepository.findByCommentId(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + commentId));

        // Kiểm tra quyền truy cập
        if (!comment.getAuthor().getId().toString().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa bình luận này");
        }

        comment.setContent(commentDTO.getContent());
        CommunityComment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    /**
     * Xóa bình luận
     *
     * @param commentId ID của bình luận cần xóa
     * @param userId ID của người dùng thực hiện (phải là tác giả hoặc admin)
     * @throws ResourceNotFoundException Nếu không tìm thấy bình luận hoặc người dùng
     * @throws RuntimeException Nếu người dùng không có quyền xóa bình luận
     */
    @Transactional
    public void deleteComment(String commentId, String userId) {
        CommunityComment comment = commentRepository.findByCommentId(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + commentId));

        // Kiểm tra quyền truy cập (chỉ tác giả hoặc admin mới có quyền xóa)
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (!comment.getAuthor().getId().toString().equals(userId) && !user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này");
        }

        // Cập nhật số lượng bình luận trong bài đăng
        CommunityPost post = comment.getPost();
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);

        commentRepository.delete(comment);
    }

    /**
     * Ghim hoặc bỏ ghim bình luận
     *
     * @param commentId ID của bình luận cần ghim/bỏ ghim
     * @param userId ID của người dùng thực hiện (phải là tác giả của bài đăng, admin hoặc y tá)
     * @return Thông tin bình luận sau khi thực hiện
     * @throws ResourceNotFoundException Nếu không tìm thấy bình luận hoặc người dùng
     * @throws RuntimeException Nếu người dùng không có quyền ghim bình luận
     */
    @Transactional
    public CommunityCommentDTO togglePinComment(String commentId, String userId) {
        CommunityComment comment = commentRepository.findByCommentId(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + commentId));

        CommunityPost post = comment.getPost();

        // Kiểm tra quyền truy cập (chỉ tác giả của bài đăng, admin hoặc y tá mới có thể ghim bình luận)
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (!post.getAuthor().getId().toString().equals(userId) && !user.getRole().equals("ADMIN") && !user.getRole().equals("NURSE")) {
            throw new RuntimeException("Bạn không có quyền ghim bình luận này");
        }

        comment.setIsPinned(!comment.getIsPinned());
        CommunityComment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    /**
     * Thích bình luận
     *
     * @param commentId ID của bình luận cần thích
     * @param userId ID của người dùng thực hiện
     * @return Thông tin bình luận sau khi thực hiện
     * @throws ResourceNotFoundException Nếu không tìm thấy bình luận
     */
    @Transactional
    public CommunityCommentDTO likeComment(String commentId, String userId) {
        CommunityComment comment = commentRepository.findByCommentId(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + commentId));

        // Trong một hệ thống thực tế, cần kiểm tra xem người dùng đã thích bình luận này chưa
        // Ở đây chỉ mô phỏng tăng số lượt thích
        comment.setLikesCount(comment.getLikesCount() + 1);
        CommunityComment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    /**
     * Bỏ thích bình luận
     *
     * @param commentId ID của bình luận cần bỏ thích
     * @param userId ID của người dùng thực hiện
     * @return Thông tin bình luận sau khi thực hiện
     * @throws ResourceNotFoundException Nếu không tìm thấy bình luận
     */
    @Transactional
    public CommunityCommentDTO unlikeComment(String commentId, String userId) {
        CommunityComment comment = commentRepository.findByCommentId(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bình luận với ID: " + commentId));

        // Giảm số lượt thích, đảm bảo không âm
        if (comment.getLikesCount() > 0) {
            comment.setLikesCount(comment.getLikesCount() - 1);
        }

        CommunityComment updatedComment = commentRepository.save(comment);
        return convertToDTO(updatedComment);
    }

    /**
     * Chuyển đổi từ entity sang DTO
     *
     * @param comment Entity cần chuyển đổi
     * @return DTO tương ứng
     */
    private CommunityCommentDTO convertToDTO(CommunityComment comment) {
        return CommunityCommentDTO.builder()
                .id(comment.getCommentId())
                .postId(comment.getPost().getPostId())
                .author(convertToAuthorDTO(comment.getAuthor()))
                .content(comment.getContent())
                .createdAt(dateFormat.format(comment.getCreatedAt()))
                .likes(comment.getLikesCount())
                .isPinned(comment.getIsPinned())
                .build();
    }

    /**
     * Chuyển đổi từ User entity sang AuthorDTO
     *
     * @param user User entity cần chuyển đổi
     * @return AuthorDTO tương ứng
     */
    private AuthorDTO convertToAuthorDTO(User user) {
        return AuthorDTO.builder()
                .id(user.getId().toString())  // Chuyển đổi Long thành String
                .name(user.getFullName())
                .avatar(user.getAvatarUrl())
                .role(user.getRole().toLowerCase())
                .bio(user.getBio())
                .build();
    }
}

