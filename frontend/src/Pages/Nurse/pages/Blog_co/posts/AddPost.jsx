import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import * as blogService from '../../../../../services/APINurse/blogService';

const AddPost = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Post categories
  const postCategories = [
    "COVID-19 và trẻ em",
    "Dinh dưỡng học đường",
    "Sức khỏe tâm thần",
    "Tuổi dậy thì",
    "Vắc-xin cho học sinh",
    "Y tế học đường",
    "Phòng bệnh",
    "Sơ cứu",
    "Hoạt động thể chất",
    "Khác"
  ];

  // Handle input changes
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
    
    if (!currentUser) {
      setError('Vui lòng đăng nhập để thêm bài viết');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API
      const postData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
      };

      console.log('Adding new post:', postData);

      // Call API to create post
      const response = await blogService.createPost(postData);
      console.log('Post created successfully:', response);

      setSuccess('Bài viết đã được thêm thành công!');
      
      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: ''
      });

      // Redirect to posts list after 2 seconds
      setTimeout(() => {
        navigate('/nurse/blog/posts');
      }, 2000);

    } catch (error) {
      console.error('Error adding post:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi thêm bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/nurse/blog/posts');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="text-primary fw-bold mb-2">
                <i className="fas fa-plus me-2"></i>
                Thêm bài viết mới
              </h3>
              <p className="text-muted mb-0">
                Tạo bài viết mới cho cộng đồng
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
                  <Form.Label className="fw-semibold">Tóm tắt</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                  />
                  <Form.Text className="text-muted">
                    Mô tả ngắn gọn về nội dung bài viết (tùy chọn)
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
                    Hỗ trợ Markdown. Ví dụ: ## Tiêu đề, **in đậm**, *in nghiêng*
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
                    {postCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Thẻ (Tags)</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Y tế, dinh dưỡng, sức khỏe"
                  />
                  <Form.Text className="text-muted">
                    Phân cách bằng dấu phẩy. Ví dụ: Y tế, dinh dưỡng, sức khỏe
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
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Thêm bài viết
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

export default AddPost;
