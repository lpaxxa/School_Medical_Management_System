import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Spinner, Pagination, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useBlog } from '../../../../../context/NurseContext/BlogContext';
import { useAuth } from '../../../../../context/AuthContext';
import * as blogService from '../../../../../services/APINurse/blogService';
import Swal from 'sweetalert2';
import './Posts.css';

// Avatar mặc định cho người dùng
const DEFAULT_AVATAR = 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg';

const Posts = () => {
  const { 
    posts, 
    postsLoading, 
    postsError, 
    postCategories,
    currentPage,
    pageSize,
    fetchPosts,
    getPostById,
    removePost,
    likePost,
    unlikePost
  } = useBlog();
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [postsWithLikeStatus, setPostsWithLikeStatus] = useState([]);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts(1, 10);
  }, [fetchPosts]);

  // Load like status for posts
  useEffect(() => {
    const loadLikeAndBookmarkStatus = async () => {
      if (posts && posts.length > 0) {
        // Debug logging để kiểm tra format dữ liệu
        console.log("=== POSTS DATA DEBUG ===");
        console.log("First post:", posts[0]);
        console.log("CreatedAt format:", posts[0]?.createdAt);
        console.log("CreatedAt type:", typeof posts[0]?.createdAt);
        console.log("Is array:", Array.isArray(posts[0]?.createdAt));

        try {
          const postsWithStatusData = await Promise.all(
            posts.map(async (post) => {
              try {
                const [likeResponse, bookmarkResponse] = await Promise.all([
                  blogService.getPostLikeStatus(post.id),
                  blogService.getPostBookmarkStatus(post.id)
                ]);
                
                return {
                  ...post,
                  liked: likeResponse?.data?.liked || false,
                  likesCount: likeResponse?.data?.likesCount || 0,
                  bookmarked: bookmarkResponse?.data?.bookmarked || false
                };
              } catch (error) {
                console.error(`Error loading status for post ${post.id}:`, error);
                return {
                  ...post,
                  liked: false,
                  likesCount: 0,
                  bookmarked: false
                };
              }
            })
          );
          
          setPostsWithLikeStatus(postsWithStatusData);
        } catch (error) {
          console.error('Error loading post statuses:', error);
        }
      }
    };

    loadLikeAndBookmarkStatus();
  }, [posts]);

  // Helper function to parse date from various formats
  const parseDate = (dateInput) => {
    if (!dateInput) return new Date(0); // Return epoch for null/undefined

    try {
      // Handle array format from backend: [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateInput;
        // Month in JavaScript Date is 0-indexed, so subtract 1
        return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
      } else {
        // Handle string format
        return new Date(dateInput);
      }
    } catch (error) {
      console.error("Error parsing date:", error, "Input:", dateInput);
      return new Date(0); // Return epoch for invalid dates
    }
  };

  // Format date - handle both string and array formats
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    try {
      let dateObj;

      // Handle array format from backend: [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0] = dateInput;
        // Month in JavaScript Date is 0-indexed, so subtract 1
        dateObj = new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000));
      } else {
        // Handle string format
        dateObj = new Date(dateInput);
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date detected:", dateInput);
        return "Thời gian không hợp lệ";
      }

      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return dateObj.toLocaleDateString('vi-VN', options);
    } catch (error) {
      console.error("Lỗi khi định dạng ngày tháng:", error, "Input:", dateInput);
      return "Lỗi định dạng thời gian";
    }
  };

  // Filter posts based on search term and category
  const filteredPosts = (postsWithLikeStatus.length > 0 ? postsWithLikeStatus : posts).filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && Array.isArray(post.tags) && 
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === '' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Sắp xếp theo bookmark trước (bài ghim lên đầu), sau đó theo createdAt (mới nhất trước)
    if (a.bookmarked && !b.bookmarked) return -1;
    if (!a.bookmarked && b.bookmarked) return 1;

    // Use parseDate helper for proper date comparison
    const dateA = parseDate(a.createdAt);
    const dateB = parseDate(b.createdAt);
    return dateB - dateA; // Newest first
  });

  // Pagination logic
  const postsPerPage = 6;
  const totalPosts = filteredPosts.length;
  const totalPagesLocal = Math.ceil(totalPosts / postsPerPage);
  
  // Calculate posts for current page
  const startIndex = (currentLocalPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPagePosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentLocalPage(1);
  }, [searchTerm, selectedCategory]);

  // Handle view post detail
  const handleViewPostDetail = (post) => {
    navigate(`/nurse/blog-management/posts/${post.id}`);
  };

  // Handle edit post
  const handleEditPost = (post) => {
    // Check if user is author
    if (currentUser?.id !== post.author?.id) {
      alert('Bạn không có quyền chỉnh sửa bài viết này');
      return;
    }
    navigate(`/nurse/blog-management/posts/edit/${post.id}`);
  };

  // Handle delete post
  const handleDeletePost = (post) => {
    // Check if user is author
    if (currentUser?.id !== post.author?.id) {
      alert('Bạn không có quyền xóa bài viết này');
      return;
    }
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await blogService.deletePost(selectedPost.id);
      setShowDeleteModal(false);
      setSelectedPost(null);
      setCurrentLocalPage(1);

      // Refresh posts list
      fetchPosts(currentPage, pageSize);

      // Show success notification with Sweet2
      Swal.fire({
        icon: 'success',
        title: 'Xóa thành công!',
        text: `Bài viết "${selectedPost.title}" đã được xóa thành công.`,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#0d6efd',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
    } catch (error) {
      console.error('Error deleting post:', error);

      // Show error notification with Sweet2
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#dc3545',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    }
  };

  // Handle add new post
  const handleAddPost = () => {
    navigate('/nurse/blog-management/posts/add');
  };

  // Handle like/unlike post
  const handleToggleLike = async (post) => {
    try {
      const response = await blogService.togglePostLike(post.id);
      
      // Update local state
      if (response && response.data) {
        setPostsWithLikeStatus(prev => 
          prev.map(p => 
            p.id === post.id 
              ? { ...p, liked: response.data.liked, likesCount: response.data.likesCount }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Có lỗi xảy ra khi thích/hủy thích bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle bookmark/unbookmark post
  const handleToggleBookmark = async (post) => {
    try {
      const response = await blogService.togglePostBookmark(post.id);
      
      // Update local state
      if (response && response.data) {
        setPostsWithLikeStatus(prev => 
          prev.map(p => 
            p.id === post.id 
              ? { ...p, bookmarked: response.data.bookmarked }
              : p
          )
        );
        
        // Reload posts to refresh the sorting
        setTimeout(() => {
          fetchPosts(currentPage, pageSize);
        }, 500);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Có lỗi xảy ra khi ghim/bỏ ghim bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchPosts(page, pageSize);
  };

  return (
    <Container fluid className="py-4">
      <style>
        {`
          /* Đồng bộ màu sắc với hệ thống */
          .btn-primary {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            border-color: #0d6efd !important;
            box-shadow: 0 2px 8px rgba(13, 110, 253, 0.2) !important;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%) !important;
            border-color: #0b5ed7 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3) !important;
          }
          
          .btn-outline-primary {
            color: #0d6efd !important;
            border-color: #0d6efd !important;
          }
          
          .btn-outline-primary:hover {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
          }
          
          /* Badge info đồng bộ màu */
          .badge.bg-info {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            color: white !important;
          }
          
          /* Thẻ tags đồng bộ màu */
          .badge.bg-secondary {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
            color: white !important;
          }
          
          /* Focus state cho form controls */
          .form-control:focus {
            border-color: #86b7fe !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }
          
          /* Form select focus */
          .form-select:focus {
            border-color: #86b7fe !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }
          
          /* Fix dropdown arrow */
          .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.75rem center !important;
            background-size: 16px 12px !important;
            padding-right: 2.25rem !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }
          
          /* Ensure dropdown works properly */
          .form-select option {
            color: #212529 !important;
            background-color: #fff !important;
          }
          
          .form-select:disabled {
            background-color: #e9ecef !important;
            opacity: 1 !important;
          }
          
          /* Pagination active */
          .pagination .page-item.active .page-link {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
          }
          
          .pagination .page-link {
            color: #0d6efd !important;
          }
          
          .pagination .page-link:hover {
            color: #0b5ed7 !important;
            background-color: #e7f1ff !important;
            border-color: #86b7fe !important;
          }

          /* Modal delete styling - chuyên nghiệp */
          .modal-header.delete-modal-header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            color: white !important;
            border-bottom: none !important;
            border-radius: 12px 12px 0 0 !important;
            padding: 25px 30px !important;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2) !important;
          }

          .modal-header.delete-modal-header .modal-title {
            color: white !important;
            font-weight: 700 !important;
            font-size: 1.4rem !important;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }

          .modal-header.delete-modal-header .btn-close {
            filter: brightness(0) invert(1) !important;
            opacity: 0.8 !important;
            transition: all 0.3s ease !important;
            border-radius: 50% !important;
            padding: 8px !important;
            width: 40px !important;
            height: 40px !important;
          }

          .modal-header.delete-modal-header .btn-close:hover {
            opacity: 1 !important;
            background: rgba(255, 255, 255, 0.2) !important;
            transform: rotate(90deg) !important;
          }

          .modal-content.delete-modal-content {
            border: none !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            overflow: hidden !important;
          }

          .modal-body.delete-modal-body {
            padding: 30px !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          }

          .delete-warning-box {
            background: white !important;
            border: 2px solid #fee2e2 !important;
            border-radius: 12px !important;
            padding: 20px !important;
            margin-bottom: 20px !important;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.1) !important;
            text-align: center !important;
          }

          .delete-warning-icon {
            color: #dc3545 !important;
            font-size: 2.5rem !important;
            margin-bottom: 15px !important;
          }

          .delete-warning-text {
            color: #333 !important;
            font-size: 1.1rem !important;
            line-height: 1.6 !important;
            margin-bottom: 15px !important;
          }

          .delete-item-preview {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: 1px solid #dee2e6 !important;
            border-radius: 8px !important;
            padding: 15px !important;
            font-style: italic !important;
            color: #666 !important;
            border-left: 4px solid #dc3545 !important;
            font-weight: 600 !important;
          }

          .modal-footer.delete-modal-footer {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border-top: 2px solid #e8f4fd !important;
            padding: 20px 30px !important;
            display: flex !important;
            justify-content: space-between !important;
            gap: 15px !important;
          }

          .btn-danger.delete-confirm-btn {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            color: white !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3) !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          .btn-danger.delete-confirm-btn:hover {
            background: linear-gradient(135deg, #c82333 0%, #b21e2f 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4) !important;
            color: white !important;
          }

          .btn-secondary.delete-cancel-btn {
            background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%) !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            color: white !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3) !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }

          .btn-secondary.delete-cancel-btn:hover {
            background: linear-gradient(135deg, #5a6268 0%, #495057 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4) !important;
            color: white !important;
          }

          /* Fix button hover issue - đảm bảo text không bị mất */
          .btn-outline-primary {
            color: #0d6efd !important;
            border-color: #0d6efd !important;
            background-color: transparent !important;
            transition: all 0.3s ease !important;
          }

          .btn-outline-primary:hover {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
            color: white !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3) !important;
          }

          .btn-outline-primary:focus {
            background-color: #0d6efd !important;
            border-color: #0d6efd !important;
            color: white !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }

          .btn-outline-primary:active {
            background-color: #0b5ed7 !important;
            border-color: #0b5ed7 !important;
            color: white !important;
          }

          /* Sweet2 custom styling */
          .swal2-popup {
            border-radius: 15px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
          }

          .swal2-title {
            font-weight: 700 !important;
            color: #333 !important;
          }

          .swal2-content {
            font-size: 1.1rem !important;
            color: #666 !important;
          }

          .swal2-confirm {
            border-radius: 10px !important;
            padding: 12px 24px !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
          }

          .swal2-confirm:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
          }

          .swal2-timer-progress-bar {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
          }
        `}
      </style>

      {/* Posts Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" className="btn-sm" onClick={handleAddPost}>
              <i className="fas fa-plus me-2"></i>
              Thêm bài viết
            </Button>
          </div>
        </Col>
      </Row>

      {/* Search and filter */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {postCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Loading state */}
      {postsLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error state */}
      {postsError && !postsLoading && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {postsError}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={() => fetchPosts(currentPage, pageSize)}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Posts list */}
      {!postsLoading && !postsError && (
        <Row>
          {currentPagePosts.map(post => (
            <Col md={6} lg={4} key={post.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                {post.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={post.imageUrl} 
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex flex-wrap gap-1">
                      <Badge bg="light" className="mb-2" style={{
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '500'
                      }}>
                        ID: {post.id}
                      </Badge>
                      <Badge bg="info" className="mb-2">{post.category || 'Chưa phân loại'}</Badge>
                      {post.bookmarked && (
                        <Badge bg="warning" className="mb-2">
                          <i className="fas fa-bookmark me-1"></i> Ghim
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Card.Title className="h6 mb-2">{post.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                  </Card.Text>
                  
                  <div className="mb-2">
                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1" style={{
                        background: 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                        color: 'white',
                        border: 'none'
                      }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center text-muted small mb-2">
                    <span>
                      <i className="fas fa-user me-1"></i>
                      {post.author?.name || 'Không có tác giả'}
                    </span>
                  </div>
                  
                  <div className="text-muted small mb-3">
                    <i className="fas fa-calendar me-1"></i>
                    {formatDate(post.createdAt)}
                  </div>
                  
                  <div className="d-flex justify-content-center align-items-center text-muted small mb-3">
                    <div className="d-flex gap-4">
                      <span
                        className={post.liked ? 'text-danger' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleLike(post)}
                        title={post.liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
                      >
                        <i className={`${post.liked ? 'fas' : 'far'} fa-heart me-1`}></i>
                        {post.likesCount || 0} thích
                      </span>
                      <span
                        className={post.bookmarked ? 'text-warning' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleBookmark(post)}
                        title={post.bookmarked ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                      >
                        <i className={`${post.bookmarked ? 'fas' : 'far'} fa-bookmark me-1`}></i>
                        {post.bookmarked ? 'Đã ghim' : 'Ghim'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-fill"
                      onClick={() => handleViewPostDetail(post)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      Xem
                    </Button>
                    {/* Only show edit and delete buttons if user is the author */}
                    {currentUser?.id === post.author?.id && (
                      <>
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="flex-fill"
                          onClick={() => handleEditPost(post)}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Sửa
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeletePost(post)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Empty state */}
      {!postsLoading && !postsError && filteredPosts.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">Không tìm thấy bài viết nào</h5>
            <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc thêm bài viết mới</p>
          </Col>
        </Row>
      )}

      {/* Simple Pagination with "1 / 3" style */}
      {!postsLoading && !postsError && totalPagesLocal > 1 && (
        <Row className="mt-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center px-3">
              {/* Showing entries info */}
              <div className="text-muted">
                <small>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalPosts)} of {totalPosts} posts
                </small>
              </div>

              {/* Pagination controls */}
              <div className="d-flex align-items-center gap-2">
                {/* First page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === 1}
                  onClick={() => setCurrentLocalPage(1)}
                  title="Trang đầu"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>

                {/* Previous page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === 1}
                  onClick={() => setCurrentLocalPage(currentLocalPage - 1)}
                  title="Trang trước"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-left"></i>
                </button>

                {/* Current page indicator */}
                <div
                  className="px-3 py-1 bg-primary text-white rounded"
                  style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {currentLocalPage} / {totalPagesLocal}
                </div>

                {/* Next page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === totalPagesLocal}
                  onClick={() => setCurrentLocalPage(currentLocalPage + 1)}
                  title="Trang tiếp"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-right"></i>
                </button>

                {/* Last page button */}
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={currentLocalPage === totalPagesLocal}
                  onClick={() => setCurrentLocalPage(totalPagesLocal)}
                  title="Trang cuối"
                  style={{ minWidth: '40px' }}
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="delete-modal-content"
      >
        <Modal.Header closeButton className="delete-modal-header">
          <Modal.Title>
            <i className="fas fa-exclamation-triangle"></i>
            Xác nhận xóa bài viết
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="delete-modal-body">
          <div className="delete-warning-box">
            <div className="delete-warning-icon">
              <i className="fas fa-trash-alt"></i>
            </div>
            <div className="delete-warning-text">
              Bạn có chắc chắn muốn xóa bài viết này không?
            </div>
            <div className="delete-item-preview">
              "{selectedPost?.title}"
            </div>
            <div className="mt-3">
              <i className="fas fa-exclamation-triangle me-2 text-danger"></i>
              <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="delete-modal-footer">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            className="delete-cancel-btn"
          >
            <i className="fas fa-times"></i>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeletePost}
            className="delete-confirm-btn"
          >
            <i className="fas fa-trash"></i>
            Xóa bài viết
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Posts;
