import axios from "axios";
import sessionService from '../sessionService';

// API Configuration - sử dụng env variables với fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

// Community API endpoints
const ENDPOINTS = {
  POSTS: {
    GET_ALL: "/community/posts",
    GET_BY_ID: (id) => `/community/posts/${id}`,
    CREATE: "/community/posts",
    UPDATE: (id) => `/community/posts/${id}`,
    DELETE: (id) => `/community/posts/${id}`,
    LIKE: (id) => `/community/posts/${id}/like`,
    BOOKMARK: (id) => `/community/posts/${id}/bookmark`,
    GET_BOOKMARKED: "/community/posts/bookmarked"
  },
  COMMENTS: {
    GET_BY_POST: (postId) => `/community/posts/${postId}/comments`,
    CREATE: (postId) => `/community/posts/${postId}/comments`,
    UPDATE: (id) => `/community/comments/${id}`,
    DELETE: (id) => `/community/comments/${id}`,
    LIKE: (id) => `/community/comments/${id}/like`
  },
  REPLIES: {
    GET_BY_COMMENT: (commentId) => `/community/comments/${commentId}/replies`,
    CREATE: (commentId) => `/community/comments/${commentId}/replies`,
    UPDATE: (id) => `/community/replies/${id}`,
    DELETE: (id) => `/community/replies/${id}`,
    LIKE: (id) => `/community/replies/${id}/like`
  }
};

// Axios instance với cấu hình chuẩn
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm auth token using sessionService
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Extend session on API activity
      sessionService.extendSession();
    }

    // Log request cho debugging (chỉ trong development)
    if (import.meta.env.NODE_ENV === 'development') {
      console.log(`🚀 [Community API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ [Community API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Validate response structure
    if (!response.data) {
      console.warn('⚠️ [Community API] Empty response data');
    }
    
    return response;
  },
  (error) => {
    console.error('❌ [Community API] Response Error:', error.response?.status, error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('🔐 [Community API] Authentication expired');
      // Có thể dispatch logout action ở đây
    }
    
    return Promise.reject(error);
  }
);

// Helper function để validate response format
const validateResponse = (response, expectedDataType = 'object') => {
  if (!response || !response.data) {
    throw new Error('Invalid API response: missing data');
  }
  
  const { data } = response;
  
  // Kiểm tra format response chuẩn
  if (data.status && data.status !== 'success') {
    throw new Error(data.message || 'API request failed');
  }
  
  // Trả về data thực tế
  return data.data || data;
};

// ==================== POSTS API ====================

/**
 * Lấy tất cả bài viết trong cộng đồng
 * @param {Object} params - Query parameters (page, limit, category, etc.)
 * @returns {Promise<Array>} Danh sách bài viết
 */
export const getAllPosts = async (params = {}) => {
  try {
    console.log('🔍 [Community] Fetching all posts with params:', params);
    
    const response = await apiClient.get(ENDPOINTS.POSTS.GET_ALL, { params });
    const posts = validateResponse(response, 'array');
    
    console.log('✅ [Community] Posts fetched successfully:', posts?.length || 0, 'posts');
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error('❌ [Community] Error fetching posts:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một bài viết
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} Chi tiết bài viết
 */
export const getPostById = async (postId) => {
  try {
    console.log('🔍 [Community] Fetching post details for ID:', postId);
    
    const response = await apiClient.get(ENDPOINTS.POSTS.GET_BY_ID(postId));
    const post = validateResponse(response);
    
    console.log('✅ [Community] Post details fetched successfully');
    return post;
  } catch (error) {
    console.error('❌ [Community] Error fetching post details:', error);
    throw error;
  }
};

/**
 * Tạo bài viết mới
 * @param {Object} postData - Dữ liệu bài viết
 * @returns {Promise<Object>} Bài viết đã tạo
 */
export const createPost = async (postData) => {
  try {
    console.log('📝 [Community] Creating new post:', postData.title);
    
    const response = await apiClient.post(ENDPOINTS.POSTS.CREATE, postData);
    const newPost = validateResponse(response);
    
    console.log('✅ [Community] Post created successfully');
    return newPost;
  } catch (error) {
    console.error('❌ [Community] Error creating post:', error);
    throw error;
  }
};

/**
 * Cập nhật bài viết
 * @param {number} postId - ID của bài viết
 * @param {Object} postData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Bài viết đã cập nhật
 */
export const updatePost = async (postId, postData) => {
  try {
    console.log('✏️ [Community] Updating post ID:', postId);
    
    const response = await apiClient.put(ENDPOINTS.POSTS.UPDATE(postId), postData);
    const updatedPost = validateResponse(response);
    
    console.log('✅ [Community] Post updated successfully');
    return updatedPost;
  } catch (error) {
    console.error('❌ [Community] Error updating post:', error);
    throw error;
  }
};

/**
 * Xóa bài viết
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deletePost = async (postId) => {
  try {
    console.log('🗑️ [Community] Deleting post ID:', postId);
    
    const response = await apiClient.delete(ENDPOINTS.POSTS.DELETE(postId));
    const result = validateResponse(response);
    
    console.log('✅ [Community] Post deleted successfully');
    return result;
  } catch (error) {
    console.error('❌ [Community] Error deleting post:', error);
    throw error;
  }
};

/**
 * Like/Unlike bài viết
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} Kết quả like
 */
export const likePost = async (postId) => {
  try {
    console.log('👍 [Community] Toggling like for post ID:', postId);
    
    const response = await apiClient.post(ENDPOINTS.POSTS.LIKE(postId));
    const result = validateResponse(response);
    
    console.log('✅ [Community] Post like toggled successfully');
    return result;
  } catch (error) {
    console.error('❌ [Community] Error toggling post like:', error);
    throw error;
  }
};

/**
 * Bookmark/Unbookmark bài viết
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} Kết quả bookmark
 */
export const bookmarkPost = async (postId) => {
  try {
    console.log('🔖 [Community] Toggling bookmark for post ID:', postId);
    
    const response = await apiClient.post(ENDPOINTS.POSTS.BOOKMARK(postId));
    const result = validateResponse(response);
    
    console.log('✅ [Community] Post bookmark toggled successfully');
    return result;
  } catch (error) {
    console.error('❌ [Community] Error toggling post bookmark:', error);
    throw error;
  }
};

/**
 * Lấy danh sách bài viết đã bookmark
 * @returns {Promise<Array>} Danh sách bài viết đã bookmark
 */
export const getBookmarkedPosts = async () => {
  try {
    console.log('🔖 [Community] Fetching bookmarked posts');
    
    const response = await apiClient.get(ENDPOINTS.POSTS.GET_BOOKMARKED);
    const posts = validateResponse(response, 'array');
    
    console.log('✅ [Community] Bookmarked posts fetched successfully');
    return Array.isArray(posts) ? posts : [];
  } catch (error) {
    console.error('❌ [Community] Error fetching bookmarked posts:', error);
    throw error;
  }
};

// Export default object với tất cả functions
const communityService = {
  // Posts
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost,
  getBookmarkedPosts,
  
  // Endpoints for external use
  ENDPOINTS
};

export default communityService;
