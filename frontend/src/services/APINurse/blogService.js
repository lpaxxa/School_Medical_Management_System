import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/health-articles';

// Hàm trực tiếp lấy token từ localStorage để xác thực
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Lấy danh sách tất cả bài viết
export const getAllBlogs = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// Lấy chi tiết một bài viết theo ID
export const getBlogById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw error;
  }
};

// Tạo bài viết mới
export const createBlog = async (blogData) => {
  try {
    const response = await axios.post(BASE_URL, blogData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// Cập nhật bài viết
export const updateBlog = async (id, blogData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, blogData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw error;
  }
};

// Xóa bài viết
export const deleteBlog = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw error;
  }
};