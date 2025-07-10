import axios from 'axios';

// Cập nhật lại URL base để phù hợp với API của bạn
const BASE_URL = 'http://localhost:8080/api/health-articles';
const COMMUNITY_BASE_URL = 'http://localhost:8080/api/v1/community';

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
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
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
      const response = await axios.post('http://localhost:8080/api/upload-temp-image', formData, {
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

// Thích bài post
export const likePost = async (id) => {
  try {
    const response = await communityApi.post(`/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking post with ID ${id}:`, error);
    throw error;
  }
};

// Bỏ thích bài post
export const unlikePost = async (id) => {
  try {
    const response = await communityApi.delete(`/posts/${id}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error unliking post with ID ${id}:`, error);
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