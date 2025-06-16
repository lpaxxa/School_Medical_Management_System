package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.AuthorDTO;
import com.fpt.medically_be.dto.CommunityPostDTO;
import com.fpt.medically_be.entity.CommunityPost;
import com.fpt.medically_be.entity.User;
import com.fpt.medically_be.exception.ResourceNotFoundException;
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
 * Service xử lý logic nghiệp vụ liên quan đến bài đăng trong cộng đồng
 */
@Service
public class CommunityPostService {

    private final CommunityPostRepository postRepository;
    private final UserRepository userRepository;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

    @Autowired
    public CommunityPostService(CommunityPostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lấy tất cả bài đăng trong cộng đồng, sắp xếp theo ghim và ngày tạo
     *
     * @return Danh sách bài đăng đã chuyển đổi sang DTO
     */
    @Transactional(readOnly = true)
    public List<CommunityPostDTO> getAllPosts() {
        return postRepository.findAllByOrderByIsPinnedDescCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết của một bài đăng theo ID
     *
     * @param postId ID của bài đăng cần lấy thông tin
     * @return Thông tin chi tiết của bài đăng
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng với ID cung cấp
     */
    @Transactional(readOnly = true)
    public CommunityPostDTO getPostById(String postId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        return convertToDTO(post);
    }

    /**
     * Lấy danh sách bài đăng theo danh mục
     *
     * @param category Danh mục cần lọc (question, announcement, health-guide, ...)
     * @return Danh sách bài đăng thuộc danh mục
     */
    @Transactional(readOnly = true)
    public List<CommunityPostDTO> getPostsByCategory(String category) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách bài đăng theo vai trò của tác giả
     *
     * @param role Vai trò của tác giả (nurse, parent, admin, etc.)
     * @return Danh sách bài đăng của các tác giả có vai trò tương ứng
     */
    @Transactional(readOnly = true)
    public List<CommunityPostDTO> getPostsByAuthorRole(String role) {
        return postRepository.findByAuthorRoleOrderByIsPinnedDescCreatedAtDesc(role)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm bài đăng theo từ khóa
     *
     * @param searchTerm Từ khóa tìm kiếm
     * @return Danh sách bài đăng phù hợp với từ khóa
     */
    @Transactional(readOnly = true)
    public List<CommunityPostDTO> searchPosts(String searchTerm) {
        return postRepository.searchPosts(searchTerm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Tạo bài đăng mới
     *
     * @param postDTO Thông tin bài đăng cần tạo
     * @param userId ID của người dùng tạo bài đăng
     * @return Thông tin bài đăng đã tạo
     * @throws ResourceNotFoundException Nếu không tìm thấy người dùng với ID cung cấp
     */
    @Transactional
    public CommunityPostDTO createPost(CommunityPostDTO postDTO, String userId) {
        User author = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        CommunityPost post = new CommunityPost();
        post.setPostId("post" + UUID.randomUUID().toString().substring(0, 6));
        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setAuthor(author);
        post.setCategory(postDTO.getCategory());
        post.setCreatedAt(new Date());
        post.setLikesCount(0);
        post.setCommentsCount(0);
        post.setIsPinned(false);
        post.setTags(postDTO.getTags());

        CommunityPost savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }

    /**
     * Cập nhật thông tin bài đăng
     *
     * @param postId ID của bài đăng cần cập nhật
     * @param postDTO Thông tin mới của bài đăng
     * @param userId ID của người dùng thực hiện cập nhật (phải là tác giả của bài đăng)
     * @return Thông tin bài đăng sau khi cập nhật
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng với ID cung cấp
     * @throws RuntimeException Nếu người dùng không có quyền sửa bài đăng
     */
    @Transactional
    public CommunityPostDTO updatePost(String postId, CommunityPostDTO postDTO, String userId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        // Kiểm tra quyền truy cập
        if (!post.getAuthor().getId().toString().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa bài đăng này");
        }

        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());
        post.setCategory(postDTO.getCategory());
        post.setUpdatedAt(new Date());
        post.setTags(postDTO.getTags());

        CommunityPost updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    /**
     * Xóa bài đăng
     *
     * @param postId ID của bài đăng cần xóa
     * @param userId ID của người dùng thực hiện xóa (phải là tác giả hoặc admin)
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng hoặc người dùng
     * @throws RuntimeException Nếu người dùng không có quyền xóa bài đăng
     */
    @Transactional
    public void deletePost(String postId, String userId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        // Kiểm tra quyền truy cập (chỉ tác giả hoặc admin mới có quyền xóa)
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (!post.getAuthor().getId().toString().equals(userId) && !user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Bạn không có quyền xóa bài đăng này");
        }

        postRepository.delete(post);
    }

    /**
     * Ghim hoặc bỏ ghim bài ��ăng
     *
     * @param postId ID của bài đăng cần ghim/bỏ ghim
     * @param userId ID của người dùng thực hiện (phải là admin hoặc y tá)
     * @return Thông tin bài đăng sau khi thực hiện
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng hoặc người dùng
     * @throws RuntimeException Nếu người dùng không có quyền ghim bài đăng
     */
    @Transactional
    public CommunityPostDTO togglePin(String postId, String userId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        // Kiểm tra quyền truy cập (chỉ admin hoặc y tá mới có quyền ghim bài)
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        if (!user.getRole().equals("ADMIN") && !user.getRole().equals("NURSE")) {
            throw new RuntimeException("Bạn không có quyền ghim bài đăng");
        }

        post.setIsPinned(!post.getIsPinned());
        CommunityPost updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    /**
     * Thích bài đăng
     *
     * @param postId ID của bài đăng cần thích
     * @param userId ID của người dùng thực hiện
     * @return Thông tin bài đăng sau khi thực hiện
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng
     */
    @Transactional
    public CommunityPostDTO likePost(String postId, String userId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        // Trong một hệ thống thực tế, cần kiểm tra xem người dùng đã thích bài đăng này chưa
        // Ở đây chỉ mô phỏng tăng số lượt thích
        post.setLikesCount(post.getLikesCount() + 1);
        CommunityPost updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    /**
     * Bỏ thích bài đăng
     *
     * @param postId ID của bài đăng cần bỏ thích
     * @param userId ID của người dùng thực hiện
     * @return Thông tin bài đăng sau khi thực hiện
     * @throws ResourceNotFoundException Nếu không tìm thấy bài đăng
     */
    @Transactional
    public CommunityPostDTO unlikePost(String postId, String userId) {
        CommunityPost post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài đăng với ID: " + postId));

        // Giảm số lượt thích, đảm bảo không âm
        if (post.getLikesCount() > 0) {
            post.setLikesCount(post.getLikesCount() - 1);
        }

        CommunityPost updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost);
    }

    /**
     * Chuyển đổi từ entity sang DTO
     *
     * @param post Entity cần chuyển đổi
     * @return DTO tương ứng
     */
    private CommunityPostDTO convertToDTO(CommunityPost post) {
        return CommunityPostDTO.builder()
                .id(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .author(convertToAuthorDTO(post.getAuthor()))
                .category(post.getCategory())
                .createdAt(dateFormat.format(post.getCreatedAt()))
                .updatedAt(post.getUpdatedAt() != null ? dateFormat.format(post.getUpdatedAt()) : null)
                .likes(post.getLikesCount())
                .comments(post.getCommentsCount())
                .isPinned(post.getIsPinned())
                .tags(post.getTags())
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

