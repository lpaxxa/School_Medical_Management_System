import axios from 'axios';

// Cấu hình URL base
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/health-articles`;
const COMMUNITY_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/community`;

// Avatar mặc định cho người dùng
const DEFAULT_AVATAR = 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg';

// Hàm tạo mock comment với avatar mặc định
const createMockComment = (postId, id = 1, content = "Bình luận mẫu: Tôi có thể đăng ký ở đâu ạ?", authorName = "parent6", authorRole = "PARENT") => {
  return {
    id,
    postId,
    content,
    likesCount: 2,
    repliesCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: "ACC011",
      name: authorName,
      avatar: DEFAULT_AVATAR,
      role: authorRole
    },
    liked: false
  };
};

// Tạo instance axios với cấu hình chung
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const communityApi = axios.create({
  baseURL: COMMUNITY_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động đính kèm token xác thực
const addAuthToken = (config) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  const currentUserId = localStorage.getItem('currentUserId');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add user context to headers if available
  if (userRole) {
    config.headers['X-User-Role'] = userRole;
  }
  
  if (currentUserId) {
    config.headers['X-User-ID'] = currentUserId;
  }
  
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    params: config.params
  });
  
  return config;
};

api.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
communityApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));

// Lấy danh sách tất cả bài viết
export const getAllBlogs = async () => {
  try {
    const response = await api.get('');
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// Lấy chi tiết một bài viết theo ID
export const getBlogById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw error;
  }
};

// Tạo bài viết mới
export const createBlog = async (blogData) => {
  try {
    const response = await api.post('', blogData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// Upload ảnh cho bài viết y tế
export const uploadImageForArticle = async (file, articleId) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/${articleId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Cập nhật bài viết
export const updateBlog = async (id, blogData) => {
  try {
    const formattedData = {
      title: blogData.title,
      summary: blogData.summary || '',
      content: blogData.content,
      author: blogData.author || 'School Health Officer',
      category: blogData.category || 'Health Information',
      imageUrl: blogData.imageUrl || '',
      tags: Array.isArray(blogData.tags) ? blogData.tags : 
             typeof blogData.tags === 'string' ? blogData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    const response = await api.put(`/${id}`, formattedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw error;
  }
};

// Xóa bài viết
export const deleteBlog = async (id) => {
  try {
    await api.delete(`/${id}`);
    return { success: true, message: 'Xóa bài viết thành công' };
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw error;
  }
};

// Cập nhật phương thức upload ảnh
export const uploadImage = async (file, articleId = null) => {
  try {
    // Tạo form data để gửi file
    const formData = new FormData();
    formData.append('image', file);
    
    // Nếu đang chỉnh sửa bài viết hiện có
    if (articleId) {
      // Sử dụng endpoint upload ảnh cho bài viết cụ thể
      const endpoint = `${BASE_URL}/${articleId}/upload-image`;
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      // Trả về URL ảnh từ response
      return response.data.imageUrl;
    } else {
      // Khi thêm bài viết mới, sử dụng endpoint chung
      // Giả sử bạn có endpoint upload ảnh tạm thời
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/upload-temp-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data.imageUrl;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Fallback: convert to base64 when API fails
    console.log('Falling back to base64 encoding');
    return await convertImageToBase64(file);
  }
};

// Fallback: Nếu API upload ảnh không hoạt động, chuyển đổi file thành base64
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// ===== HEALTH ARTICLES API FUNCTIONS (from healthArticleService.js) =====

// Lấy danh sách tất cả bài viết y tế
export const getAllHealthArticles = async () => {
  try {
    const response = await api.get('');
    console.log('Health articles fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health articles:', error);
    throw error;
  }
};

// Lấy chi tiết một bài viết y tế theo ID
export const getHealthArticleById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    console.log('Health article fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching health article with ID ${id}:`, error);
    throw error;
  }
};

// Tạo bài viết y tế mới
export const createHealthArticle = async (articleData) => {
  try {
    console.log('Creating health article:', articleData);
    console.log('Request URL:', `${BASE_URL}`);
    console.log('Auth token exists:', !!localStorage.getItem('authToken'));
    console.log('User role:', localStorage.getItem('userRole'));
    console.log('User ID:', localStorage.getItem('currentUserId'));

    const response = await api.post('', articleData);
    console.log('Health article created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating health article:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    throw error;
  }
};

// Cập nhật bài viết y tế
export const updateHealthArticle = async (id, articleData) => {
  try {
    console.log('Updating health article:', id, articleData);
    const response = await api.put(`/${id}`, articleData);
    console.log('Health article updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating health article:', error);
    throw error;
  }
};

// Xóa bài viết y tế
export const deleteHealthArticle = async (id) => {
  try {
    console.log('Deleting health article:', id);
    const response = await api.delete(`/${id}`);
    console.log('Health article deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting health article:', error);
    throw error;
  }
};

// Upload ảnh cho bài viết y tế
export const uploadImageForHealthArticle = async (file, articleId) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // Sửa 'image' thành 'file' để khớp với backend
    
    console.log('Uploading image for health article:', articleId);
    const response = await api.post(`/${articleId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Image uploaded for health article:', response.data);
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image for health article:', error);
    throw error;
  }
};

// Lấy danh sách bài viết y tế theo danh mục
export const getHealthArticlesByCategory = async (category) => {
  try {
    const response = await api.get(`/category/${category}`);
    console.log('Health articles by category fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching health articles by category ${category}:`, error);
    throw error;
  }
};

// Tìm kiếm bài viết y tế
export const searchHealthArticles = async (query) => {
  try {
    const response = await api.get(`/search`, {
      params: { q: query }
    });
    console.log('Health articles search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching health articles:', error);
    throw error;
  }
};

// Lấy bài viết y tế phổ biến
export const getPopularHealthArticles = async (limit = 5) => {
  try {
    const response = await api.get('/popular', {
      params: { limit }
    });
    console.log('Popular health articles fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular health articles:', error);
    throw error;
  }
};

// Lấy bài viết y tế mới nhất
export const getLatestHealthArticles = async (limit = 10) => {
  try {
    const response = await api.get('/latest', {
      params: { limit }
    });
    console.log('Latest health articles fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest health articles:', error);
    throw error;
  }
};

// COMMUNITY POSTS API FUNCTIONS

// Lấy danh sách bài posts có phân trang
export const getPosts = async (page = 1, size = 10) => {
  try {
    const response = await communityApi.get(`/posts?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
};

// Lấy chi tiết bài post theo ID
export const getPostById = async (id) => {
  try {
    const response = await communityApi.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post with ID ${id}:`, error);
    throw error;
  }
};

// Tạo bài post mới
export const createPost = async (postData) => {
  try {
    const response = await communityApi.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
};

// Cập nhật bài post
export const updatePost = async (id, postData) => {
  try {
    const response = await communityApi.put(`/posts/${id}`, postData);
    return response.data;
  } catch (error) {
    console.error(`Error updating post with ID ${id}:`, error);
    throw error;
  }
};

// Xóa bài post
export const deletePost = async (id) => {
  try {
    await communityApi.delete(`/posts/${id}`);
    return { success: true, message: 'Xóa bài viết thành công' };
  } catch (error) {
    console.error(`Error deleting post with ID ${id}:`, error);
    throw error;
  }
};

// Thích/Hủy thích bài viết (toggle) - sử dụng chung 1 API POST
export const togglePostLike = async (postId) => {
  try {
    const response = await communityApi.post(`/posts/${postId}/like`);
    console.log('Toggle post like response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error toggling post like ${postId}:`, error);
    throw error;
  }
};

// Lấy trạng thái thích của bài viết
export const getPostLikeStatus = async (postId) => {
  try {
    const response = await communityApi.get(`/posts/${postId}/like`);
    console.log('Get post like status response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting post like status ${postId}:`, error);
    throw error;
  }
};

// Kiểm tra trạng thái bookmark bài viết
export const getPostBookmarkStatus = async (postId) => {
  try {
    const response = await communityApi.get(`/posts/${postId}/bookmark`);
    console.log(`Post ${postId} bookmark status:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting post bookmark status ${postId}:`, error);
    throw error;
  }
};

// Toggle bookmark bài viết
export const togglePostBookmark = async (postId) => {
  try {
    const response = await communityApi.post(`/posts/${postId}/bookmark`);
    console.log('Toggle bookmark response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error toggling bookmark for post ${postId}:`, error);
    throw error;
  }
};

// Đánh dấu bài post
export const bookmarkPost = async (id) => {
  try {
    const response = await communityApi.post(`/posts/${id}/bookmark`);
    return response.data;
  } catch (error) {
    console.error(`Error bookmarking post with ID ${id}:`, error);
    throw error;
  }
};

// Bỏ đánh dấu bài post
export const unbookmarkPost = async (id) => {
  try {
    const response = await communityApi.delete(`/posts/${id}/bookmark`);
    return response.data;
  } catch (error) {
    console.error(`Error unbookmarking post with ID ${id}:`, error);
    throw error;
  }
};

// Lấy bình luận của bài post
export const getPostComments = async (postId, page = 1, size = 10) => {
  try {
    console.log('Getting comments for post:', postId, 'page:', page, 'size:', size);
    
    // Check if token exists
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    
    // Try different approaches for the API call
    let response;
    
    // Try with current user context
    try {
      response = await communityApi.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
    } catch (firstError) {
      console.log('First attempt failed, trying with userId parameter');
      
      // Try with userId parameter if available
      const userId = localStorage.getItem('currentUserId') || 'NURSE001';
      response = await communityApi.get(`/posts/${postId}/comments?page=${page}&size=${size}&userId=${userId}`);
    }
    
    console.log('Comments response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    console.error('Error details:', error.response?.data);
    
    // Return mock data for development when API fails
    console.log('Returning mock comments data');
    return {
      data: {
        content: [
          createMockComment(postId, 1, "Bình luận mẫu: Tôi có thể đăng ký ở đâu ạ?", "parent6", "PARENT"),
          createMockComment(postId, 2, "Cảm ơn bạn đã chia sẻ thông tin hữu ích!", "nurse1", "NURSE")
        ],
        page: 1,
        size: 10,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true
      },
      status: "success"
    };
  }
};

// Thêm bình luận vào bài post
export const addPostComment = async (postId, commentData) => {
  try {
    // Đơn giản hóa data chỉ gửi content như API yêu cầu
    const requestData = {
      content: commentData.content
    };
    
    console.log('Adding comment to post:', postId, 'with data:', requestData);
    
    const response = await communityApi.post(`/posts/${postId}/comments`, requestData);
    console.log('Add comment response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Kiểm tra trạng thái thích bình luận
export const getCommentLikeStatus = async (commentId) => {
  try {
    const response = await communityApi.get(`/comments/${commentId}/like`);
    console.log(`Comment ${commentId} like status:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error checking like status for comment ${commentId}:`, error);
    throw error;
  }
};

// Thích bình luận
export const likeComment = async (commentId) => {
  try {
    const response = await communityApi.post(`/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking comment ${commentId}:`, error);
    throw error;
  }
};

// Xóa bình luận
export const deleteComment = async (commentId) => {
  try {
    const response = await communityApi.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
};

// Cập nhật bình luận
export const updateComment = async (commentId, commentData) => {
  try {
    const requestData = {
      content: commentData.content
    };
    
    console.log('Updating comment:', commentId, 'with data:', requestData);
    
    const response = await communityApi.put(`/comments/${commentId}`, requestData);
    console.log('Update comment response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Bỏ thích bình luận
export const unlikeComment = async (commentId) => {
  try {
    const response = await communityApi.delete(`/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error unliking comment ${commentId}:`, error);
    throw error;
  }
};

// Thích/Bỏ thích bình luận (toggle)
export const toggleCommentLike = async (commentId) => {
  try {
    const response = await communityApi.post(`/comments/${commentId}/like`);
    console.log('Toggle comment like response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error toggling like for comment ${commentId}:`, error);
    throw error;
  }
};

// Thích bài viết
export const likePost = async (postId) => {
  try {
    const response = await communityApi.post(`/posts/${postId}/like`);
    console.log('Like post response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw error;
  }
};

// Hủy thích bài viết
export const unlikePost = async (postId) => {
  try {
    const response = await communityApi.delete(`/posts/${postId}/like`);
    console.log('Unlike post response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error unliking post ${postId}:`, error);
    throw error;
  }
};

// =================== COMMENT REPLIES API ===================

// Lấy danh sách phản hồi bình luận
export const getCommentReplies = async (commentId, page = 1, size = 10) => {
  try {
    const response = await communityApi.get(`/comments/${commentId}/replies?page=${page}&size=${size}`);
    console.log('Get comment replies response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting replies for comment ${commentId}:`, error);
    throw error;
  }
};

// Tạo phản hồi bình luận
export const addCommentReply = async (commentId, replyData) => {
  try {
    const response = await communityApi.post(`/comments/${commentId}/replies`, replyData);
    console.log('Add comment reply response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error adding reply to comment ${commentId}:`, error);
    throw error;
  }
};

// Xóa phản hồi bình luận
export const deleteCommentReply = async (replyId) => {
  try {
    const response = await communityApi.delete(`/replies/${replyId}`);
    console.log('Delete comment reply response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reply ${replyId}:`, error);
    throw error;
  }
};

// Cập nhật phản hồi bình luận
export const updateCommentReply = async (replyId, replyData) => {
  try {
    const response = await communityApi.put(`/replies/${replyId}`, replyData);
    console.log('Update comment reply response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating reply ${replyId}:`, error);
    throw error;
  }
};

// Kiểm tra trạng thái thích phản hồi
export const checkReplyLikeStatus = async (replyId) => {
  try {
    const response = await communityApi.get(`/replies/${replyId}/like`);
    console.log('Check reply like status response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error checking like status for reply ${replyId}:`, error);
    throw error;
  }
};

// Thích/Bỏ thích phản hồi (toggle)
export const toggleLikeReply = async (replyId) => {
  try {
    const response = await communityApi.post(`/replies/${replyId}/like`);
    console.log('Toggle like reply response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error toggling like for reply ${replyId}:`, error);
    throw error;
  }
};

// Default export bao gồm tất cả functions
export default {
  // Health Articles functions
  getAllHealthArticles,
  getHealthArticleById,
  createHealthArticle,
  updateHealthArticle,
  deleteHealthArticle,
  uploadImageForHealthArticle,
  getHealthArticlesByCategory,
  searchHealthArticles,
  getPopularHealthArticles,
  getLatestHealthArticles,
  
  // Blog functions (aliases)
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImageForArticle,
  uploadImage,
  convertImageToBase64,
  
  // Community Posts functions
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  getPostLikeStatus,
  getPostBookmarkStatus,
  togglePostBookmark,
  bookmarkPost,
  unbookmarkPost,
  getPostComments,
  addPostComment,
  
  // Comments functions
  getCommentLikeStatus,
  likeComment,
  deleteComment,
  updateComment,
  unlikeComment,
  toggleCommentLike,
  likePost,
  unlikePost,
  
  // Comment Replies functions
  getCommentReplies,
  addCommentReply,
  deleteCommentReply,
  updateCommentReply,
  checkReplyLikeStatus,
  toggleLikeReply
};