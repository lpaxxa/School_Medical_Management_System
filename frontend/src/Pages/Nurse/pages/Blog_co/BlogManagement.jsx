import React, { useState, useEffect, useCallback } from 'react';
import './BlogManagement.css';
import { useBlog } from '../../../../context/NurseContext/BlogContext';

const BlogManagement = () => {
  console.log('BlogManagement component is rendering');
  
  // Sử dụng BlogContext thay vì mockData
  const { blogs, loading, error, fetchBlogs, addBlog, updateBlog, removeBlog } = useBlog();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [modalMode, setModalMode] = useState('view');
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
    
    // Chỉ giữ lại phần lọc theo search
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
      thumbnailImage: '',
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
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await removeBlog(blogId);
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Xóa error một cách riêng biệt để tránh việc re-render không cần thiết
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = useCallback(() => {
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
    
    return newErrors;
  }, [formData]);

  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = modalMode === 'add' ? 'Đang thêm...' : 'Đang lưu...';
    }

    try {
      const formattedData = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags : '',
        viewCount: formData.viewCount || 0
      };

      if (modalMode === 'add') {
        const newBlog = {
          ...formattedData,
          blogId: blogs.length > 0 ? Math.max(...blogs.map(b => b.blogId || 0)) + 1 : 1,
          createdByUser: {
            id: 2,
            name: "Nguyễn Thị Bình",
            role: "Y tá trưởng"
          },
          createdAt: new Date().toISOString(),
          updatedAt: null,
          viewCount: 0
        };
        
        await addBlog(newBlog);
        
        setFormData({
          title: '',
          content: '',
          thumbnailImage: '',
          tags: '',
          isActive: true,
          notes: ''
        });
      } else if (modalMode === 'edit') {
        const updatedBlog = {
          ...formattedData,
          updatedAt: new Date().toISOString()
        };
        
        await updateBlog(updatedBlog);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error("Lỗi khi xử lý bài viết:", error);
      alert(`Có lỗi xảy ra: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = modalMode === 'add' ? 'Thêm bài viết' : 'Lưu thay đổi';
      }
    }
  };

  // Toggle blog active status
  const toggleBlogStatus = async (blogId) => {
    // Lấy blog hiện tại
    const blogToToggle = blogs.find(blog => blog.blogId === blogId);
    if (!blogToToggle) return;
    
    // Tạo bản sao và đổi trạng thái
    const updatedBlog = { 
      ...blogToToggle,
      isActive: !blogToToggle.isActive,
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Gọi hàm updateBlog từ context
      await updateBlog(updatedBlog);
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    console.log('BlogManagement component mounted');
    fetchBlogs();
    
    return () => {
      console.log('BlogManagement component unmounted');
    };
  }, [fetchBlogs]);
  
  // Simple Blog Card component
  const BlogCard = ({ blog }) => (
    <div className="blog-card">
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
          <span className={blog.isActive ? 'status-active' : 'status-inactive'}>
            {blog.isActive ? 'Đang hoạt động' : ''}
          </span>
        </div>
        <div className="tags">
          {blog.tags && typeof blog.tags === 'string'
            ? blog.tags.split(',').map((tag, index) => (
                <span key={index} className="tag">{tag.trim()}</span>
              ))
            : Array.isArray(blog.tags)
              ? blog.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))
              : null
          }
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
  );
  
  // Blog Detail component cho modal view
  const BlogDetail = ({ blog }) => (
    <div className="blog-detail">
      <img 
        src={blog.thumbnailImage} 
        alt={blog.title} 
        className="blog-detail-image"
      />
      
      <div className="blog-detail-header">
        <h2 className="blog-detail-title">{blog.title}</h2>
        <div className="blog-detail-meta">
          <span>
            <i className="fas fa-user"></i> {blog.createdByUser.name}
          </span>
          <span>
            <i className="fas fa-calendar"></i> Tạo: {formatDate(blog.createdAt)}
          </span>
          {blog.updatedAt && (
            <span>
              <i className="fas fa-edit"></i> Cập nhật: {formatDate(blog.updatedAt)}
            </span>
          )}
          <span>
            <i className="fas fa-eye"></i> {blog.viewCount} lượt xem
          </span>
        </div>
        
        <div className="tags">
          {blog.tags && typeof blog.tags === 'string'
            ? blog.tags.split(',').map((tag, index) => (
                <span key={index} className="tag">{tag.trim()}</span>
              ))
            : Array.isArray(blog.tags)
              ? blog.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))
              : null
          }
        </div>
      </div>
      
      <div className="blog-detail-content">
        {blog.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        
        {blog.notes && (
          <div className="blog-notes">
            <h4>Ghi chú:</h4>
            <p>{blog.notes}</p>
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
              handleEditBlog(blog);
            }}
            style={{ marginRight: '10px' }}
          >
            <i className="fas fa-edit"></i> Chỉnh sửa
          </button>
          <button 
            className={`btn-${blog.isActive ? 'secondary' : 'primary'}`}
            onClick={() => {
              toggleBlogStatus(blog.blogId);
              setShowModal(false);
            }}
          >
            <i className={`fas ${blog.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            {blog.isActive ? ' Ẩn bài viết' : ' Hiện bài viết'}
          </button>
        </div>
      </div>
    </div>
  );
  
  // Form component
  const BlogForm = () => {
    return (
      <form onSubmit={handleFormSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title">Tiêu đề bài viết <span className="required">*</span></label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
            placeholder="Nhập tiêu đề bài viết"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>
            Ảnh đại diện <span className="required">*</span>
          </label>
          <input
            type="text"
            name="thumbnailImage"
            value={formData.thumbnailImage}
            onChange={handleInputChange}
            placeholder="Nhập đường dẫn ảnh"
            className={errors.thumbnailImage ? 'error' : ''}
          />
          {errors.thumbnailImage && <span className="error-text">{errors.thumbnailImage}</span>}
          {formData.thumbnailImage && (
            <div className="image-preview">
              <img
                src={formData.thumbnailImage}
                alt="Preview"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200?text=Preview+Image';
                }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>
            Nội dung <span className="required">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Nhập nội dung bài viết"
            rows="8"
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <span className="error-text">{errors.content}</span>}
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Nhập tags (phân cách bằng dấu phẩy)"
          />
          {formData.tags && (
            <div className="tags-preview">
              {formData.tags.split(',').map((tag, index) => (
                <span key={index} className="tag-item">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Nhập ghi chú nội bộ"
            rows="4"
          />
        </div>

        <div className="form-group checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
            <span>Kích hoạt bài viết</span>
          </label>
        </div>

        <div className="form-actions-new">
          <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
            Hủy
          </button>
          <button type="submit" className="btn-submit">
            {modalMode === 'add' ? 'Thêm bài viết' : 'Cập nhật'}
          </button>
        </div>
      </form>
    );
  };
  
  // Main component render
  return (
    <div className="blog-management">
      {/* Loading indicator */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Đang tải...</div>
        </div>
      )}
      
      {/* Error display */}
      {error && !loading && (
        <div className="error-message-container">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchBlogs}>
            <i className="fas fa-sync"></i> Thử lại
          </button>
        </div>
      )}
      
      <div className="section-header">
        <div className="header-title">
          <h2>Quản lý Blog</h2>
          <p className="subtitle">Quản lý các bài viết, thông tin sức khỏe cho học sinh và phụ huynh</p>
        </div>
        <button className="btn-primary" onClick={handleAddBlog}>
          <i className="fas fa-plus"></i> Thêm bài viết mới
        </button>
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
          {getFilteredBlogs().map(blog => <BlogCard key={blog.blogId} blog={blog} />)}
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
                    : 'Chỉnh sửa bài viết'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {modalMode === 'view' ? (
                <BlogDetail blog={currentBlog} />
              ) : (
                <BlogForm />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export simplified component for testing
export const SimpleBlogManagement = () => {
  console.log('Rendering SimpleBlogManagement component');
  
  React.useEffect(() => {
    console.log('SimpleBlogManagement component mounted');
    return () => {
      console.log('SimpleBlogManagement component unmounted');
    };
  }, []);
  
  return (
    <div className="blog-management-simple">
      <h2>Blog Management</h2>
      <p>This is a simplified version of the blog management component.</p>
      
      <div className="blog-card-simple">
        <h3 className="blog-title-simple">Sample Blog Post</h3>
        <p className="blog-content-simple">This is a sample blog post content to test if the component renders correctly.</p>
      </div>
    </div>
  );
};

export default BlogManagement;
