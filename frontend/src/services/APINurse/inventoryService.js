import axios from 'axios';

// Khởi tạo axios với cấu hình CORS
const axiosInstance = axios.create({
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
});

// Add authentication interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/medication-items`;

const inventoryService = {
  API_URL,

  _cache: {
    getAllItems: null,
    lastFetchTime: null,
    cacheDuration: 5000 // ms
  },

  getAllItems: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh &&
        inventoryService._cache.getAllItems &&
        inventoryService._cache.lastFetchTime &&
        (now - inventoryService._cache.lastFetchTime < inventoryService._cache.cacheDuration)) {
      return inventoryService._cache.getAllItems;
    }

    try {
      const response = await axiosInstance.get(`${API_URL}/get-all`);
      let result;

      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          result = response.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          result = response.data.content;
        } else {
          result = response.data;
        }
      } else {
        result = response.data || [];
      }

      // Debug: Log raw data from API to see actual format
      console.log('🔍 Raw API response for inventory items:', result);
      if (result && result.length > 0) {
        console.log('🔍 Sample item from API:', result[0]);
        console.log('🔍 Sample expiryDate from API:', result[0].expiryDate, 'type:', typeof result[0].expiryDate);
        console.log('🔍 All expiryDates in first 5 items:');
        result.slice(0, 5).forEach((item, index) => {
          console.log(`   Item ${index + 1} (${item.itemName}): expiryDate = ${item.expiryDate} (${typeof item.expiryDate})`);
        });
      }

      inventoryService._cache.getAllItems = result;
      inventoryService._cache.lastFetchTime = now;

      return result;
    } catch (error) {
      console.error('Lỗi khi tải danh sách vật phẩm:', error);
      throw error;
    }
  },

  addItem: async (item) => {
    try {
      const formattedItem = { ...item };
      if (formattedItem.manufactureDate) {
        formattedItem.manufactureDate = formattedItem.manufactureDate.split('T')[0];
      }
      if (formattedItem.expiryDate) {
        formattedItem.expiryDate = formattedItem.expiryDate.split('T')[0];
      }

      const response = await axiosInstance.post(`${API_URL}/create`, formattedItem);
      inventoryService._cache.getAllItems = null;

      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm vật phẩm:', error);

      if (error.response) {
        const responseData = error.response.data;

        if (typeof responseData === 'string' && (
            responseData.includes("already exists") || responseData.includes("đã tồn tại"))) {
          throw new Error("Tên vật phẩm đã tồn tại trong hệ thống");
        }

        if (responseData && responseData.message) {
          throw new Error(responseData.message);
        }
      }

      throw new Error(`Lỗi khi thêm vật phẩm: ${error.message || 'Lỗi kết nối đến máy chủ'}`);
    }
  },

  updateItem: async (id, item) => {
    if (!id) {
      throw new Error('ID không được để trống khi cập nhật vật phẩm');
    }

    try {
      const response = await axiosInstance.put(`${API_URL}/update/${id}?id=${id}`, item);
      inventoryService._cache.getAllItems = null;
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật vật phẩm:', error);

      if (error.response) {
        const responseData = error.response.data;

        if (typeof responseData === 'string' && (
            responseData.includes("already exists") || responseData.includes("đã tồn tại"))) {
          throw new Error("Tên vật phẩm đã tồn tại trong hệ thống");
        }

        if (responseData && responseData.message) {
          throw new Error(responseData.message);
        }
      }

      throw new Error(`Lỗi khi cập nhật vật phẩm: ${error.message || 'Lỗi kết nối đến máy chủ'}`);
    }
  },

  deleteItem: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/delete/${id}`);
      inventoryService._cache.getAllItems = null;
      return { success: true, itemId: id };
    } catch (error) {
      console.error('Lỗi khi xóa vật phẩm:', error);
      throw error;
    }
  },

  searchItems: async (field, keyword) => {
    try {
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi tìm kiếm vật phẩm:', error);
      throw error;
    }
  },

  searchItemsByName: async (name) => {
    if (!name || name.trim() === '') {
      return null;
    }

    try {
      const encodedName = encodeURIComponent(name.trim());
      const response = await axiosInstance.get(`${API_URL}/get-by-name/${encodedName}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Lỗi khi tìm kiếm vật phẩm theo tên:', error);
      throw error;
    }
  },

  // Tìm kiếm thuốc theo từ khóa (có thể trả về nhiều kết quả)
  getItemsByKeyword: async (keyword) => {
    if (!keyword || keyword.trim() === '') {
      console.log("Empty keyword provided to getItemsByKeyword, returning empty array");
      return [];
    }

    try {
      const encodedKeyword = encodeURIComponent(keyword.trim());
      console.log(`Searching medications by keyword: "${keyword}" (encoded: "${encodedKeyword}")`);
      
      // First check cache for matches
      if (inventoryService._cache.getAllItems) {
        const cacheMatches = inventoryService._cache.getAllItems.filter(item => {
          if (!item || !item.itemName) return false;
          const itemName = item.itemName.toLowerCase().trim();
          const searchTerm = keyword.toLowerCase().trim();
          return itemName.includes(searchTerm) || searchTerm.includes(itemName);
        });
        
        if (cacheMatches.length > 0) {
          console.log(`Found ${cacheMatches.length} medications matching "${keyword}" in cache`);
          return cacheMatches;
        }
      }
      
      // If not in cache, call API
      const response = await axiosInstance.get(`${API_URL}/get-by-name/${encodedKeyword}`);
      
      if (Array.isArray(response.data)) {
        console.log(`API returned ${response.data.length} medications matching keyword "${keyword}"`);
        return response.data;
      } else if (response.data) {
        // Nếu API trả về một item đơn lẻ, bọc nó trong array
        console.log(`API returned 1 medication matching keyword "${keyword}": ${response.data.itemName}`);
        return [response.data];
      }
      console.log(`No medications found for keyword "${keyword}"`);
      return [];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`No medications found for keyword "${keyword}"`);
        return [];
      }
      console.error(`Error searching medications by keyword "${keyword}":`, error);
      return [];
    }
  },

  // Alias for searchItemsByName - for backward compatibility
  getMedicationByName: async (name) => {
    return inventoryService.searchItemsByName(name);
  },

  // Tìm thuốc theo ID
  getItemById: async (id) => {
    // Skip API call for invalid IDs (null, empty, NaN, or 0)
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      console.log(`Invalid medication ID: ${id}, skipping API call`);
      return null;
    }

    try {
      const numericId = parseInt(id);
      console.log(`Fetching medication item by ID: ${numericId}`);
      
      // Kiểm tra cache trước
      if (inventoryService._cache.getAllItems) {
        const cachedItem = inventoryService._cache.getAllItems.find(item => {
          const itemId = parseInt(item.itemID || item.itemId || item.id);
          return itemId === numericId;
        });
        
        if (cachedItem) {
          console.log(`Found medication in cache: ID=${numericId}, Name=${cachedItem.itemName}`);
          return cachedItem;
        }
      }
      
      // Nếu không có trong cache, gọi API
      try {
        const response = await axiosInstance.get(`${API_URL}/get-by-id/${numericId}?id=${numericId}`);
        if (response.data) {
          console.log(`API returned medication: ID=${numericId}, Name=${response.data.itemName}`);
          return response.data;
        }
      } catch (error) {
        console.warn(`Error fetching medication with ID=${numericId}: ${error.message}`);
        // Nếu không tìm thấy theo ID, thử tìm theo tên sử dụng getItemsByKeyword
        console.log(`Trying to find medication by ID=${numericId} using keyword search`);
        const keywordResults = await inventoryService.getItemsByKeyword(String(numericId));
        if (keywordResults && keywordResults.length > 0) {
          const exactMatch = keywordResults.find(item => 
            parseInt(item.itemID || item.itemId || item.id) === numericId
          );
          if (exactMatch) {
            console.log(`Found medication using keyword search: ID=${numericId}, Name=${exactMatch.itemName}`);
            return exactMatch;
          }
        }
      }
      return null;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`Medication with ID=${id} not found in inventory`);
        return null;
      }
      console.error(`Lỗi khi tìm vật phẩm theo ID ${id}:`, error);
      return null;
    }
  },

  checkItemNameExists: async (name, excludeId = null) => {
    if (!name || !name.trim()) return false;
    try {
      const encodedName = encodeURIComponent(name.trim());
      const response = await axiosInstance.get(`${API_URL}/get-by-name/${encodedName}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      const foundItem = response.data;
      if (!foundItem || (typeof foundItem === 'object' && Object.keys(foundItem).length === 0)) {
        return false;
      }
      
      if (!excludeId) {
        return true; 
      }

      const foundItemId = foundItem.itemID || foundItem.itemId || foundItem.id;
      return foundItemId?.toString() !== excludeId.toString();
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      console.error('Lỗi khi kiểm tra tên vật phẩm:', error);
      throw error;
    }
  },

  checkItemNameExistence: async (name, excludeId = null) => {
    if (!name || !name.trim()) {
      return { exists: false, message: 'Tên không được để trống' };
    }

    try {
      const exists = await inventoryService.checkItemNameExists(name, excludeId);
      return {
        exists,
        message: exists
          ? 'Tên vật phẩm đã tồn tại trong hệ thống.'
          : 'Tên vật phẩm hợp lệ.'
      };
    } catch (error) {
      return {
        exists: true, // Treat error as duplicate to be safe
        message: 'Không thể xác thực tên. Vui lòng thử lại.'
      };
    }
  },

  exportReport: async () => {
    try {
      throw new Error('API chưa được triển khai');
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      return ['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác'];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại vật phẩm:', error);
      return ['Thuốc', 'Thiết bị y tế', 'Vật tư tiêu hao', 'Khác'];
    }
  }
};

export default inventoryService;
