import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Spinner, Pagination } from 'react-bootstrap';
import { useBlog } from '../../../../../context/NurseContext/BlogContext';
import { useAuth } from '../../../../../context/AuthContext';
import './Posts.css';

const Posts = () => {
  const { 
    posts, 
    postsLoading, 
    postsError, 
    postCategories,
    currentPage,
    totalPages,
    pageSize,
    fetchPosts,
    getPostById,
    addPost,
    updatePost,
    removePost,
    likePost,
    unlikePost
  } = useBlog();
  
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    imageUrl: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts(1, 10);
  }, [fetchPosts]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && Array.isArray(post.tags) && 
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === '' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format tags as array
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      const postData = {
        ...formData,
        tags: tagsArray,
        author: {
          id: currentUser?.id || 'NURSE001',
          name: currentUser?.name || 'Y tá trường',
          role: 'NURSE'
        }
      };

      if (isEditing && selectedPost) {
        await updatePost(selectedPost.id, postData);
      } else {
        await addPost(postData);
      }

      // Reset form and close modal
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        imageUrl: '',
        tags: ''
      });
      setShowModal(false);
      
      // Refresh posts list
      fetchPosts(currentPage, pageSize);
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view post detail
  const handleViewPostDetail = async (post) => {
    try {
      setDetailLoading(true);
      setSelectedPost(null);
      
      // Get the latest post data
      const postDetail = await getPostById(post.id);
      
      setSelectedPost(postDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching post details:', error);
      alert('Không thể tải thông tin chi tiết bài viết. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle edit post
  const handleEditPost = async (post) => {
    try {
      setDetailLoading(true);
      
      // Get the latest post data
      const postDetail = await getPostById(post.id);
      
      setSelectedPost(postDetail);
      setIsEditing(true);
      setFormData({
        title: postDetail.title || '',
        excerpt: postDetail.excerpt || '',
        content: postDetail.content || '',
        category: postDetail.category || '',
        imageUrl: postDetail.imageUrl || '',
        tags: Array.isArray(postDetail.tags) ? postDetail.tags.join(', ') : ''
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching post details:', error);
      alert('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle delete post
  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  // Confirm delete post
  const confirmDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      await removePost(selectedPost.id);
      setShowDeleteModal(false);
      setSelectedPost(null);
      
      // Refresh posts list
      fetchPosts(currentPage, pageSize);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle add new post
  const handleAddPost = () => {
    setIsEditing(false);
    setSelectedPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      imageUrl: '',
      tags: ''
    });
    setShowModal(true);
  };

  // Handle like/unlike post
  const handleToggleLike = async (post) => {
    try {
      if (post.liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchPosts(page, pageSize);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setSelectedPost(null);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="text-primary fw-bold mb-2">Bài viết chung</h4>
              <p className="text-muted mb-0">Quản lý các bài viết và tin tức chung</p>
            </div>
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
          {filteredPosts.map(post => (
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
                    <Badge bg="info" className="mb-2">{post.category || 'Chưa phân loại'}</Badge>
                    {post.pinned && (
                      <Badge bg="warning" className="ms-1">
                        <i className="fas fa-thumbtack me-1"></i> Ghim
                      </Badge>
                    )}
                  </div>
                  
                  <Card.Title className="h6 mb-2">{post.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                  </Card.Text>
                  
                  <div className="mb-2">
                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
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
                    <span className={post.liked ? 'text-danger' : ''} style={{ cursor: 'pointer' }} onClick={() => handleToggleLike(post)}>
                      <i className={`${post.liked ? 'fas' : 'far'} fa-heart me-1`}></i>
                      {post.likes || 0} thích
                    </span>
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

      {/* Pagination */}
      {!postsLoading && !postsError && totalPages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination>
              <Pagination.First 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1}
              />
              <Pagination.Prev 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              />
              
              {[...Array(totalPages).keys()].map(number => (
                <Pagination.Item 
                  key={number + 1} 
                  active={number + 1 === currentPage}
                  onClick={() => handlePageChange(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              ))}
              
              <Pagination.Next 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              />
              <Pagination.Last 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Col>
        </Row>
      )}

      {/* Add/Edit Post Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tóm tắt</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {postCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.imageUrl} 
                    alt="Xem trước" 
                    style={{ maxHeight: '100px', maxWidth: '100%' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <p className="text-muted small mt-1" style={{ display: 'none' }}>
                    Không thể hiển thị hình ảnh. Vui lòng kiểm tra lại đường dẫn.
                  </p>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thẻ (phân cách bằng dấu phẩy)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="sức khỏe, học sinh, ..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Đang lưu...
                </>
              ) : (
                isEditing ? 'Cập nhật' : 'Thêm bài viết'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Post Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải chi tiết bài viết...</p>
            </div>
          ) : selectedPost ? (
            <div className="post-detail">
              <h4 className="mb-3">{selectedPost.title}</h4>
              
              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>
                  <i className="fas fa-user me-1"></i>
                  {selectedPost.author?.name || 'Không có tác giả'}
                </span>
                <span>
                  <i className="fas fa-calendar me-1"></i>
                  {formatDate(selectedPost.createdAt)}
                </span>
              </div>
              
              <Badge bg="info" className="mb-3">
                {selectedPost.category || 'Chưa phân loại'}
              </Badge>
              
              {selectedPost.excerpt && (
                <div className="summary mb-3 p-3 bg-light rounded">
                  <strong>Tóm tắt:</strong> {selectedPost.excerpt}
                </div>
              )}
              
              <div className="content mb-4">
                <h6>Nội dung:</h6>
                <div className="p-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedPost.content}
                </div>
              </div>
              
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="tags mb-3">
                  <h6>Thẻ:</h6>
                  <div>
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="stats d-flex justify-content-between mb-3">
                <span>
                  <i className="fas fa-eye me-1"></i>
                  {selectedPost.viewCount || 0} lượt xem
                </span>
                <span>
                  <i className="fas fa-heart me-1"></i>
                  {selectedPost.likes || 0} lượt thích
                </span>
                <span>
                  <i className="fas fa-comment me-1"></i>
                  {selectedPost.commentsCount || 0} bình luận
                </span>
              </div>
              
              {selectedPost.relatedPosts && selectedPost.relatedPosts.length > 0 && (
                <div className="related-posts mt-4 pt-3 border-top">
                  <h6>Bài viết liên quan:</h6>
                  <ul className="list-unstyled">
                    {selectedPost.relatedPosts.map(relatedPost => (
                      <li key={relatedPost.id} className="mb-2">
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          setShowDetailModal(false);
                          handleViewPostDetail({id: relatedPost.id});
                        }}>
                          {relatedPost.title}
                        </a>
                        <span className="text-muted small ms-2">
                          ({relatedPost.category})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="metadata mt-4 pt-3 border-top">
                <small className="text-muted">
                  ID bài viết: {selectedPost.id}<br />
                  Tác giả: {selectedPost.author?.name} (ID: {selectedPost.author?.id})<br />
                  Cập nhật lần cuối: {formatDate(selectedPost.updatedAt)}
                </small>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">Không tìm thấy thông tin bài viết</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
          {selectedPost && (
            <>
              <Button 
                variant="warning" 
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditPost(selectedPost);
                }}
              >
                <i className="fas fa-edit me-1"></i> Chỉnh sửa
              </Button>
              <Button 
                variant={selectedPost.liked ? "danger" : "outline-danger"}
                onClick={() => handleToggleLike(selectedPost)}
              >
                <i className={`${selectedPost.liked ? 'fas' : 'far'} fa-heart me-1`}></i>
                {selectedPost.liked ? 'Bỏ thích' : 'Thích'}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

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
