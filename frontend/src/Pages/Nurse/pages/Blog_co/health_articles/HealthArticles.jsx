import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useBlog } from '../../../../../context/NurseContext/BlogContext';
import { useAuth } from '../../../../../context/AuthContext';
import './HealthArticles.css';

const HealthArticles = () => {
  const { 
    blogs, 
    loading, 
    error, 
    categories,
    fetchBlogs,
    getBlogById,
    addBlog,
    updateBlog,
    removeBlog
  } = useBlog();
  
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: '',
    category: '',
    imageUrl: '',
    tags: '',
    memberId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch blogs when component mounts
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

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

  // Get difficulty badge variant
  const getDifficultyVariant = (category) => {
    switch (category) {
      case 'Dinh dưỡng': return 'success';
      case 'Xương khớp': return 'warning';
      case 'Nhãn khoa': return 'danger';
      case 'Dinh dưỡng học đường': return 'success';
      case 'Sức khỏe học đường': return 'info';
      default: return 'secondary';
    }
  };

  // Filter articles based on search term and category
  const filteredArticles = blogs.filter(article => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.tags && Array.isArray(article.tags) && 
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === '' || article.category === selectedCategory;
    
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
      
      const articleData = {
        ...formData,
        tags: tagsArray,
      };

      console.log('Sending data to API:', articleData);

      if (isEditing && selectedArticle) {
        await updateBlog({
          id: selectedArticle.id,
          ...articleData
        });
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await addBlog(articleData);
        toast.success('Thêm bài viết thành công!');
      }

      // Reset form and close modal
      setFormData({
        title: '',
        summary: '',
        content: '',
        author: '',
        category: '',
        imageUrl: '',
        tags: '',
        memberId: ''
      });
      setShowModal(false);
      
      // Refresh blogs list
      fetchBlogs();
    } catch (error) {
      console.error('Error submitting article:', error);
      toast.error('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view article details
  const handleViewArticleDetail = async (article) => {
    try {
      setDetailLoading(true);
      setSelectedArticle(null);
      
      // Get the latest article data
      const articleDetail = await getBlogById(article.id);
      
      setSelectedArticle(articleDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching article details:', error);
      toast.error('Không thể tải thông tin chi tiết bài viết. Vui lòng thử lại sau.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle edit article
  const handleEditArticle = async (article) => {
    try {
      // Get the latest article data
      const articleDetail = await getBlogById(article.id);
      
      setSelectedArticle(articleDetail);
      setIsEditing(true);
      setFormData({
        title: articleDetail.title || '',
        summary: articleDetail.summary || '',
        content: articleDetail.content || '',
        author: articleDetail.author || '',
        memberId: articleDetail.memberId || '',
        category: articleDetail.category || '',
        imageUrl: articleDetail.imageUrl || '',
        tags: Array.isArray(articleDetail.tags) ? articleDetail.tags.join(', ') : ''
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching article details:', error);
      toast.error('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle delete article
  const handleDeleteArticle = (article) => {
    setSelectedArticle(article);
    setShowDeleteModal(true);
  };

  // Confirm delete article
  const confirmDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      await removeBlog(selectedArticle.id);
      setShowDeleteModal(false);
      setSelectedArticle(null);
      
      // Refresh blogs list
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle add new article
  const handleAddArticle = () => {
    setIsEditing(false);
    setSelectedArticle(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      author: '',
      memberId: '',
      category: '',
      imageUrl: '',
      tags: ''
    });
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setSelectedArticle(null);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="text-primary fw-bold mb-2">Bài viết sức khỏe</h4>
              <p className="text-muted mb-0">Kiến thức chuyên môn và hướng dẫn chăm sóc sức khỏe</p>
            </div>
            <Button variant="primary" className="btn-sm" onClick={handleAddArticle}>
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
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-3"
            onClick={fetchBlogs}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Articles list */}
      {!loading && !error && (
        <Row>
          {filteredArticles.map(article => (
            <Col md={6} lg={4} key={article.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                {article.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={article.imageUrl} 
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={getDifficultyVariant(article.category)} className="mb-2">{article.category || 'Chưa phân loại'}</Badge>
                  </div>
                  
                  <Card.Title className="h6 mb-2">{article.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {article.summary || article.content?.substring(0, 150) + '...'}
                  </Card.Text>
                  
                  <div className="mb-2">
                    {article.tags && Array.isArray(article.tags) && article.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center text-muted small mb-2">
                    <span>
                      <i className="fas fa-user me-1"></i>
                      {article.author || article.memberName || 'Không có tác giả'}
                    </span>
                  </div>
                  
                  <div className="text-muted small mb-3">
                    <i className="fas fa-calendar me-1"></i>
                    {formatDate(article.publishDate)}
                  </div>
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-fill"
                      onClick={() => handleViewArticleDetail(article)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      Xem
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      className="flex-fill"
                      onClick={() => handleEditArticle(article)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Sửa
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteArticle(article)}
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

      {!loading && !error && filteredArticles.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">Không tìm thấy bài viết nào</h5>
            <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
          </Col>
        </Row>
      )}

      {/* Add/Edit Article Modal */}
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
                name="summary"
                value={formData.summary}
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tác giả</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Thành viên</Form.Label>
                  <Form.Control
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL Hình ảnh</Form.Label>
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
                    alt="Preview" 
                    style={{ maxHeight: '100px' }}
                    onError={(e) => {e.target.style.display = 'none'}}
                  />
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
                placeholder="dinh dưỡng, sức khỏe học đường, ..."
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

      {/* Article Detail Modal */}
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
          ) : selectedArticle ? (
            <div className="article-detail">
              {selectedArticle.imageUrl && (
                <div className="text-center mb-4">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="img-fluid rounded" 
                    style={{ maxHeight: '300px' }}
                    onError={(e) => {e.target.style.display = 'none'}}
                  />
                </div>
              )}
              
              <h4 className="mb-3">{selectedArticle.title}</h4>
              
              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>
                  <i className="fas fa-user me-1"></i>
                  {selectedArticle.author || selectedArticle.memberName || 'Không có tác giả'}
                </span>
                <span>
                  <i className="fas fa-calendar me-1"></i>
                  {formatDate(selectedArticle.publishDate)}
                </span>
              </div>
              
              <Badge bg={getDifficultyVariant(selectedArticle.category)} className="mb-3">
                {selectedArticle.category || 'Chưa phân loại'}
              </Badge>
              
              {selectedArticle.summary && (
                <div className="summary mb-3 p-3 bg-light rounded">
                  <strong>Tóm tắt:</strong> {selectedArticle.summary}
                </div>
              )}
              
              <div className="content mb-4">
                <h6>Nội dung:</h6>
                <div className="p-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedArticle.content}
                </div>
              </div>
              
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="tags mb-3">
                  <h6>Thẻ:</h6>
                  <div>
                    {selectedArticle.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="metadata mt-4 pt-3 border-top">
                <small className="text-muted">
                  ID bài viết: {selectedArticle.id}<br />
                  ID tác giả: {selectedArticle.memberId || 'N/A'}
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
          {selectedArticle && (
            <Button 
              variant="warning" 
              onClick={() => {
                setShowDetailModal(false);
                handleEditArticle(selectedArticle);
              }}
            >
              <i className="fas fa-edit me-1"></i> Chỉnh sửa
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa bài viết "{selectedArticle?.title}"?</p>
          <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDeleteArticle}>
            Xóa bài viết
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HealthArticles;
