import axios from 'axios';

const API_URL = 'http://localhost:8080/api/medication-items';

/**
 * Service API kết nối với backend Spring Boot cho quản lý kho y tế
 * Các trường dữ liệu trong database: 
 * - itemId: định danh duy nhất của vật phẩm
 * - itemName: tên vật phẩm
 * - manufactureDate: ngày sản xuất (yyyy-MM-dd)
 * - expiryDate: ngày hết hạn (yyyy-MM-dd)
 * - unit: đơn vị tính (hộp, chai, v.v.)
 * - stockQuantity: số lượng tồn kho
 * - itemType: loại vật phẩm (thuốc, thiết bị, v.v.)
 * - itemDescription: mô tả chi tiết
 * - createdAt: thời điểm tạo (do backend tự động sinh)
 */
const inventoryService = {
  // Cache để tránh gọi API quá nhiều
  _cache: {
    getAllItems: null,
    lastFetchTime: null,
    cacheDuration: 5000 // 5 giây cache
  },
  
  /**
   * Lấy tất cả vật phẩm trong kho
   * @param {boolean} forceRefresh - Có bắt buộc làm mới dữ liệu hay không
   * @returns {Promise<Array>} - Mảng các vật phẩm
   */
  getAllItems: async (forceRefresh = false) => {
    // Kiểm tra cache trước nếu không yêu cầu làm mới
    const now = Date.now();
    if (!forceRefresh && 
        inventoryService._cache.getAllItems && 
        inventoryService._cache.lastFetchTime && 
        (now - inventoryService._cache.lastFetchTime < inventoryService._cache.cacheDuration)) {
      // Sử dụng dữ liệu cache
      return inventoryService._cache.getAllItems;
    }
    
    try {
      const response = await axios.get(`${API_URL}/get-all`);
      
      let result;
      // Kiểm tra định dạng dữ liệu trả về
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          result = response.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          // Spring Data pagination format
          result = response.data.content;
        } else {
          result = response.data;
        }
      } else {
        result = response.data || [];
      }
      
      // Cập nhật cache
      inventoryService._cache.getAllItems = result;
      inventoryService._cache.lastFetchTime = now;
      
      return result;
    } catch (error) {
      console.error('Lỗi khi tải danh sách vật phẩm:', error);
      throw error;
    }
  },
  /**
   * Thêm vật phẩm mới
   * @param {Object} item - Thông tin vật phẩm cần thêm
   * @returns {Promise<Object>} - Vật phẩm đã được thêm
   */
  addItem: async (item) => {
    try {
      // Format dates to ensure they match API requirements
      const formattedItem = { ...item };
      
      // Format date fields if they exist
      if (formattedItem.manufactureDate) {
        formattedItem.manufactureDate = formattedItem.manufactureDate.split('T')[0];
      }
      
      if (formattedItem.expiryDate) {
        formattedItem.expiryDate = formattedItem.expiryDate.split('T')[0];
      }
      
      console.log('Sending new item to API:', formattedItem);
      
      // Call API to create new item
      const response = await axios.post(`${API_URL}/create`, formattedItem);
      
      // Clear cache to ensure fresh data after adding
      inventoryService._cache.getAllItems = null;
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm vật phẩm:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      // Trả về lỗi với thông báo chi tiết hơn
      throw new Error(`Lỗi khi thêm vật phẩm: ${error.message || 'Lỗi kết nối đến máy chủ'}`);
    }
  },
  
  /**
   * Cập nhật thông tin vật phẩm
   * @param {string|number} id - ID của vật phẩm cần cập nhật
   * @param {Object} item - Thông tin cập nhật
   * @returns {Promise<Object>} - Vật phẩm sau khi cập nhật
   */
  updateItem: async (id, item) => {
    if (!id) {
      throw new Error('ID không được để trống khi cập nhật vật phẩm');
    }
    
    try {
      // TODO: Implement real API call
      // const response = await axios.put(`${API_URL}/update/${id}?id=${id}`, item);
      // inventoryService._cache.getAllItems = null;
      // return response.data;
      console.log('updateItem placeholder - will implement API call later');
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi cập nhật vật phẩm:', error);
      throw error;
    }
  },
  
  /**
   * Xóa vật phẩm theo ID
   * @param {string|number} id - ID của vật phẩm cần xóa
   * @returns {Promise<Object>} - Kết quả xóa
   */
  deleteItem: async (id) => {
    try {
      // TODO: Implement real API call
      await axios.delete(`${API_URL}/delete/${id}`);
      inventoryService._cache.getAllItems = null;
      return { success: true, itemId: id };
      console.log('deleteItem placeholder - will implement API call later');
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi xóa vật phẩm:', error);
      throw error;
    }
  },
  
  /**
   * Tìm kiếm vật phẩm theo trường và từ khóa
   * @param {string} field - Trường cần tìm kiếm
   * @param {string} keyword - Từ khóa tìm kiếm
   * @returns {Promise<Array>} - Kết quả tìm kiếm
   */
  searchItems: async (field, keyword) => {
    try {
      // TODO: Implement real API call
      // const response = await axios.get(`${API_URL}/search?field=${field}&keyword=${keyword}`);
      // return response.data;
      console.log('searchItems placeholder - will implement API call later');
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi tìm kiếm vật phẩm:', error);
      throw error;
    }
  },
  
  /**
   * Tìm kiếm vật phẩm theo tên
   * @param {string} name - Tên vật phẩm cần tìm
   * @returns {Promise<Array>} - Kết quả tìm kiếm
   */
  searchItemsByName: async (name) => {
    try {
      // TODO: Implement real API call
      // const response = await axios.get(`${API_URL}/get-by-name/${name}`);
      // return response.data;
      console.log('searchItemsByName placeholder - will implement API call later');
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi tìm kiếm vật phẩm theo tên:', error);
      throw error;
    }
  },
  /**
   * Xuất báo cáo kho
   * @returns {Promise<Object>} - Dữ liệu báo cáo
   */
  exportReport: async () => {
    try {
      // TODO: Implement real API call
      // const response = await axios.get(`${API_URL}/export`);
      // return response.data;
      console.log('exportReport placeholder - will implement API call later');
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      throw error;
    }
  },
  
  /**
   * Lấy tất cả các loại vật phẩm (categories)
   * @returns {Promise<Array>} - Danh sách các loại vật phẩm
   */
  getCategories: async () => {
    try {
      // Tạm thời trả về danh sách mặc định
      // TODO: Implement real API call khi có API thực tế
      return ['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác'];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại vật phẩm:', error);
      return ['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác'];
    }
  }
};

export default inventoryService;