import axios from 'axios';

// Khởi tạo axios với cấu hình CORS
const axiosInstance = axios.create({
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
});

const API_URL = 'http://localhost:8080/api/medication-items';

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

  checkItemNameExists: async (name, excludeId) => {
    if (!name || name.trim() === '') return false;

    try {
      const encodedName = encodeURIComponent(name.trim());
      const timestamp = Date.now();

      const response = await fetch(`${API_URL}/get-by-name/${encodedName}?_=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const responseData = await response.text();

        if (responseData === "" || responseData === '""' || responseData === "''") {
          return false;
        }

        if (excludeId) {
          let data;
          try {
            data = JSON.parse(responseData);
            const foundItemId = data?.itemId || data?.id;
            if (foundItemId?.toString() === excludeId.toString()) {
              return false;
            }
          } catch {
            return true;
          }
        }

        return true;
      }

      if (response.status === 404) return false;
      return false;
    } catch (error) {
      console.error('Lỗi khi kiểm tra tên vật phẩm:', error);
      return false;
    }
  },

  checkItemNameExistence: async (name, excludeId = null) => {
    if (!name || name.trim() === '') {
      return { exists: false, message: 'Tên không được để trống' };
    }

    try {
      const exists = await inventoryService.checkItemNameExists(name, excludeId);
      return {
        exists,
        message: exists
          ? 'Tên vật phẩm đã tồn tại trong hệ thống'
          : 'Tên vật phẩm hợp lệ'
      };
    } catch (error) {
      return {
        exists: false,
        message: 'Lỗi khi kiểm tra tên vật phẩm. Vui lòng thử lại.'
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
