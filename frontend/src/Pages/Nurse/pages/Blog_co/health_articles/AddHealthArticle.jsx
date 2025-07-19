import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import * as healthArticleService from '../../../../../services/APINurse/blogService';
import './AddHealthArticle.css';
import SuccessNotification from './SuccessNotification';

const AddHealthArticle = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    imageUrl: '',
    tags: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  // Success notification states
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('add');

  // Health article categories
  const healthCategories = [
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Vui lòng đăng nhập để thêm bài viết');
      return;
    }

    // Kiểm tra quyền tạo bài viết (chỉ admin và nurse được phép)
    if (currentUser.role !== 'admin' && currentUser.role !== 'nurse') {
      setError('Bạn không có quyền tạo bài viết y tế');
      return;
    }

    console.log('Creating article with user:', currentUser);
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Tiêu đề không được để trống');
        return;
      }
      if (!formData.summary.trim()) {
        setError('Tóm tắt không được để trống');
        return;
      }
      if (!formData.content.trim()) {
        setError('Nội dung không được để trống');
        return;
      }
      if (!formData.category) {
        setError('Vui lòng chọn danh mục');
        return;
      }

      // Step 1: Prepare imageUrl (use placeholder if image selected, empty if not)
      let finalImageUrl = '';
      if (imageFile) {
        console.log('Step 1: Image file selected, using placeholder URL...');
        // Use a placeholder URL that indicates image will be uploaded
        // This satisfies the NOT NULL constraint while allowing post-creation upload
        finalImageUrl = 'PENDING_UPLOAD';
        console.log('Using placeholder imageUrl:', finalImageUrl);
      } else {
        console.log('No image selected, using empty string');
        finalImageUrl = '';
      }

      // Step 2: Create the article with text data and imageUrl
      // Sử dụng cấu trúc dữ liệu giống như EditHealthArticle để tránh lỗi 400 Bad Request
      const processedTags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

      const articleTextData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: processedTags,
        imageUrl: finalImageUrl // Use uploaded image URL or empty string
      };

      // Debug: Try different tag formats to see what backend expects
      console.log('Tags as array:', processedTags);
      console.log('Tags as string:', formData.tags);

      // Alternative: Try sending tags as string if array doesn't work
      const alternativeData = {
        ...articleTextData,
        tags: formData.tags || '',
        imageUrl: finalImageUrl // Use uploaded image URL or empty string
      };

      // Try with minimal required fields only + imageUrl (required by database)
      const minimalData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        category: formData.category,
        imageUrl: finalImageUrl // Use uploaded image URL or empty string
      };

      console.log('Alternative data with string tags:', alternativeData);
      console.log('Minimal data:', minimalData);

      console.log('Step 2: Creating health article with text data and imageUrl:', articleTextData);
      console.log('Final imageUrl:', finalImageUrl ? 'Has image' : 'No image');
      console.log('Current user info:', {
        id: currentUser?.id,
        role: currentUser?.role,
        email: currentUser?.email
      });

      // Try different data formats to find what works
      let createdArticle;
      let successfulFormat = '';

      try {
        console.log('Trying with minimal data (no tags)...');
        createdArticle = await healthArticleService.createHealthArticle(minimalData);
        successfulFormat = 'minimal';
      } catch (minimalError) {
        console.log('Minimal data failed, trying with string tags...');
        console.error('Minimal data error:', minimalError.response?.data);

        try {
          console.log('Trying with tags as string...');
          createdArticle = await healthArticleService.createHealthArticle(alternativeData);
          successfulFormat = 'string-tags';
        } catch (stringError) {
          console.log('String tags failed, trying with array tags...');
          console.error('String tags error:', stringError.response?.data);

          console.log('Trying with tags as array...');
          createdArticle = await healthArticleService.createHealthArticle(articleTextData);
          successfulFormat = 'array-tags';
        }
      }

      console.log(`✅ Success with format: ${successfulFormat}`);
      const newArticleId = createdArticle.id;
      console.log('Article created successfully with ID:', newArticleId);

      // Step 3: If image was selected, upload it and update the article
      if (imageFile && newArticleId && finalImageUrl === 'PENDING_UPLOAD') {
        console.log(`Step 3: Uploading actual image for article ID: ${newArticleId}`);
        try {
          await healthArticleService.uploadImageForHealthArticle(imageFile, newArticleId);
          console.log('Image uploaded and article updated successfully.');
        } catch (imageUploadError) {
          console.error('Image upload failed, but article was created:', imageUploadError);
          // Article is still created successfully, just without image
        }
      }

      // Show success notification instead of alert
      setNotificationType('add');
      setShowSuccessNotification(true);
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        content: '',
        category: '',
        imageUrl: '',
        tags: ''
      });
      setImageFile(null);
      setImagePreview('');

      // Redirect to health articles list after notification closes
      setTimeout(() => {
        navigate('/nurse/blog-management/health-articles');
      }, 3500); // Slightly longer than notification auto-hide

    } catch (error) {
      console.error('Error adding health article:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);

      let errorMessage = 'Có lỗi xảy ra khi thêm bài viết';

      if (error.response?.status === 400) {
        errorMessage = `Lỗi dữ liệu không hợp lệ (400): ${error.response?.data?.message || 'Vui lòng kiểm tra lại thông tin'}`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Lỗi xác thực (401): Vui lòng đăng nhập lại';
      } else if (error.response?.status === 403) {
        errorMessage = 'Lỗi phân quyền (403): Bạn không có quyền thực hiện thao tác này';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server (500): Vui lòng thử lại sau';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/nurse/blog-management/health-articles');
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
          
          .btn-outline-secondary:hover {
            background-color: #6c757d !important;
            border-color: #6c757d !important;
          }
          
          .text-primary {
            color: #0d6efd !important;
          }
          
          /* Focus state cho form controls */
          .form-control:focus {
            border-color: #86b7fe !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          }
          
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
          }
          
          /* Image upload styling - simplified for URL only */
          .form-control[type="url"] {
            border: 1px solid #dee2e6;
            background-color: #fff;
            padding: 0.75rem;
            border-radius: 0.375rem;
            transition: all 0.3s ease;
          }
          
          .form-control[type="url"]:hover {
            border-color: #0d6efd;
            background-color: rgba(13, 110, 253, 0.02);
          }
          
          .form-control[type="url"]:focus {
            border-color: #86b7fe !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
            background-color: rgba(13, 110, 253, 0.02);
          }
        `}
      </style>
      
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="text-primary fw-bold mb-2">
                <i className="fas fa-plus me-2"></i>
                Thêm bài viết y tế mới
              </h3>
              <p className="text-muted mb-0">
                Tạo bài viết y tế cho cộng đồng trường học
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
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Form.Text className="text-muted">
                    Chọn một ảnh để làm ảnh bìa cho bài viết (tùy chọn).
                  </Form.Text>

                  {/* Image preview */}
                  {imagePreview && (
                    <div className="mt-3">
                      <Form.Label className="small text-muted">Xem trước:</Form.Label>
                      <div className="position-relative d-inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Xem trước" 
                          className="img-fluid rounded shadow-sm image-preview"
                          onError={(e) => {
                            console.error('Image preview failed to load:', imagePreview);
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

      {/* Success Notification Modal */}
      <SuccessNotification
        show={showSuccessNotification}
        onHide={() => setShowSuccessNotification(false)}
        iconType={notificationType}
        autoHideDelay={3000}
      />
    </Container>
  );
};

export default AddHealthArticle;
