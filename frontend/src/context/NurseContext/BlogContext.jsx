import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import * as blogService from '../../services/APINurse/blogService';

// Utility functions for Health Articles permissions (moved from healthArticlePermissions.js)

/**
 * Check if current user has permission to edit/delete a health article
 * @param {Object} currentUser - Current logged in user from AuthContext
 * @param {Object} article - Article object to check permissions for
 * @returns {boolean} - True if user can edit/delete, false otherwise
 */
export const canUserEditHealthArticle = (currentUser, article) => {
  // No user or article
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

/**
 * Check if current user has permission to create health articles
 * @param {Object} currentUser - Current logged in user from AuthContext
 * @returns {boolean} - True if user can create articles, false otherwise
 */
export const canUserCreateHealthArticle = (currentUser) => {
  if (!currentUser) {
    return false;
  }
  
  // Only admin and nurse can create health articles
  return currentUser.role === 'admin' || currentUser.role === 'nurse';
};

/**
 * Get author display name from article or current user
 * @param {Object} article - Article object
 * @param {Object} currentUser - Current user for fallback
 * @returns {string} - Display name for author
 */
export const getAuthorDisplayName = (article, currentUser = null) => {
  // Ưu tiên hiển thị author từ API response
  if (article.author && typeof article.author === 'string') {
    return article.author;
  }
  
  if (article.author && article.author.name) {
    return article.author.name;
  }
  
  // Sau đó hiển thị memberName nếu có
  if (article.memberName) {
    return article.memberName;
  }
  
  // Nếu là user hiện tại thì hiển thị tên của user
  if (currentUser && (
    article.authorId === currentUser.id ||
    article.authorId === currentUser.memberId ||
    article.memberId === currentUser.id ||
    article.memberId === currentUser.memberId
  )) {
    return currentUser.fullName || currentUser.name || currentUser.email;
  }
  
  // Fallback hiển thị memberId nếu có
  if (article.memberId) {
    return `User ${article.memberId}`;
  }
  
  return 'Không có tác giả';
};

/**
 * Prepare article data for API submission
 * @param {Object} formData - Form data from component
 * @param {Object} currentUser - Current logged in user
 * @returns {Object} - Formatted data for API
 */
export const prepareHealthArticleData = (formData, currentUser) => {
  return {
    title: formData.title?.trim(),
    summary: formData.summary?.trim(),
    content: formData.content?.trim(),
    category: formData.category,
    imageUrl: formData.imageUrl || '',
    tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
    authorId: currentUser?.id || currentUser?.memberId,
    author: currentUser?.fullName || currentUser?.name || currentUser?.email,
    memberId: currentUser?.memberId || currentUser?.id
  };
};

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

// Mock data để sử dụng khi API lỗi
const mockBlogs = [
  {
    id: 1,
    title: "Preventing Dengue Fever in Schools",
    summary: "Tips and guidelines to help students avoid dengue outbreaks during the rainy season.",
    content: "With the rainy season approaching, schools must take preventive measures against dengue fever. This includes eliminating standing water, using mosquito repellents, and educating students on symptoms and early detection...",
    author: "School Health Officer",
    memberId: "NURSE002",
    memberName: "yta_tran",
    publishDate: "2025-06-25T07:41:03.731111",
    category: "Disease Prevention",
    imageUrl: "https://schoolmed.example.com/images/dengue-awareness.jpg",
    tags: ["disease", "dengue", "school-health", "prevention"]
  },
  {
    id: 2,
    title: "Healthy Eating Habits for Students",
    summary: "Guidelines for balanced nutrition to support student growth and learning.",
    content: "Proper nutrition plays a crucial role in student development and academic performance. This article provides practical advice for parents and schools to ensure students have balanced meals...",
    author: "Nutritionist Le",
    memberId: "NURSE001",
    memberName: "yta_nguyen",
    publishDate: "2025-06-20T10:15:00.000000",
    category: "Nutrition",
    imageUrl: "https://schoolmed.example.com/images/healthy-eating.jpg",
    tags: ["nutrition", "student-health", "diet", "balanced-meals"]
  }
];

// Mock data cho community posts
const mockPosts = [
  {
    id: 1,
    title: "Ảnh hưởng của ô nhiễm không khí",
    excerpt: "Ô nhiễm không khí và sức khỏe học sinh",
    content: "Nội dung đầy đủ về tác động của ô nhiễm không khí đến học sinh.",
    category: "Sức khỏe tâm thần",
    author: {
      id: "NURSE001",
      name: "yta_nguyen",
      avatar: "/images/avatars/default.jpg",
      role: "NURSE",
      bio: ""
    },
    createdAt: "2025-06-28T09:00:00",
    updatedAt: "2025-06-28T10:00:00",
    likes: 10,
    commentsCount: 3,
    tags: ["không khí", "sức khỏe", "học sinh"],
    pinned: true,
    bookmarked: false,
    liked: false
  },
  {
    id: 2,
    title: "Hướng dẫn phòng ngừa cảm cúm mùa đông",
    excerpt: "Mùa đông là thời điểm cảm cúm dễ bùng phát",
    content: "Mùa đông là thời điểm cảm cúm dễ bùng phát. Để phòng ngừa hiệu quả, chúng ta cần thực hiện các biện pháp như: rửa tay thường xuyên, đeo khẩu trang khi ra ngoài, tăng cường sức đề kháng bằng cách ăn uống đầy đủ chất dinh dưỡng và tập thể dục đều đặn...",
    category: "COVID-19 và trẻ em",
    author: {
      id: "NURSE002",
      name: "yta_tran",
      avatar: "/images/avatars/nurse2.jpg",
      role: "NURSE",
      bio: "Y tá trường với 5 năm kinh nghiệm"
    },
    createdAt: "2025-06-25T14:30:00",
    updatedAt: "2025-06-25T15:15:00",
    likes: 15,
    commentsCount: 5,
    tags: ["cảm cúm", "phòng bệnh", "mùa đông"],
    pinned: false,
    bookmarked: true,
    liked: true
  }
];

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [categories, setCategories] = useState([
    "Disease Prevention", 
    "Nutrition", 
    "Mental Health", 
    "First Aid", 
    "Physical Activity",
    "Health Information",
    "Other"
  ]);
  
  // State cho community posts
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postCategories] = useState([
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
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Thêm hàm này vào BlogProvider
  const processImageUrl = (url) => {
    if (!url) return null;
    
    // Nếu là URL tuyệt đối (https://...)
    if (url.startsWith('http')) {
      return url;
    }
    
    // Nếu là URL tương đối (/images/...)
    if (url.startsWith('/')) {
      return `${import.meta.env.VITE_BACKEND_URL}${url}`;
    }
    
    return url;
  };

  // Lấy tất cả bài viết
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogService.getAllBlogs();
      console.log("API Response:", data);
      
      // Đảm bảo dữ liệu trả về là mảng
      if (Array.isArray(data)) {
        // Xử lý URL ảnh cho mỗi bài viết
        const processedData = data.map(blog => ({
          ...blog,
          imageUrl: processImageUrl(blog.imageUrl)
        }));
        
        setBlogs(processedData);
        
        // Cập nhật danh sách category từ dữ liệu API
        const uniqueCategories = [...new Set(data.map(blog => blog.category))].filter(Boolean);
        if (uniqueCategories.length > 0) {
          setCategories(prev => [...new Set([...prev, ...uniqueCategories])]);
        }
      } else {
        console.warn("API không trả về mảng dữ liệu:", data);
        setBlogs(mockBlogs);
      }
      
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
      // Tìm bài viết trong state nếu API lỗi
      const localBlog = blogs.find(blog => blog.id === parseInt(id));
      if (localBlog) {
        setSelectedBlog(localBlog);
        return localBlog;
      }
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
      
      // Cập nhật state blogs sau khi xóa
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== id));
      return true;
    } catch (err) {
      console.error(`Lỗi khi xóa bài viết:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh
  const uploadImage = async (file, articleId = null) => {
    try {
      setLoading(true);
      
      let imageUrl;
      try {
        // Truyền articleId khi cần
        imageUrl = await blogService.uploadImage(file, articleId);
      } catch (uploadErr) {
        console.warn('Không thể upload ảnh qua API, chuyển sang sử dụng base64:', uploadErr);
        // Fallback: chuyển đổi ảnh thành base64
        imageUrl = await blogService.convertImageToBase64(file);
      }
      
      return imageUrl;
    } catch (err) {
      console.error('Lỗi khi xử lý ảnh:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lọc blog theo danh mục và từ khóa
  const filterBlogs = (category, searchTerm) => {
    let filteredResults = [...blogs];
    
    if (category && category !== 'all') {
      filteredResults = filteredResults.filter(blog => blog.category === category);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(blog => 
        blog.title.toLowerCase().includes(term) || 
        blog.summary.toLowerCase().includes(term) || 
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    return filteredResults;
  };

  // COMMUNITY POSTS FUNCTIONS
  
  // Lấy danh sách bài posts có phân trang
  const fetchPosts = useCallback(async (page = 1, size = 10) => {
    try {
      setPostsLoading(true);
      const response = await blogService.getPosts(page, size);
      console.log("API Response (posts):", response);
      
      // Kiểm tra cấu trúc dữ liệu trả về
      let postsData = [];
      
      if (response && response.data && Array.isArray(response.data.content)) {
        // Trường hợp API trả về { data: { content: [...] } }
        postsData = response.data.content;
        
        // Cập nhật thông tin phân trang
        if (response.data.page !== undefined) {
          setCurrentPage(response.data.page);
          setPageSize(response.data.size || size);
          setTotalPages(Math.ceil((response.data.totalElements || 0) / (response.data.size || size)) || 1);
        }
      } else if (response && response.content && Array.isArray(response.content)) {
        // Trường hợp API trả về { content: [...] }
        postsData = response.content;
        
        // Cập nhật thông tin phân trang
        if (response.page !== undefined) {
          setCurrentPage(response.page);
          setPageSize(response.size || size);
          setTotalPages(Math.ceil((response.totalElements || 0) / (response.size || size)) || 1);
        }
      } else if (response && Array.isArray(response)) {
        // Trường hợp API trả về trực tiếp mảng
        postsData = response;
        setCurrentPage(page);
        setTotalPages(1);
        setPageSize(size);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Trường hợp API trả về { data: [...] }
        postsData = response.data;
        setCurrentPage(page);
        setTotalPages(1);
        setPageSize(size);
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        // Trường hợp API trả về { data: { data: [...] } }
        postsData = response.data.data;
        
        // Cập nhật thông tin phân trang nếu có
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage || page);
          setTotalPages(response.data.pagination.totalPages || 1);
          setPageSize(response.data.pagination.pageSize || size);
        } else {
          setCurrentPage(page);
          setTotalPages(1);
          setPageSize(size);
        }
      } else {
        console.warn("API không trả về dữ liệu posts hợp lệ:", response);
        setPosts(mockPosts);
        setPostsError(null);
        return;
      }
      
      // Xử lý URL ảnh cho avatar của tác giả và ảnh bài viết
      const processedPosts = postsData.map(post => ({
        ...post,
        imageUrl: processImageUrl(post.imageUrl),
        author: post.author ? {
          ...post.author,
          avatar: processImageUrl(post.author.avatar)
        } : post.author
      }));
      
      setPosts(processedPosts);
      setPostsError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách posts:', err);
      setPostsError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      // Sử dụng mock data khi API lỗi
      setPosts(mockPosts);
    } finally {
      setPostsLoading(false);
    }
  }, []);
  
  // Lấy chi tiết bài post
  const getPostById = async (id) => {
    try {
      setPostsLoading(true);
      const response = await blogService.getPostById(id);
      console.log("API Response (post detail):", response);
      
      let postData = null;
      
      if (response && response.data) {
        // Trường hợp API trả về { data: {...} }
        postData = response.data;
      } else if (response && response.id) {
        // Trường hợp API trả về trực tiếp object
        postData = response;
      } else if (response && response.data && response.data.data) {
        // Trường hợp API trả về { data: { data: {...} } }
        postData = response.data.data;
      } else {
        throw new Error('API không trả về dữ liệu post hợp lệ');
      }
      
      // Xử lý URL ảnh cho avatar của tác giả và ảnh bài viết
      const post = {
        ...postData,
        imageUrl: processImageUrl(postData.imageUrl),
        author: postData.author ? {
          ...postData.author,
          avatar: processImageUrl(postData.author.avatar)
        } : postData.author
      };
      
      setSelectedPost(post);
      return post;
    } catch (err) {
      console.error(`Lỗi khi lấy post có ID ${id}:`, err);
      
      // Tìm post trong state nếu API lỗi
      const localPost = posts.find(post => post.id === parseInt(id));
      if (localPost) {
        setSelectedPost(localPost);
        return localPost;
      }
      
      throw err;
    } finally {
      setPostsLoading(false);
    }
  };
  
  // Xóa bài post
  const removePost = async (id) => {
    try {
      setPostsLoading(true);
      await blogService.deletePost(id);
      
      // Cập nhật state posts sau khi xóa
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      return true;
    } catch (err) {
      console.error(`Lỗi khi xóa post:`, err);
      throw err;
    } finally {
      setPostsLoading(false);
    }
  };
  
  // Thích bài post
  const likePost = async (id) => {
    try {
      const response = await blogService.likePost(id);
      
      // Cập nhật state posts với số lượt thích mới
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === id) {
            return { 
              ...post, 
              likes: post.likes + 1,
              liked: true 
            };
          }
          return post;
        })
      );
      
      return response;
    } catch (err) {
      console.error(`Lỗi khi thích post:`, err);
      throw err;
    }
  };
  
  // Bỏ thích bài post
  const unlikePost = async (id) => {
    try {
      const response = await blogService.unlikePost(id);
      
      // Cập nhật state posts với số lượt thích mới
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === id) {
            return { 
              ...post, 
              likes: Math.max(0, post.likes - 1),
              liked: false 
            };
          }
          return post;
        })
      );
      
      return response;
    } catch (err) {
      console.error(`Lỗi khi bỏ thích post:`, err);
      throw err;
    }
  };
  
  // Đánh dấu bài post
  const bookmarkPost = async (id) => {
    try {
      const response = await blogService.bookmarkPost(id);
      
      // Cập nhật state posts với trạng thái đánh dấu mới
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === id) {
            return { ...post, bookmarked: true };
          }
          return post;
        })
      );
      
      return response;
    } catch (err) {
      console.error(`Lỗi khi đánh dấu post:`, err);
      throw err;
    }
  };
  
  // Bỏ đánh dấu bài post
  const unbookmarkPost = async (id) => {
    try {
      const response = await blogService.unbookmarkPost(id);
      
      // Cập nhật state posts với trạng thái đánh dấu mới
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === id) {
            return { ...post, bookmarked: false };
          }
          return post;
        })
      );
      
      return response;
    } catch (err) {
      console.error(`Lỗi khi bỏ đánh dấu post:`, err);
      throw err;
    }
  };
  
  // Lọc posts theo danh mục và từ khóa
  const filterPosts = (category, searchTerm) => {
    let filteredResults = [...posts];
    
    if (category && category !== 'all') {
      filteredResults = filteredResults.filter(post => post.category === category);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.excerpt?.toLowerCase().includes(term) || 
        post.content?.toLowerCase().includes(term) || 
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    return filteredResults;
  };

  const value = {
    // Blog values
    blogs,
    loading,
    error,
    categories,
    selectedBlog,
    setSelectedBlog,
    fetchBlogs,
    getBlogById,
    removeBlog,
    uploadImage,
    filterBlogs,
    
    // Community posts values
    posts,
    postsLoading,
    postsError,
    postCategories,
    selectedPost,
    setSelectedPost,
    currentPage,
    totalPages,
    pageSize,
    fetchPosts,
    getPostById,
    removePost,
    likePost,
    unlikePost,
    bookmarkPost,
    unbookmarkPost,
    filterPosts
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};