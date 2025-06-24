import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as blogService from '../../services/APINurse/blogService';

// Tạo context
export const BlogContext = createContext();

// Custom hook để sử dụng context
export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog phải được sử dụng trong BlogProvider');
  }
  return context;
};

// Fake data để sử dụng khi API lỗi
const mockBlogs = [
  {
    id: 1,
    blogId: 1,
    title: "Cách phòng ngừa bệnh cúm mùa cho học sinh",
    summary: "Hướng dẫn cách phòng ngừa cúm mùa hiệu quả cho học sinh",
    content: "Cúm mùa là một bệnh truyền nhiễm phổ biến ở trẻ em trong độ tuổi đi học...",
    author: "Nguyễn Thị Bình",
    publishDate: "2025-05-10T08:30:00",
    category: "Phòng bệnh",
    imageUrl: "https://example.com/images/flu-prevention.jpg",
    thumbnailImage: "https://example.com/images/flu-prevention.jpg",
    tags: "cúm mùa, phòng bệnh, học sinh",
    isActive: true,
    createdByUser: {
      id: 1,
      name: "Nguyễn Thị Bình",
      role: "Y tá trưởng"
    },
    createdAt: "2025-05-10T08:30:00",
    updatedAt: null,
    viewCount: 125
  },
  {
    id: 2,
    blogId: 2,
    title: "Dinh dưỡng hợp lý cho học sinh trong mùa thi",
    summary: "Hướng dẫn dinh dưỡng cho học sinh mùa thi",
    content: "Mùa thi là giai đoạn học sinh cần một chế độ dinh dưỡng đặc biệt...",
    author: "Lê Văn Cường",
    publishDate: "2025-05-18T09:45:00",
    category: "Dinh dưỡng",
    imageUrl: "https://example.com/images/exam-nutrition.jpg",
    thumbnailImage: "https://example.com/images/exam-nutrition.jpg",
    tags: "dinh dưỡng, mùa thi, học sinh",
    isActive: true,
    createdByUser: {
      id: 2,
      name: "Lê Văn Cường",
      role: "Nhân viên y tế"  
    },
    createdAt: "2025-05-18T09:45:00",
    updatedAt: null,
    viewCount: 98
  }
];

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Lấy tất cả bài viết
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogService.getAllBlogs();
      console.log("API Response:", data);
      setBlogs(data || mockBlogs);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bài viết:', err);
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      // Sử dụng mock data khi API lỗi
      setBlogs(mockBlogs);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load bài viết khi khởi tạo
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Lấy chi tiết bài viết
  const getBlogById = async (id) => {
    try {
      setLoading(true);
      const data = await blogService.getBlogById(id);
      setSelectedBlog(data);
      return data;
    } catch (err) {
      console.error(`Lỗi khi lấy bài viết có ID ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Thêm bài viết mới
  const addBlog = async (blogData) => {
    try {
      setLoading(true);
      console.log("BlogContext - Dữ liệu gửi đi:", blogData);
      
      // Đảm bảo dữ liệu đúng định dạng trước khi gửi
      const sanitizedData = {
        ...blogData,
        tags: blogData.tags || '',
        viewCount: blogData.viewCount || 0,
        isActive: blogData.isActive === undefined ? true : blogData.isActive
      };
      
      const result = await blogService.createBlog(sanitizedData);
      console.log("BlogContext - Kết quả trả về:", result);
      
      // Cập nhật state blogs với bài viết mới
      setBlogs(prevBlogs => [...prevBlogs, result]);
      return result;
    } catch (err) {
      console.error('BlogContext - Lỗi khi thêm bài viết:', err.response || err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật bài viết
  const updateBlog = async (blogData) => {
    try {
      setLoading(true);
      const result = await blogService.updateBlog(blogData.blogId, blogData);
      setBlogs(blogs.map(blog => blog.blogId === blogData.blogId ? result : blog));
      return result;
    } catch (err) {
      console.error(`Lỗi khi cập nhật bài viết:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa bài viết
  const removeBlog = async (id) => {
    try {
      setLoading(true);
      await blogService.deleteBlog(id);
      setBlogs(blogs.filter(blog => blog.blogId !== id));
      return true;
    } catch (err) {
      console.error(`Lỗi khi xóa bài viết:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh danh sách bài viết
  const refreshBlogs = () => {
    fetchBlogs();
  };

  const value = {
    blogs,
    loading,
    error,
    selectedBlog,
    setSelectedBlog,
    fetchBlogs,
    getBlogById,
    addBlog,
    updateBlog,
    removeBlog,
    refreshBlogs
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};