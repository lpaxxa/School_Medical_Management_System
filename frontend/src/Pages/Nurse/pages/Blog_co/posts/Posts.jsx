import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Spinner, Pagination, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useBlog } from '../../../../../context/NurseContext/BlogContext';
import { useAuth } from '../../../../../context/AuthContext';
import * as blogService from '../../../../../services/APINurse/blogService';
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
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.');
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
                  
                  <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                    <span>
                      <i className="fas fa-eye me-1"></i>
                      {post.viewCount || 0} lượt xem
                    </span>
                    <div className="d-flex gap-3">
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
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bài viết "{selectedPost?.title}"?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeletePost}>
            Xóa bài viết
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Posts;
