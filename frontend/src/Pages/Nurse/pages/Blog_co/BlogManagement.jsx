import React, { useState, useEffect } from 'react';
import './BlogManagement.css';

// Debugging: Log when module is imported
console.log('BlogManagement module is being imported');

// Mock data based on the schema from the provided image
const mockBlogs = [
  {
    blogId: 1,
    title: "Cách phòng ngừa bệnh cúm mùa cho học sinh",
    content: "Cúm mùa là một bệnh truyền nhiễm phổ biến ở trẻ em trong độ tuổi đi học. Để phòng ngừa hiệu quả, phụ huynh cần đảm bảo con em mình được tiêm vắc-xin cúm hàng năm, rửa tay thường xuyên bằng xà phòng, tránh tiếp xúc gần với người bệnh, và giữ vệ sinh cá nhân sạch sẽ. Khi phát hiện các triệu chứng như sốt cao, ho, đau họng, nhức đầu, đau nhức cơ thể, hãy cho trẻ nghỉ học và đến cơ sở y tế để được thăm khám kịp thời.",
    thumbnailImage: "https://example.com/images/flu-prevention.jpg",
    tags: "cúm mùa, phòng bệnh, học sinh",
    createdByUser: {
      id: 2,
      name: "Nguyễn Thị Bình",
      role: "Y tá trưởng"
    },
    createdAt: "2025-05-10T08:30:00",
    updatedAt: "2025-05-12T10:15:00",
    isActive: true,
    viewCount: 342,
    notes: "Bài viết được cập nhật với thông tin mới về vắc-xin cúm mùa"
  },
  {
    blogId: 2,
    title: "Dinh dưỡng hợp lý cho học sinh trong mùa thi",
    content: "Mùa thi là giai đoạn học sinh cần một chế độ dinh dưỡng đặc biệt để duy trì năng lượng và khả năng tập trung. Nên ăn đầy đủ các nhóm thực phẩm như protein (thịt, cá, trứng, đậu), carbohydrate phức hợp (gạo lứt, khoai lang), rau xanh và trái cây giàu vitamin. Tránh thức ăn nhanh, đồ ngọt và caffeine. Uống đủ nước và chia nhỏ bữa ăn trong ngày để duy trì năng lượng ổn định. Bổ sung omega-3 từ cá, hạt chia và óc chó giúp cải thiện trí nhớ và khả năng tập trung.",
    thumbnailImage: "https://example.com/images/exam-nutrition.jpg",
    tags: "dinh dưỡng, mùa thi, học sinh, sức khỏe",
    createdByUser: {
      id: 2,
      name: "Nguyễn Thị Bình",
      role: "Y tá trưởng"
    },
    createdAt: "2025-05-18T09:45:00",
    updatedAt: null,
    isActive: true,
    viewCount: 287,
    notes: ""
  },
  {
    blogId: 3,
    title: "Dấu hiệu nhận biết trẻ bị rối loạn tâm lý học đường",
    content: "Rối loạn tâm lý học đường đang ngày càng phổ biến và cần được phát hiện sớm. Một số dấu hiệu cần lưu ý: thay đổi đột ngột về kết quả học tập, né tránh đến trường, cô lập bản thân, thay đổi thói quen ăn uống hoặc ngủ nghỉ, cáu gắt hoặc buồn chán kéo dài, mất hứng thú với các hoạt động yêu thích trước đây. Phụ huynh và giáo viên cần quan sát và lắng nghe học sinh, tạo môi trường an toàn để trẻ chia sẻ và tìm kiếm sự hỗ trợ từ chuyên gia tâm lý nếu cần.",
    thumbnailImage: "https://example.com/images/mental-health.jpg",
    tags: "tâm lý học đường, sức khỏe tâm thần, học sinh",
    createdByUser: {
      id: 3,
      name: "Lê Văn Cường",
      role: "Y tá trường"
    },
    createdAt: "2025-06-02T14:20:00",
    updatedAt: "2025-06-03T09:10:00",
    isActive: true,
    viewCount: 156,
    notes: "Tham khảo ý kiến từ chuyên gia tâm lý Đại học Y"
  },
  {
    blogId: 4,
    title: "Hướng dẫn sơ cứu cơ bản tại trường học",
    content: "Sơ cứu đúng cách và kịp thời tại trường học có thể cứu sống học sinh trong trường hợp khẩn cấp. Bài viết này cung cấp hướng dẫn chi tiết về cách xử lý các tình huống thường gặp như: xử trí vết thương hở, cầm máu, sơ cứu gãy xương, xử trí khi học sinh bị ngất, cách thực hiện hô hấp nhân tạo và ép tim ngoài lồng ngực, xử trí khi học sinh bị hóc dị vật, bỏng và say nắng. Mỗi trường học nên có bộ dụng cụ sơ cứu và đảm bảo nhân viên được đào tạo về kỹ năng sơ cứu cơ bản.",
    thumbnailImage: "https://example.com/images/first-aid.jpg",
    tags: "sơ cứu, an toàn trường học, y tế học đường",
    createdByUser: {
      id: 2,
      name: "Nguyễn Thị Bình",
      role: "Y tá trưởng"
    },
    createdAt: "2025-06-10T11:00:00",
    updatedAt: null,
    isActive: true,
    viewCount: 423,
    notes: "Cần cập nhật thêm phần sơ cứu đuối nước"
  },
  {
    blogId: 5,
    title: "Các bài tập thể dục đơn giản giúp học sinh tăng cường sức khỏe",
    content: "Hoạt động thể chất đóng vai trò quan trọng trong sự phát triển toàn diện của học sinh. Các bài tập đơn giản có thể thực hiện tại trường hoặc tại nhà bao gồm: bài tập khởi động cơ bản (xoay cổ, xoay vai, gập người), các bài tập cardio nhẹ nhàng (nhảy dây, đi bộ nhanh), các động tác tăng cường sức mạnh cơ bắp (chống đẩy, gập bụng), và các bài tập kéo giãn. Mỗi ngày chỉ cần 15-30 phút tập luyện sẽ giúp tăng cường sức đề kháng, cải thiện tập trung và giảm stress học tập.",
    thumbnailImage: "https://example.com/images/exercise.jpg",
    tags: "thể dục, sức khỏe, học sinh",
    createdByUser: {
      id: 3,
      name: "Lê Văn Cường",
      role: "Y tá trường"
    },
    createdAt: "2025-06-12T16:30:00",
    updatedAt: "2025-06-13T08:45:00",
    isActive: false,
    viewCount: 98,
    notes: "Đang chờ thêm tư vấn từ giáo viên thể dục"
  }
];

// Placeholder URLs for thumbnail images
const placeholderImages = [
  "https://via.placeholder.com/800x450/4caf50/ffffff?text=Phòng+ngừa+bệnh+cúm+mùa",
  "https://via.placeholder.com/800x450/2196f3/ffffff?text=Dinh+dưỡng+học+sinh",
  "https://via.placeholder.com/800x450/f44336/ffffff?text=Sức+khỏe+tâm+lý",
  "https://via.placeholder.com/800x450/ff9800/ffffff?text=Sơ+cứu+học+đường",
  "https://via.placeholder.com/800x450/9c27b0/ffffff?text=Thể+dục+tăng+cường",
];

// Fix mock data with placeholder images - ensure they're using valid URLs
mockBlogs.forEach((blog, index) => {
  blog.thumbnailImage = placeholderImages[index % placeholderImages.length];
  
  // Log for debugging
  console.log(`Assigned image URL to blog ${blog.blogId}:`, blog.thumbnailImage);
});

const BlogManagement = () => {
  console.log('BlogManagement component is rendering');
  
  // Add an effect to log when the component mounts
  useEffect(() => {
    console.log('BlogManagement component mounted');
    // Alert for immediate feedback when component mounts
    alert('Blog Management Component Loaded');
    
    return () => {
      console.log('BlogManagement component unmounted');
    };
  }, []);
  
  const [blogs, setBlogs] = useState(mockBlogs);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // view, add, edit
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thumbnailImage: '',
    tags: '',
    isActive: true,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Filter blogs based on active tab and search term
  const getFilteredBlogs = () => {
    let filtered = [...blogs];
    
    // Apply tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(blog => blog.isActive);
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(blog => !blog.isActive);
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(search) || 
        blog.content.toLowerCase().includes(search) || 
        blog.tags.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  };

  // Handle view blog
  const handleViewBlog = (blog) => {
    setCurrentBlog(blog);
    setModalMode('view');
    setShowModal(true);
  };

  // Handle add new blog
  const handleAddBlog = () => {
    setFormData({
      title: '',
      content: '',
      thumbnailImage: placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
      tags: '',
      isActive: true,
      notes: ''
    });
    setErrors({});
    setModalMode('add');
    setShowModal(true);
  };

  // Handle edit blog
  const handleEditBlog = (blog) => {
    setFormData({
      blogId: blog.blogId,
      title: blog.title,
      content: blog.content,
      thumbnailImage: blog.thumbnailImage,
      tags: blog.tags,
      isActive: blog.isActive,
      notes: blog.notes || ''
    });
    setErrors({});
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle delete blog
  const handleDeleteBlog = (blogId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      setBlogs(blogs.filter(blog => blog.blogId !== blogId));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung bài viết';
    }
    
    if (!formData.thumbnailImage.trim()) {
      newErrors.thumbnailImage = 'Vui lòng nhập đường dẫn ảnh đại diện';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (modalMode === 'add') {
      // Create new blog
      const newBlog = {
        ...formData,
        blogId: blogs.length > 0 ? Math.max(...blogs.map(b => b.blogId)) + 1 : 1,
        createdByUser: {
          id: 2,
          name: "Nguyễn Thị Bình",
          role: "Y tá trưởng"
        },
        createdAt: new Date().toISOString(),
        updatedAt: null,
        viewCount: 0
      };
      
      setBlogs([...blogs, newBlog]);
    } else if (modalMode === 'edit') {
      // Update existing blog
      const updatedBlogs = blogs.map(blog => 
        blog.blogId === formData.blogId 
          ? { 
              ...blog, 
              ...formData, 
              updatedAt: new Date().toISOString() 
            } 
          : blog
      );
      
      setBlogs(updatedBlogs);
    }
    
    setShowModal(false);
  };

  // Toggle blog active status
  const toggleBlogStatus = (blogId) => {
    const updatedBlogs = blogs.map(blog => 
      blog.blogId === blogId 
        ? { 
            ...blog, 
            isActive: !blog.isActive,
            updatedAt: new Date().toISOString()
          } 
        : blog
    );
    
    setBlogs(updatedBlogs);
  };

  return (
    <div className="blog-management">
      <div className="section-header">
        <div className="header-title">
          <h2>Quản lý Blog</h2>
          <p className="subtitle">Quản lý các bài viết, thông tin sức khỏe cho học sinh và phụ huynh</p>
        </div>
        <button className="btn-primary" onClick={handleAddBlog}>
          <i className="fas fa-plus"></i> Thêm bài viết mới
        </button>
      </div>
      
      <div className="blog-tabs">
        <div 
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả bài viết
        </div>
        <div 
          className={`tab-item ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Đang hoạt động
        </div>
        <div 
          className={`tab-item ${activeTab === 'inactive' ? 'active' : ''}`}
          onClick={() => setActiveTab('inactive')}
        >
          Ngừng hoạt động
        </div>
      </div>
      
      <div className="filters">
        <input 
          type="text" 
          placeholder="Tìm kiếm bài viết..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {getFilteredBlogs().length > 0 ? (
        <div className="blog-list">
          {getFilteredBlogs().map(blog => (
            <div key={blog.blogId} className="blog-card">
              <img 
                src={blog.thumbnailImage} 
                alt={blog.title} 
                className="blog-image" 
              />
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <div className="blog-excerpt">
                  {blog.content.substring(0, 150)}...
                </div>
                <div className="blog-meta">
                  <span>
                    <i className="fas fa-eye"></i> {blog.viewCount} lượt xem
                  </span>
                  <span className={blog.isActive ? 'status-active' : 'status-inactive'}>
                    {blog.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
                <div className="tags">
                  {blog.tags.split(',').map((tag, index) => (
                    <span key={index} className="tag">{tag.trim()}</span>
                  ))}
                </div>
                <div className="blog-actions">
                  <button 
                    className="action-btn view" 
                    onClick={() => handleViewBlog(blog)}
                    title="Xem chi tiết"
                  >
                    <i className="fas fa-eye"></i> Xem
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditBlog(blog)}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i> Sửa
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => toggleBlogStatus(blog.blogId)}
                    title={blog.isActive ? 'Ẩn bài viết' : 'Hiện bài viết'}
                  >
                    <i className={`fas ${blog.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    {blog.isActive ? ' Ẩn' : ' Hiện'}
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteBlog(blog.blogId)}
                    title="Xóa bài viết"
                  >
                    <i className="fas fa-trash"></i> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-newspaper"></i>
          <p className="empty-state-text">Không tìm thấy bài viết nào</p>
        </div>
      )}
      
      {/* Modal for Viewing/Adding/Editing Blog */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {modalMode === 'view' 
                  ? 'Chi tiết bài viết' 
                  : modalMode === 'add' 
                    ? 'Thêm bài viết mới' 
                    : 'Chỉnh sửa bài viết'
                }
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {modalMode === 'view' && currentBlog && (
                <div className="blog-detail">
                  <img 
                    src={currentBlog.thumbnailImage} 
                    alt={currentBlog.title} 
                    className="blog-detail-image"
                  />
                  
                  <div className="blog-detail-header">
                    <h2 className="blog-detail-title">{currentBlog.title}</h2>
                    <div className="blog-detail-meta">
                      <span>
                        <i className="fas fa-user"></i> {currentBlog.createdByUser.name}
                      </span>
                      <span>
                        <i className="fas fa-calendar"></i> Tạo: {formatDate(currentBlog.createdAt)}
                      </span>
                      {currentBlog.updatedAt && (
                        <span>
                          <i className="fas fa-edit"></i> Cập nhật: {formatDate(currentBlog.updatedAt)}
                        </span>
                      )}
                      <span>
                        <i className="fas fa-eye"></i> {currentBlog.viewCount} lượt xem
                      </span>
                    </div>
                    
                    <div className="tags">
                      {currentBlog.tags.split(',').map((tag, index) => (
                        <span key={index} className="tag">{tag.trim()}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="blog-detail-content">
                    {currentBlog.content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    
                    {currentBlog.notes && (
                      <div className="blog-notes">
                        <h4>Ghi chú:</h4>
                        <p>{currentBlog.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="blog-detail-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Đóng
                    </button>
                    <div>
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setModalMode('edit');
                          handleEditBlog(currentBlog);
                        }}
                        style={{ marginRight: '10px' }}
                      >
                        <i className="fas fa-edit"></i> Chỉnh sửa
                      </button>
                      <button 
                        className={`btn-${currentBlog.isActive ? 'secondary' : 'primary'}`}
                        onClick={() => {
                          toggleBlogStatus(currentBlog.blogId);
                          setShowModal(false);
                        }}
                      >
                        <i className={`fas ${currentBlog.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        {currentBlog.isActive ? ' Ẩn bài viết' : ' Hiện bài viết'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {(modalMode === 'add' || modalMode === 'edit') && (
                <form onSubmit={handleFormSubmit} className="blog-form">
                  <div className="form-group">
                    <label htmlFor="title">Tiêu đề bài viết <span className="required">*</span></label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className={`form-control ${errors.title ? 'error' : ''}`}
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                    {errors.title && <div className="error-message">{errors.title}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="thumbnailImage">Đường dẫn ảnh đại diện <span className="required">*</span></label>
                    <input
                      type="text"
                      id="thumbnailImage"
                      name="thumbnailImage"
                      className={`form-control ${errors.thumbnailImage ? 'error' : ''}`}
                      value={formData.thumbnailImage}
                      onChange={handleInputChange}
                      placeholder="Nhập đường dẫn ảnh đại diện"
                    />
                    {errors.thumbnailImage && <div className="error-message">{errors.thumbnailImage}</div>}
                    
                    {formData.thumbnailImage && (
                      <div className="thumbnail-preview" style={{ marginTop: '10px' }}>
                        <img 
                          src={formData.thumbnailImage} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="content">Nội dung bài viết <span className="required">*</span></label>
                    <textarea
                      id="content"
                      name="content"
                      className={`form-control ${errors.content ? 'error' : ''}`}
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Nhập nội dung bài viết chi tiết"
                      rows="10"
                    ></textarea>
                    {errors.content && <div className="error-message">{errors.content}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tags">Thẻ (tags)</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      className="form-control"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Nhập các thẻ, phân cách bằng dấu phẩy (vd: sức khỏe, dinh dưỡng)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Ghi chú nội bộ</label>
                    <textarea
                      id="notes"
                      name="notes"
                      className="form-control"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Nhập ghi chú nội bộ (không hiển thị với người đọc)"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        style={{ marginRight: '10px' }}
                      />
                      <label htmlFor="isActive">Bài viết hoạt động (hiển thị công khai)</label>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {modalMode === 'add' ? 'Thêm bài viết' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
