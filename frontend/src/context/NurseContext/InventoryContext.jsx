import React, { createContext, useState, useEffect, useContext } from 'react';
import inventoryService from '../../services/APINurse/inventoryService';
// Create the Inventory Context
export const InventoryContext = createContext();

// Custom hook to use the Inventory Context
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  // State for items
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  
  // Fetch all items
  const fetchItems = async () => {
    // Only set loading if we don't already have items
    if (items.length === 0) {
      setLoading(true);
    }
    
    try {
      const data = await inventoryService.getAllItems();      // Make sure we have an array of items
      if (data && Array.isArray(data)) {
        setItems(data);
      } else if (data && typeof data === 'object' && data.content && Array.isArray(data.content)) {
        // Handle Spring Data pagination format
        setItems(data.content);
      }else {
        console.warn('InventoryContext: Unexpected data format:', data);
        // Don't reset to empty array if we already have data
        if (items.length === 0) {
          setItems([]);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError('Không thể tải danh sách vật phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Fetch item by ID
  const fetchItemById = async (id) => {
    setLoading(true);
    try {
      const data = await inventoryService.getItemById(id);
      setSelectedItem(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Không thể tải chi tiết vật phẩm');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add new item
  const addItem = async (item) => {
    setLoading(true);
    try {
      const newItem = await inventoryService.addItem(item);
      setItems(prevItems => [...prevItems, newItem]);
      setError(null);
      return newItem;
    } catch (err) {
      console.error('Error adding new item:', err);
      setError('Không thể thêm vật phẩm mới');
      return null;
    } finally {
      setLoading(false);
    }
  };  // Update item
  const updateItem = async (id, item) => {
    if (!id) {
      const error = new Error('ID không được để trống khi cập nhật vật phẩm');
      setError(error.message);
      throw error;
    }
    
    setLoading(true);
    try {      // Make API call
      const updatedItem = await inventoryService.updateItem(id, item);
      
      // Check if the update was successful
      if (updatedItem) {
        // Update items in state using itemId instead of id
        setItems(prevItems => {
          const updatedItems = prevItems.map(i => (i.itemId === id ? updatedItem : i));
          return updatedItems;
        });
        
        // Update selected item if it's the one being edited
        if (selectedItem?.itemId === id) {
          setSelectedItem(updatedItem);
        }
        
        setError(null);
          // Refresh the inventory data
        inventoryService.getAllItems(true).then(freshData => {
          if (freshData && Array.isArray(freshData)) {
            setItems(freshData);
          }
        }).catch(err => {
          console.warn('Không thể làm mới dữ liệu sau khi cập nhật:', err);
        });
        
        return updatedItem;
      } else {
        throw new Error('API returned empty response');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      
      // Provide detailed Vietnamese error messages
      let errorMessage = 'Không thể cập nhật vật phẩm';
      if (err.message) {
        if (err.message.includes('404')) {
          errorMessage = 'Không tìm thấy vật phẩm với ID này. Vui lòng làm mới trang và thử lại.';
        } else if (err.message.includes('400')) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra định dạng ngày tháng và các trường bắt buộc.';
        } else {
          errorMessage += ': ' + err.message;
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };  // Delete item
  const deleteItem = async (id) => {
    setLoading(true);
    try {
      // Xóa vật phẩm dựa trên ID
      const result = await inventoryService.deleteItem(id);
      if (result.success) {
        // Use itemId instead of id for filtering
        setItems(prevItems => prevItems.filter(item => item.itemId !== id));
        if (selectedItem?.itemId === id) {
          setSelectedItem(null);
        }
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Không thể xóa vật phẩm');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Search items by field and keyword
  const searchItems = async (field, keyword) => {
    setLoading(true);
    try {
      const results = await inventoryService.searchItems(field, keyword);
      setItems(results);
      setError(null);
      return results;
    } catch (err) {
      console.error('Error searching items:', err);
      setError('Không thể tìm kiếm vật phẩm');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search items by name
  const searchItemsByName = async (name) => {
    setLoading(true);
    try {
      const results = await inventoryService.searchItemsByName(name);
      setItems(results);
      setError(null);
      return results;
    } catch (err) {
      console.error('Error searching items by name:', err);
      setError('Không thể tìm kiếm vật phẩm theo tên');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const filterByCategory = async (category) => {
    setLoading(true);
    try {
      const filteredItems = await inventoryService.filterByCategory(category);
      setItems(filteredItems);
      setError(null);
      return filteredItems;
    } catch (err) {
      console.error('Error filtering by category:', err);
      setError('Không thể lọc vật phẩm theo danh mục');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get all categories
  const fetchCategories = async () => {
    try {
      const categoryList = await inventoryService.getCategories();
      setCategories(categoryList);
      return categoryList;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  };

  // Get low stock items
  const fetchLowStockItems = async () => {
    try {
      // Kiểm tra xem phương thức có tồn tại hay không
      if (typeof inventoryService.getLowStockItems === 'function') {
        const lowStock = await inventoryService.getLowStockItems();
        setLowStockItems(lowStock);
        return lowStock;
      } else {
        // Thay thế bằng cách lọc trực tiếp từ danh sách items hiện có
        const lowStock = items.filter(item => {
          // Giả sử các mặt hàng có số lượng dưới 10 là hàng tồn kho thấp
          // Bạn có thể điều chỉnh ngưỡng này theo nhu cầu
          return item.stockQuantity && item.stockQuantity < 10;
        });
        setLowStockItems(lowStock);
        return lowStock;
      }
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      return [];
    }
  };

  // Export inventory report
  const exportReport = async () => {
    setLoading(true);
    try {
      const result = await inventoryService.exportReport();
      setError(null);
      return result;
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Không thể xuất báo cáo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reset error
  const resetError = () => {
    setError(null);
  };  // Use a ref to track if we've already loaded data to prevent repeated fetches
  const initialDataLoaded = React.useRef(false);
  
  // Load items on context mount, but only once
  useEffect(() => {
    if (!initialDataLoaded.current) {
      initialDataLoaded.current = true;
      fetchItems();
      fetchCategories();
      fetchLowStockItems();
    }
  }, []);  // Đảm bảo các item sử dụng itemId thống nhất
  useEffect(() => {
    if (items && items.length > 0 && items.some(item => !item.itemId && item.id)) {
      // Map id sang itemId nếu cần
      const fixedItems = items.map(item => {
        if (!item.itemId && item.id) {
          return { ...item, itemId: item.id };
        }
        return item;
      });
      setItems(fixedItems);
    }
  }, [items]);

  const value = {
    items,
    inventoryItems: items, // Add this alias for compatibility
    loading,
    error,
    selectedItem,
    categories,
    lowStockItems,
    fetchItems,
    fetchItemById,
    addItem,
    updateItem,
    deleteItem,
    searchItems,
    searchItemsByName,
    filterByCategory,
    fetchCategories,
    fetchLowStockItems,
    exportReport,
    resetError,
    setSelectedItem,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
