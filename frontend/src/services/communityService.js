import axios from "axios";
import sessionService from './sessionService';

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
  
  return data;
};

// Helper function để build URL với query parameters
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint, API_BASE_URL);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.pathname + url.search;
};

const communityService = {
  /**
   * 1. Lấy danh sách bài đăng có phân trang
   * GET /community/posts?page=1&size=10&category=xxx&search=xxx
   */
  getPosts: async (page = 1, size = 10, category = null, search = null) => {
    try {
      const params = { page, size };
      if (category) params.category = category;
      if (search) params.search = search;
      
      const url = buildUrl(ENDPOINTS.POSTS.GET_ALL, params);
      const response = await apiClient.get(url);
      
      const validatedData = validateResponse(response);
      
      // Ensure consistent response format
      if (Array.isArray(validatedData)) {
        return {
          status: 'success',
          data: {
            content: validatedData,
            totalElements: validatedData.length,
            totalPages: Math.ceil(validatedData.length / size),
            currentPage: page
          }
        };
      }
      
      return validatedData;
    } catch (error) {
      console.error("❌ Error fetching community posts:", error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách bài viết');
    }
  },
  
  /**
   * 2. Tạo bài đăng mới
   * POST /community/posts
   */
  createPost: async (postData) => {
    try {
      // Validate input data
      if (!postData.title || !postData.content) {
        throw new Error('Tiêu đề và nội dung là bắt buộc');
      }
      
      // Chuẩn hóa dữ liệu trước khi gửi
      const normalizedData = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        category: postData.category || 'general',
        excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
        tags: Array.isArray(postData.tags) ? postData.tags : []
      };
      
      const response = await apiClient.post(ENDPOINTS.POSTS.CREATE, normalizedData);
      return validateResponse(response);
    } catch (error) {
      console.error("❌ Error creating post:", error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tạo bài viết');
    }
  },
  
  /**
   * 3. Lấy chi tiết một bài đăng
   * GET /community/posts/{postId}
   */
  getPostDetail: async (postId) => {
    try {
      if (!postId || isNaN(postId)) {
        throw new Error('ID bài viết không hợp lệ');
      }
      
      const response = await apiClient.get(ENDPOINTS.POSTS.GET_BY_ID(postId));
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error fetching post ${postId} detail:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tải chi tiết bài viết');
    }
  },
  
  /**
   * 4. Like/unlike một bài đăng
   * POST /community/posts/{postId}/like
   */
  toggleLike: async (postId) => {
    try {
      if (!postId || isNaN(postId)) {
        throw new Error('ID bài viết không hợp lệ');
      }
      
      const response = await apiClient.post(ENDPOINTS.POSTS.LIKE(postId), {});
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error toggling like for post ${postId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể thực hiện thao tác like');
    }
  },
  
  /**
   * 5. Lấy bình luận của một bài đăng
   * GET /community/posts/{postId}/comments?page=1&size=10
   */
  getComments: async (postId, page = 1, size = 10) => {
    try {
      if (!postId || isNaN(postId)) {
        throw new Error('ID bài viết không hợp lệ');
      }
      
      const params = { page, size };
      const url = buildUrl(ENDPOINTS.COMMENTS.GET_BY_POST(postId), params);
      const response = await apiClient.get(url);
      
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error fetching comments for post ${postId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tải bình luận');
    }
  },

  /**
   * 6. Thêm bình luận mới cho bài đăng
   * POST /community/posts/{postId}/comments
   */
  addComment: async (postId, content) => {
    try {
      if (!postId || isNaN(postId)) {
        throw new Error('ID bài viết không hợp lệ');
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('Nội dung bình luận không được để trống');
      }
      
      const response = await apiClient.post(
        ENDPOINTS.COMMENTS.CREATE(postId),
        { content: content.trim() }
      );
      
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error adding comment to post ${postId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể thêm bình luận');
    }
  },

  /**
   * 7. Cập nhật bình luận
   * PUT /community/comments/{commentId}
   */
  updateComment: async (commentId, content) => {
    try {
      if (!commentId || isNaN(commentId)) {
        throw new Error('ID bình luận không hợp lệ');
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('Nội dung bình luận không được để trống');
      }
      
      const response = await apiClient.put(
        ENDPOINTS.COMMENTS.UPDATE(commentId),
        { content: content.trim() }
      );
      
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error updating comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật bình luận');
    }
  },

  /**
   * 8. Xóa bình luận
   * DELETE /community/comments/{commentId}
   */
  deleteComment: async (commentId) => {
    try {
      if (!commentId || isNaN(commentId)) {
        throw new Error('ID bình luận không hợp lệ');
      }
      
      const response = await apiClient.delete(ENDPOINTS.COMMENTS.DELETE(commentId));
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error deleting comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể xóa bình luận');
    }
  },

  /**
   * 9. Toggle like cho bình luận
   * POST /community/comments/{commentId}/like
   */
  toggleCommentLike: async (commentId) => {
    try {
      if (!commentId || isNaN(commentId)) {
        throw new Error('ID bình luận không hợp lệ');
      }
      
      const response = await apiClient.post(ENDPOINTS.COMMENTS.LIKE(commentId), {});
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error toggling like for comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể thực hiện thao tác like');
    }
  },

  /**
   * 10. Tạo phản hồi cho bình luận
   * POST /community/comments/{commentId}/replies
   */
  addReply: async (commentId, content) => {
    try {
      if (!commentId || isNaN(commentId)) {
        throw new Error('ID bình luận không hợp lệ');
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('Nội dung phản hồi không được để trống');
      }
      
      const response = await apiClient.post(
        ENDPOINTS.REPLIES.CREATE(commentId),
        { content: content.trim() }
      );
      
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error adding reply to comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể thêm phản hồi');
    }
  },

  /**
   * 11. Toggle like cho phản hồi bình luận
   * POST /community/replies/{replyId}/like
   */
  toggleReplyLike: async (replyId) => {
    try {
      if (!replyId || isNaN(replyId)) {
        throw new Error('ID phản hồi không hợp lệ');
      }
      
      const response = await apiClient.post(ENDPOINTS.REPLIES.LIKE(replyId), {});
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error toggling like for reply ${replyId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể thực hiện thao tác like');
    }
  },

  /**
   * 12. Lấy danh sách phản hồi của bình luận
   * GET /community/comments/{commentId}/replies?page=1&size=10
   */
  getReplies: async (commentId, page = 1, size = 10) => {
    try {
      if (!commentId || isNaN(commentId)) {
        throw new Error('ID bình luận không hợp lệ');
      }
      
      const params = { page, size };
      const url = buildUrl(ENDPOINTS.REPLIES.GET_BY_COMMENT(commentId), params);
      const response = await apiClient.get(url);
      
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error fetching replies for comment ${commentId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tải phản hồi');
    }
  },

  /**
   * 13. Cập nhật phản hồi
   * PUT /community/replies/{replyId}
   */
  updateReply: async (replyId, content) => {
    try {
      if (!replyId || isNaN(replyId)) {
        throw new Error('ID phản hồi không hợp lệ');
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('Nội dung phản hồi không được để trống');
      }
      
      const response = await apiClient.put(
        ENDPOINTS.REPLIES.UPDATE(replyId),
        { content: content.trim() }
      );
      
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error updating reply ${replyId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật phản hồi');
    }
  },

  /**
   * 14. Xóa phản hồi
   * DELETE /community/replies/{replyId}
   */
  deleteReply: async (replyId) => {
    try {
      if (!replyId || isNaN(replyId)) {
        throw new Error('ID phản hồi không hợp lệ');
      }
      
      const response = await apiClient.delete(ENDPOINTS.REPLIES.DELETE(replyId));
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error deleting reply ${replyId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể xóa phản hồi');
    }
  },

  /**
   * 15. Ghim/bỏ ghim bài viết
   * POST /community/posts/{postId}/bookmark
   */
  toggleBookmark: async (postId) => {
    try {
      if (!postId || isNaN(postId)) {
        throw new Error('ID bài viết không hợp lệ');
      }
      
      const response = await apiClient.post(ENDPOINTS.POSTS.BOOKMARK(postId), {});
      return validateResponse(response);
    } catch (error) {
      console.error(`❌ Error toggling bookmark for post ${postId}:`, error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể thực hiện thao tác ghim');
    }
  },

  /**
   * 16. Lấy danh sách bài viết đã ghim
   * GET /community/posts/bookmarked
   */
  getBookmarkedPosts: async (page = 1, size = 10) => {
    try {
      const params = { page, size };
      const url = buildUrl(ENDPOINTS.POSTS.GET_BOOKMARKED, params);
      const response = await apiClient.get(url);
      
      return validateResponse(response);
    } catch (error) {
      console.error("❌ Error fetching bookmarked posts:", error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tải danh sách bài viết đã ghim');
    }
  },

  // ======= UTILITY METHODS =======

  /**
   * 17. Kiểm tra kết nối API
   */
  testConnection: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.POSTS.GET_ALL + '?page=1&size=1');
      return {
        success: true,
        message: 'Kết nối API thành công',
        data: response.data
      };
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Không thể kết nối đến server',
        error: error
      };
    }
  },

  /**
   * 18. Lấy thống kê community
   */
  getCommunityStats: async () => {
    try {
      const response = await apiClient.get('/community/stats');
      return validateResponse(response);
    } catch (error) {
      console.error('❌ Error fetching community stats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể tải thống kê');
    }
  },

  /**
   * 19. Báo cáo bài viết/bình luận
   */
  reportContent: async (contentType, contentId, reason) => {
    try {
      if (!['post', 'comment', 'reply'].includes(contentType)) {
        throw new Error('Loại nội dung không hợp lệ');
      }
      
      if (!contentId || isNaN(contentId)) {
        throw new Error('ID nội dung không hợp lệ');
      }
      
      if (!reason || reason.trim().length === 0) {
        throw new Error('Lý do báo cáo không được để trống');
      }
      
      const response = await apiClient.post('/community/reports', {
        contentType,
        contentId: parseInt(contentId),
        reason: reason.trim()
      });
      
      return validateResponse(response);
    } catch (error) {
      console.error('❌ Error reporting content:', error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể gửi báo cáo');
    }
  }
};

// Export constants để sử dụng trong components
export const COMMUNITY_ENDPOINTS = ENDPOINTS;
export const COMMUNITY_API_CLIENT = apiClient;

// Export main service
export default communityService;

// Export utility functions
export { validateResponse, buildUrl };