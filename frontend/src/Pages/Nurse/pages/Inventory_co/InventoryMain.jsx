import React, { useState, useEffect } from 'react';
import './InventoryMain.css';
import { useInventory } from '../../../../context/NurseContext';
import AddItem from './AddItem/AddItem';
import EditItem from './EditItem/EditItem';
import DeleteItem from './DeleteItem/DeleteItem';
import ViewDetailsItem from './ViewDetails/ViewDetailsItem';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InventoryPage = () => {
  // Use context directly without fallback mechanism to prevent double renders
  const {
    items: inventoryItems,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    fetchItems
  } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'name', 'type', 'unit', 'status'

  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  // const [inventoryItems, setInventoryItems] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);  // Hiển thị 10 vật phẩm mỗi trang

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Custom styles for header - similar to MedicalEventsMain
  const inventoryStyles = `
    .lukhang-inventory-main-wrapper {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
      min-height: 100vh !important;
      padding: 2rem !important;
    }
    
    .lukhang-inventory-header-card {
      background: linear-gradient(135deg, #015C92 0%, #2D82B5 30%, #428CD4 60%, #88CDF6 100%) !important;
      border: none !important;
      border-radius: 1rem !important;
      box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2) !important;
      margin-bottom: 2rem !important;
    }
    
    .lukhang-inventory-title-custom {
      color: white !important;
      font-weight: 700 !important;
      font-size: 2rem !important;
      margin: 0 !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }
    
    .lukhang-inventory-title-custom i {
      color: white !important;
    }
    
    .lukhang-inventory-action-bar {
      background: white !important;
      border-radius: 1rem !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
      margin-bottom: 2rem !important;
      padding: 1.5rem !important;
    }
    
    .lukhang-inventory-table-container {
      background: white !important;
      border-radius: 1rem !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
      padding: 1.5rem !important;
      margin: 0 !important;
    }

    /* Dropdown styles */
    .medical-incidents-dropdown {
      background-color: #fff !important;
      border: 1px solid #ced4da !important;
      border-radius: 0.375rem !important;
      padding: 0.375rem 2.25rem 0.375rem 0.75rem !important;
      font-size: 1rem !important;
      font-weight: 400 !important;
      line-height: 1.5 !important;
      color: #212529 !important;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 0.75rem center !important;
      background-size: 16px 12px !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
    }

    .medical-incidents-dropdown:focus {
      border-color: #86b7fe !important;
      outline: 0 !important;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
    }

    .medical-incidents-dropdown:disabled {
      background-color: #e9ecef !important;
      opacity: 1 !important;
    }

    /* Reset button styles */
    .lukhang-reset-button {
      min-width: 120px !important;
      height: 48px !important;
      border-radius: 10px !important;
      border: 2px solid #6c757d !important;
      background: #f8f9fa !important;
      color: #495057 !important;
      font-weight: 600 !important;
      transition: all 0.3s ease !important;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.2) !important;
    }

    .lukhang-reset-button:hover {
      background: #6c757d !important;
      color: white !important;
      border-color: #6c757d !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4) !important;
    }

    .lukhang-reset-button:focus {
      background: #6c757d !important;
      color: white !important;
      border-color: #6c757d !important;
      box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25) !important;
    }

    .lukhang-reset-button:active {
      background: #5a6268 !important;
      color: white !important;
      border-color: #5a6268 !important;
      transform: translateY(0) !important;
    }

    @media (max-width: 992px) {
      .lukhang-inventory-main-wrapper {
        padding: 1rem !important;
      }

      .lukhang-inventory-title-custom {
        font-size: 1.5rem !important;
      }
    }
  `;
  
  // Debounced search function
  const performSearch = (term, filter) => {
    if (!term.trim()) {
      setFilteredItems(inventoryItems || []);
      return;
    }

    if (inventoryItems && Array.isArray(inventoryItems)) {
      const lowerCaseSearchTerm = term.toLowerCase().trim();
      const filtered = inventoryItems.filter(item => {
        // Hàm trợ giúp để lấy giá trị từ nhiều trường khả dụng
        const getValue = (possibleFields) => {
          for (let field of possibleFields) {
            if (item[field]) return item[field].toLowerCase();
          }
          return '';
        };

        const itemName = getValue(['itemName', 'name']);
        const itemType = getValue(['itemType', 'category']);
        const unit = (item.unit || '').toLowerCase();
        const status = getItemStatusForSearch(item).toLowerCase();

        // Filter based on selected search filter
        switch (filter) {
          case 'name':
            return itemName.includes(lowerCaseSearchTerm);
          case 'type':
            return itemType.includes(lowerCaseSearchTerm);
          case 'unit':
            return unit.includes(lowerCaseSearchTerm);
          case 'status':
            return status === lowerCaseSearchTerm;
          default: // 'all'
            return itemName.includes(lowerCaseSearchTerm) ||
                   itemType.includes(lowerCaseSearchTerm) ||
                   unit.includes(lowerCaseSearchTerm) ||
                   status.includes(lowerCaseSearchTerm);
        }
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
    setCurrentPage(1);
  };

  // Handle search with debounce
  const handleSearchChange = (value) => {
    setSearchTerm(value);

    // Clear previous timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer
    const newTimer = setTimeout(() => {
      performSearch(value, searchFilter);


    }, 300); // 300ms debounce

    setSearchDebounceTimer(newTimer);
  };

  // Get item status for filtering
  const getItemStatusForSearch = (item) => {
    // Use the same logic as in table display to get quantity
    const quantity = item.stockQuantity !== undefined && item.stockQuantity !== null ? item.stockQuantity :
                   item.quantity !== undefined && item.quantity !== null ? item.quantity :
                   item.currentStock !== undefined && item.currentStock !== null ? item.currentStock : 0;



    if (quantity === 0) return 'hết hàng';
    if (quantity > 0 && quantity <= 20) return 'sắp hết';
    return 'có sẵn';
  };

  // Combined useEffect to reduce renders
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Update filtered items when inventory items or search filter change
  useEffect(() => {
    performSearch(searchTerm, searchFilter);
  }, [inventoryItems, searchFilter]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('.lukhang-inventory-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  // Function to highlight search terms in text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ?
        <mark key={index} style={{ backgroundColor: '#fff3cd', padding: '0 2px', borderRadius: '2px' }}>
          {part}
        </mark> : part
    );
  };
  
  // Handlers cho việc thêm, sửa, xóa item
  const handleAddItem = async (newItem) => {
    try {
      // Format dates if needed
      const today = new Date().toISOString().split('T')[0];
      
      // Tạo item mới với cấu trúc dữ liệu API mới
      const itemToAdd = {
        ...newItem,
        manufactureDate: newItem.manufactureDate || today
        // Không cần set createdAt, backend tự xử lý
      };
      
      console.log('Adding new item:', itemToAdd);
      
      // Gọi hàm addItem từ context
      const result = await addItem(itemToAdd);
      if (result) {
        console.log('Item added successfully:', result);
        // Refresh để hiển thị item mới (optional)
        fetchItems();
        // Đóng modal sau khi thành công
        setShowAddModal(false);
      }
      return result; // Trả về kết quả để AddItem component biết thành công
    } catch (err) {
      console.error("Lỗi khi thêm vật phẩm:", err);
      throw err; // Ném lỗi để AddItem component xử lý
    }
  };
  
  const handleEditItem = async (updatedItem) => {
    try {
      console.log('Original selected item:', selectedItem);
      console.log('Updating item from modal:', updatedItem);
      
      // Đảm bảo ID luôn được giữ đúng - sử dụng itemId thay vì id
      const itemId = updatedItem.itemId || selectedItem.itemId;
      
      if (!itemId) {
        throw new Error("Không tìm thấy ID vật phẩm để cập nhật");
      }
      
      // Create a properly formatted object for the API
      const itemToUpdate = {
        itemId: itemId, // Sử dụng itemId thay vì id
        itemName: updatedItem.itemName,
        itemType: updatedItem.itemType,
        stockQuantity: updatedItem.stockQuantity,
        unit: updatedItem.unit,
        manufactureDate: updatedItem.manufactureDate,
        expiryDate: updatedItem.expiryDate,
        itemDescription: updatedItem.itemDescription
      };
        // Log for debugging
      console.log('Formatted item for API:', itemToUpdate);
      console.log('Sending update with ID:', itemId);
        // Call the updateItem function with the id and formatted item - sử dụng itemId
      const result = await updateItem(itemId, itemToUpdate);
      console.log('Update result:', result);
      
      // Debug cập nhật dữ liệu
      debugUpdateItem(result);
      
      setShowEditModal(false);
      setSelectedItem(null);
      
      // Chạy fetchItems để đảm bảo UI được cập nhật với dữ liệu mới nhất
      console.log("Đang gọi fetchItems() để làm mới dữ liệu...");
      await fetchItems();
      console.log("Hoàn tất fetchItems()");
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
    }
  };
  
  const handleDeleteItem = async (id) => {
    try {
      console.log("Xóa vật phẩm với itemId:", id);
      // Đảm bảo sử dụng itemId khi xóa vật phẩm
      await deleteItem(id); 
      setShowDeleteModal(false);
      setSelectedItem(null);
      
      // Chạy fetchItems để đảm bảo UI được cập nhật với dữ liệu mới nhất
      await fetchItems();
    } catch (err) {
      console.error("Lỗi khi xóa vật phẩm:", err);
    }
  };

  // Handlers cho modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const openViewDetailsModal = (item) => {
    setSelectedItem(item);
    setShowViewDetailsModal(true);
  };

  // Function to format date from ISO string to dd/mm/yyyy format
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      console.log('🔍 formatDate input:', dateString, 'type:', typeof dateString);

      // Handle different date formats
      let date;

      // If it's already a Date object
      if (dateString instanceof Date) {
        date = dateString;
        console.log('📅 Detected: Date object');
      }
      // If it's an array (LocalDate from Java backend)
      else if (Array.isArray(dateString)) {
        console.log('📅 Detected: Array format (LocalDate from Java)');
        console.log('📅 Array content:', dateString);

        if (dateString.length >= 3) {
          // Array format: [year, month, day] - month is 1-based in Java
          const [year, month, day] = dateString;
          console.log(`📅 Array format: ${year}-${month}-${day}`);
          date = new Date(year, month - 1, day); // Convert to 0-based month for JS
        } else {
          console.warn('❌ Invalid array format:', dateString);
          return dateString.toString();
        }
      }
      // If it's a timestamp (number)
      else if (typeof dateString === 'number') {
        console.log('🔢 Detected: Number format');
        // Handle special case: numbers like 202611, 2025315 (YYYYMM or YYYYMMD format)
        const numStr = dateString.toString();
        console.log(`🔢 Number string: ${numStr}, length: ${numStr.length}`);

        if (numStr.length === 6) {
          // YYYYMM format (202611 = 2026-11)
          const year = numStr.substring(0, 4);
          const month = numStr.substring(4, 6);
          console.log(`📅 YYYYMM format: ${year}-${month}`);
          date = new Date(year, month - 1, 1); // First day of the month
        } else if (numStr.length === 7) {
          // YYYYMMD format (2025315 = 2025-3-15)
          const year = numStr.substring(0, 4);
          const month = numStr.substring(4, 5);
          const day = numStr.substring(5, 7);
          console.log(`📅 YYYYMMD format: ${year}-${month}-${day}`);
          date = new Date(year, month - 1, day);
        } else if (numStr.length === 8) {
          // YYYYMMDD format (20251231 = 2025-12-31)
          const year = numStr.substring(0, 4);
          const month = numStr.substring(4, 6);
          const day = numStr.substring(6, 8);
          console.log(`📅 YYYYMMDD format: ${year}-${month}-${day}`);
          date = new Date(year, month - 1, day);
        } else {
          // Regular timestamp
          console.log('📅 Regular timestamp');
          date = new Date(dateString);
        }
      }
      // If it's a string
      else if (typeof dateString === 'string') {
        console.log('📝 Detected: String format');
        // Check for various string formats
        if (dateString.includes('T')) {
          // ISO format like "2023-07-01T01:00:00.000+00:00"
          console.log('📅 ISO format detected');
          date = new Date(dateString);
        } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // YYYY-MM-DD format (LocalDate from Java backend)
          console.log('📅 YYYY-MM-DD format (LocalDate)');
          const [year, month, day] = dateString.split('-');
          date = new Date(year, month - 1, day);
        } else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          // DD/MM/YYYY format
          console.log('📅 DD/MM/YYYY format');
          const [day, month, year] = dateString.split('/');
          date = new Date(year, month - 1, day);
        } else if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
          // DD-MM-YYYY format
          console.log('📅 DD-MM-YYYY format');
          const [day, month, year] = dateString.split('-');
          date = new Date(year, month - 1, day);
        } else if (dateString.match(/^\d{6}$/)) {
          // YYYYMM format as string
          console.log('📅 YYYYMM string format');
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          date = new Date(year, month - 1, 1);
        } else if (dateString.match(/^\d{7}$/)) {
          // YYYYMMD format as string
          console.log('📅 YYYYMMD string format');
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 5);
          const day = dateString.substring(5, 7);
          date = new Date(year, month - 1, day);
        } else if (dateString.match(/^\d{8}$/)) {
          // YYYYMMDD format
          console.log('📅 YYYYMMDD string format');
          const year = dateString.substring(0, 4);
          const month = dateString.substring(4, 6);
          const day = dateString.substring(6, 8);
          date = new Date(year, month - 1, day);
        } else {
          // Try to parse as is
          console.log('📅 Attempting generic parse');
          date = new Date(dateString);
        }
      } else {
        console.warn('❌ Unknown date format:', dateString);
        return dateString;
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('❌ Invalid date created from:', dateString);
        return dateString;
      }

      // Format as DD/MM/YYYY
      const formatted = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      console.log('✅ formatDate result:', formatted, 'from input:', dateString);
      return formatted;
    } catch (err) {
      console.error('❌ Error formatting date:', err, 'Input:', dateString);
      return dateString; // Return original string if fails
    }
  };

  // Function to calculate status based on quantity
  const getItemStatus = (quantity) => {
    // Convert to number in case it's a string, handle null/undefined
    const qty = quantity !== undefined && quantity !== null ? Number(quantity) : 0;
    console.log('getItemStatus - quantity:', quantity, 'parsed qty:', qty, 'type:', typeof quantity);

    if (qty === 0) {
      return 'Hết hàng';
    } else if (qty > 0 && qty <= 20) {
      return 'Sắp hết';
    } else {
      return 'Có sẵn';
    }
  };

  // Render inventory table with pagination
  const renderInventoryTable = () => {
    // Only show loading on initial load, not during filtering or other operations
    if (loading && (!inventoryItems || inventoryItems.length === 0)) {
      return (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Đang tải dữ liệu...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="alert alert-danger m-3" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      );
    }
    
    if (!filteredItems || filteredItems.length === 0) {
      return (
        <div className="text-center py-5">
          <i className="fas fa-box-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
          <h5 className="text-muted">Không tìm thấy vật phẩm nào phù hợp</h5>
          <p className="text-muted">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      );
    }
    
    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    
    // Tổng số trang
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    return (
      <>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th scope="col" style={{ minWidth: '60px' }}>
                  <i className="fas fa-hashtag me-1"></i>ID
                </th>
                <th scope="col" style={{ minWidth: '150px' }}>
                  <i className="fas fa-tag me-1"></i>Tên vật phẩm
                </th>
                <th scope="col" style={{ minWidth: '120px' }}>
                  <i className="fas fa-list me-1"></i>Loại
                </th>
                <th scope="col" style={{ minWidth: '80px' }}>
                  <i className="fas fa-boxes me-1"></i>Số lượng
                </th>
                <th scope="col" style={{ minWidth: '80px' }}>
                  <i className="fas fa-ruler me-1"></i>Đơn vị
                </th>
                <th scope="col" style={{ minWidth: '120px' }}>
                  <i className="fas fa-calendar-times me-1"></i>Ngày HH
                </th>
                <th scope="col" style={{ minWidth: '100px' }}>
                  <i className="fas fa-info-circle me-1"></i>Trạng thái
                </th>
                <th scope="col" style={{ minWidth: '160px' }}>
                  <i className="fas fa-cogs me-1"></i>Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.itemId || index}>
                  <td className="fw-bold text-primary">{item.itemId || 'N/A'}</td>
                  <td className="fw-semibold">
                    {searchTerm ? highlightSearchTerm(item.itemName || item.name, searchTerm) : (item.itemName || item.name)}
                  </td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {searchTerm ? highlightSearchTerm(item.itemType || item.category, searchTerm) : (item.itemType || item.category)}
                    </span>
                  </td>
                  <td className="text-center fw-bold">
                    {(() => {
                      const quantity = item.stockQuantity !== undefined && item.stockQuantity !== null ? item.stockQuantity : 
                                     item.quantity !== undefined && item.quantity !== null ? item.quantity : 
                                     item.currentStock !== undefined && item.currentStock !== null ? item.currentStock : 0;
                      return quantity !== undefined && quantity !== null ? quantity : 0;
                    })()}
                  </td>
                  <td className="text-dark">
                    {searchTerm ? highlightSearchTerm(item.unit, searchTerm) : item.unit}
                  </td>
                  <td className="text-dark">
                    {(() => {
                      console.log('🚨 DEBUG ITEM:', item.itemName, 'expiryDate:', item.expiryDate, 'type:', typeof item.expiryDate);

                      // Test direct conversion for different formats
                      if (Array.isArray(item.expiryDate)) {
                        console.log('🚨 ARRAY DETECTED:', item.expiryDate);
                        if (item.expiryDate.length >= 3) {
                          const [year, month, day] = item.expiryDate;
                          const testDate = new Date(year, month - 1, day);
                          const testFormatted = testDate.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                          console.log('🚨 ARRAY CONVERSION RESULT:', testFormatted);
                          return testFormatted;
                        }
                      } else if (typeof item.expiryDate === 'number') {
                        const numStr = item.expiryDate.toString();
                        console.log('🚨 NUMBER DETECTED:', numStr, 'length:', numStr.length);

                        if (numStr.length === 6) {
                          // YYYYMM format
                          const year = numStr.substring(0, 4);
                          const month = numStr.substring(4, 6);
                          const testDate = new Date(year, month - 1, 1);
                          const testFormatted = testDate.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                          console.log('🚨 DIRECT CONVERSION RESULT:', testFormatted);
                          return testFormatted;
                        } else if (numStr.length === 7) {
                          // YYYYMMD format
                          const year = numStr.substring(0, 4);
                          const month = numStr.substring(4, 5);
                          const day = numStr.substring(5, 7);
                          const testDate = new Date(year, month - 1, day);
                          const testFormatted = testDate.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                          console.log('🚨 DIRECT CONVERSION RESULT:', testFormatted);
                          return testFormatted;
                        }
                      }

                      const formattedDate = formatDate(item.expiryDate);
                      console.log('🚨 FORMATTED DATE RESULT:', formattedDate);
                      return formattedDate || 'N/A';
                    })()}
                  </td>
                  <td>
                    {(() => {
                      const quantity = item.stockQuantity !== undefined && item.stockQuantity !== null ? item.stockQuantity : 
                                     item.quantity !== undefined && item.quantity !== null ? item.quantity : 
                                     item.currentStock !== undefined && item.currentStock !== null ? item.currentStock : 0;
                      console.log('Item:', item.itemName, 'stockQuantity:', item.stockQuantity, 'quantity:', item.quantity, 'currentStock:', item.currentStock, 'final quantity:', quantity);
                      const status = getItemStatus(quantity);
                      return (
                        <span className={`badge ${
                          status === 'Có sẵn' ? 'bg-success' :
                          status === 'Sắp hết' ? 'bg-warning text-dark' :
                          status === 'Hết hàng' ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          <i className="fas fa-circle me-1" style={{ fontSize: '0.6rem' }}></i>
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => openViewDetailsModal(item)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => openEditModal(item)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => openDeleteModal(item)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination with "1 / 3" style */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
            {/* Showing entries info */}
            <div className="text-muted">
              <small>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
              </small>
            </div>

            {/* Pagination controls */}
            <div className="d-flex align-items-center gap-2">
              {/* First page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="Trang đầu"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>

              {/* Previous page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                title="Trang trước"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-left"></i>
              </button>

              {/* Current page indicator */}
              <div
                className="px-3 py-1 text-white rounded"
                style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'
                }}
              >
                {currentPage} / {totalPages}
              </div>

              {/* Next page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                title="Trang tiếp"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-right"></i>
              </button>

              {/* Last page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Trang cuối"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // Function để debug và xác nhận rằng UI được update đúng
  const debugUpdateItem = (updatedItem) => {
    console.log("===== DEBUG UPDATE ITEM =====");
    console.log("Dữ liệu cập nhật:", updatedItem);
    
    // Tìm item trong danh sách hiện tại
    const currentItemIndex = inventoryItems.findIndex(i => i.itemId === updatedItem.itemId);
    if (currentItemIndex > -1) {
      console.log("Item trước khi cập nhật:", inventoryItems[currentItemIndex]);
      console.log("Item sau khi cập nhật:", updatedItem);
    } else {
      console.log("Không tìm thấy item trong danh sách hiện tại với itemId:", updatedItem.itemId);
    }
  };

  return (
    <>
      <style>{inventoryStyles}</style>
      <div className="container-fluid lukhang-inventory-main-wrapper">
        <div className="card lukhang-inventory-header-card">
          <div className="card-body text-center py-4">
            <h1 className="lukhang-inventory-title-custom">
              <i className="fas fa-warehouse me-3"></i>
              Quản lý kho y tế
            </h1>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
          
            {/* Action Bar */}
            <div className="card shadow-sm mb-4 lukhang-inventory-action-bar">
              <div className="card-body">
                <div className="row align-items-center">
                  {/* Enhanced Search Area */}
                  <div className="col-md-8 mb-3 mb-md-0">
                    <div className="card shadow-sm border-0">
                      <div className="card-body p-4">
                        <div className="row g-3">
                          {/* Hàng đầu tiên: Dropdown chọn loại tìm kiếm */}
                          <div className="col-md-6">
                            <label htmlFor="searchType" className="form-label fw-bold">
                              <i className="fas fa-filter me-1"></i>
                              LOẠI TÌM KIẾM
                            </label>
                            <select
                              id="searchType"
                              className="form-select form-select-lg medical-incidents-dropdown"
                              value={searchFilter}
                              onChange={(e) => {
                                setSearchFilter(e.target.value);
                                setSearchTerm('');
                                setCurrentPage(1);
                              }}
                            >
                              <option value="all">Tất cả</option>
                              <option value="name">Theo tên vật phẩm</option>
                              <option value="type">Theo loại</option>
                              <option value="unit">Theo đơn vị</option>
                              <option value="status">Theo trạng thái</option>
                            </select>
                          </div>

                          {/* Hàng thứ hai: Input tìm kiếm và nút Đặt lại */}
                          <div className="col-md-8">
                            <label htmlFor="searchValue" className="form-label fw-bold">
                              <i className={searchFilter === 'status' ? "fas fa-list me-1" : "fas fa-keyboard me-1"}></i>
                              GIÁ TRỊ TÌM KIẾM
                            </label>
                            {searchFilter === 'status' ? (
                              <select
                                id="searchValue"
                                className="form-select form-select-lg medical-incidents-dropdown"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                              >
                                <option value="">-- Chọn trạng thái --</option>
                                <option value="có sẵn">Có sẵn (&gt;20)</option>
                                <option value="sắp hết">Sắp hết (0&lt;X≤20)</option>
                                <option value="hết hàng">Hết hàng (=0)</option>
                              </select>
                            ) : (
                              <input
                                id="searchValue"
                                type="text"
                                className="form-control form-control-lg"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder={
                                  searchFilter === 'all' ? "Tìm kiếm theo tên, loại, đơn vị hoặc trạng thái..." :
                                  searchFilter === 'name' ? "Nhập tên vật phẩm..." :
                                  searchFilter === 'type' ? "Nhập loại vật phẩm..." :
                                  searchFilter === 'unit' ? "Nhập đơn vị..." : "Nhập trạng thái..."
                                }
                              />
                            )}
                          </div>

                          {/* Nút Đặt lại */}
                          <div className="col-md-4 d-flex align-items-end">
                            <button
                              className="btn btn-outline-secondary btn-lg lukhang-reset-button"
                              onClick={() => {
                                setSearchTerm('');
                                performSearch('', searchFilter);
                              }}
                              title="Xóa tìm kiếm"
                            >
                              <i className="fas fa-redo me-2"></i>
                              Đặt lại
                            </button>
                          </div>
                        </div>

                        {/* Hiển thị trạng thái tìm kiếm */}
                        {searchTerm && (
                          <div className="row mt-3">
                            <div className="col-12">
                              <div className="alert alert-info mb-0">
                                <i className="fas fa-info-circle me-2"></i>
                                Tìm thấy <strong>{filteredItems.length}</strong> kết quả
                                {searchFilter !== 'all' && (
                                  <span> trong mục <strong>
                                    {searchFilter === 'name' ? 'Tên vật phẩm' :
                                     searchFilter === 'type' ? 'Loại' :
                                     searchFilter === 'unit' ? 'Đơn vị' : 'Trạng thái'}
                                  </strong></span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-md-4">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <button
                        className="btn lukhang-inventory-add-item-btn"
                        onClick={() => setShowAddModal(true)}
                        style={{
                          background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)',
                          color: 'white',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(1, 92, 146, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(1, 92, 146, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(1, 92, 146, 0.2)';
                        }}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Thêm vật phẩm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="card shadow-sm lukhang-inventory-table-container">
              <div className="card-body">
                {renderInventoryTable()}
              </div>
            </div>
            
          </div>
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddItem 
            onClose={() => setShowAddModal(false)}
            onAddItem={handleAddItem}
          />
        )}
        
        {showEditModal && selectedItem && (
          <EditItem
            item={selectedItem}
            onClose={() => {
              setShowEditModal(false);
              setSelectedItem(null);
            }}
            onEditItem={handleEditItem}
          />
        )}
        
        {showDeleteModal && selectedItem && (
          <DeleteItem
            item={selectedItem}
            onClose={() => setShowDeleteModal(false)}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {showViewDetailsModal && selectedItem && (
          <ViewDetailsItem
            itemId={selectedItem.itemId}
            show={showViewDetailsModal}
            onClose={() => {
              setShowViewDetailsModal(false);
              setSelectedItem(null);
            }}
          />
        )}

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </>
  );
};

export default InventoryPage;
