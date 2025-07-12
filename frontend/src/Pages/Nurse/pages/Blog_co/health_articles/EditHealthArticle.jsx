import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import * as healthArticleService from '../../../../../services/APINurse/blogService';

const EditHealthArticle = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    imageUrl: '',
    tags: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Health article categories
  const healthCategories = [
    "Disease Prevention",
    "Nutrition", 
    "Mental Health",
    "First Aid",
    "Physical Activity",
    "Health Information",
    "COVID-19 và trẻ em",
    "Dinh dưỡng học đường",
    "Sức khỏe tâm thần",
    "Tuổi dậy thì",
    "Vắc-xin cho học sinh",
    "Y tế học đường",
    "Phòng bệnh",
    "Sơ cứu",
    "Hoạt động thể chất",
    "Other"
  ];

  // Load article data
  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        console.log('Loading article with ID:', id);
        
        const response = await healthArticleService.getHealthArticleById(id);
        console.log('Article loaded:', response);
        
        setArticle(response);
        setFormData({
          title: response.title || '',
          summary: response.summary || '',
          content: response.content || '',
          category: response.category || '',
          imageUrl: response.imageUrl || '',
          tags: response.tags ? response.tags.join(', ') : ''
        });
        
        if (response.imageUrl) {
          setImagePreview(response.imageUrl);
        }
        
      } catch (error) {
        console.error('Error loading article:', error);
        setError('Không thể tải thông tin bài viết');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadArticle();
    }
  }, [id]);

  // Check if current user can edit this article
  const canEdit = () => {
    if (!currentUser || !article) {
      return false;
    }
    
    // Chỉ tác giả mới có thể chỉnh sửa bài viết (không phân biệt role)
    // Kiểm tra nghiêm ngặt: chỉ so sánh khi cả hai giá trị đều không rỗng
    const isAuthor = 
      (article.memberId && currentUser.memberId && article.memberId === currentUser.memberId) ||
      (article.memberId && currentUser.id && article.memberId === currentUser.id) ||
      (article.authorId && currentUser.memberId && article.authorId === currentUser.memberId) ||
      (article.authorId && currentUser.id && article.authorId === currentUser.id);
    
    return isAuthor;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({
      ...formData,
      imageUrl: url
    });
    setImagePreview(url);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEdit()) {
      setError('Bạn không có quyền chỉnh sửa bài viết này');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API
      const updatedData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        category: formData.category,
        imageUrl: formData.imageUrl,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
      };

      console.log('Updating health article:', updatedData);

      // Call API to update article
      const response = await healthArticleService.updateHealthArticle(id, updatedData);
      console.log('Health article updated successfully:', response);

      setSuccess('Bài viết đã được cập nhật thành công!');
      
      // Update local state
      setArticle({ ...article, ...updatedData });

      // Redirect to health articles list after 2 seconds
      setTimeout(() => {
        navigate('/nurse/blog/health-articles');
      }, 2000);

    } catch (error) {
      console.error('Error updating health article:', error);
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/nurse/blog/health-articles');
  };

  // Loading state
  if (loading) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải thông tin bài viết...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error && !article) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Alert variant="danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
            <Button variant="outline-secondary" onClick={handleCancel}>
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  // Authorization check
  if (!canEdit()) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Alert variant="warning">
              <i className="fas fa-lock me-2"></i>
              Bạn không có quyền chỉnh sửa bài viết này
            </Alert>
            <Button variant="outline-secondary" onClick={handleCancel}>
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="text-primary fw-bold mb-2">
                <i className="fas fa-edit me-2"></i>
                Chỉnh sửa bài viết y tế
              </h3>
              <p className="text-muted mb-0">
                Cập nhật nội dung bài viết y tế
              </p>
            </div>
            <Button variant="outline-secondary" onClick={handleCancel}>
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert variant="success" className="mb-4">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Tiêu đề <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề bài viết"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Tóm tắt <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                    required
                  />
                  <Form.Text className="text-muted">
                    Mô tả ngắn gọn về nội dung bài viết
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Nội dung <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Nhập nội dung chi tiết bài viết"
                    required
                  />
                  <Form.Text className="text-muted">
                    Hỗ trợ Markdown. Ví dụ: ### Tiêu đề, **in đậm**, *in nghiêng*
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Danh mục <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {healthCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Hình ảnh</Form.Label>
                  
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Form.Text className="text-muted">
                    Nhập URL của hình ảnh minh họa cho bài viết
                  </Form.Text>

                  {/* Image preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <Form.Label className="small text-muted">Xem trước:</Form.Label>
                      <div>
                        <img 
                          src={imagePreview} 
                          alt="Xem trước" 
                          style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Thẻ (Tags)</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="phòng dịch, trường học, học sinh, y tế học đường"
                  />
                  <Form.Text className="text-muted">
                    Phân cách bằng dấu phẩy. Ví dụ: phòng dịch, trường học, học sinh
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    className="flex-fill"
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
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Cập nhật bài viết
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    <i className="fas fa-times me-2"></i>
                    Hủy
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditHealthArticle;
