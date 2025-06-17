import React, { useState, useEffect } from 'react';
import './InventoryMain.css';
import { useInventory } from '../../../../context/NurseContext';
import inventoryService from '../../../../services/inventoryService';
import AddItem from './AddItem/AddItem';
import EditItem from './EditItem/EditItem';
import DeleteItem from './DeleteItem/DeleteItem';
import ExportData from './ExportData/ExportData';

const InventoryPage = () => {    // Use context directly without fallback mechanism to prevent double renders
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
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Combined useEffect to reduce renders
  useEffect(() => {
    // Call fetchItems only once on component mount
    fetchItems();
  }, [fetchItems]);
    // Update filtered items when inventory items or search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      // No search term, just use all items
      setFilteredItems(inventoryItems || []);
    } else {
      // There's a search term, filter the items
      if (inventoryItems && Array.isArray(inventoryItems)) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        const filtered = inventoryItems.filter(item => {
          // Hàm trợ giúp để lấy giá trị từ nhiều trường khả dụng
          const getValue = (possibleFields) => {
            for (let field of possibleFields) {
              if (item[field]) return item[field].toLowerCase();
            }
            return '';
          };
          
          // Tìm theo tên, loại hoặc đơn vị
          const itemName = getValue(['itemName', 'name']);
          const itemType = getValue(['itemType', 'category']);
          const unit = (item.unit || '').toLowerCase();
          
          return itemName.includes(lowerCaseSearchTerm) || 
                 itemType.includes(lowerCaseSearchTerm) ||
                 unit.includes(lowerCaseSearchTerm);
        });
        setFilteredItems(filtered);
      } else {
        setFilteredItems([]);
      }
    }
    
    // Reset về trang đầu tiên khi thay đổi bộ lọc hoặc searchTerm
    setCurrentPage(1);
  }, [searchTerm, inventoryItems]);
  
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
      // Đóng modal trước khi gọi API để tránh lỗi state
      setShowAddModal(false);
      
      // Gọi hàm addItem từ context
      const result = await addItem(itemToAdd);
      if (result) {
        console.log('Item added successfully:', result);
        // Refresh để hiển thị item mới (optional)
        fetchItems();
      }
    } catch (err) {
      console.error("Lỗi khi thêm vật phẩm:", err);
      alert(`Không thể thêm vật phẩm: ${err.message || 'Lỗi không xác định'}`);
      // Mở lại modal trong trường hợp lỗi nếu muốn
      // setShowAddModal(true);
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
      alert("Có lỗi xảy ra khi cập nhật vật phẩm: " + (err.message || "Vui lòng thử lại."));
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
      alert("Có lỗi xảy ra khi xóa vật phẩm: " + (err.message || "Vui lòng thử lại."));
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
  };  // Function to format date from ISO string to dd/mm/yyyy format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('T')) {
        // ISO format like "2023-07-01T01:00:00.000+00:00"
        date = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      } else {
        // Already formatted or unknown format
        return dateString;
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format as DD/MM/YYYY
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString; // Return original string if fails
    }
  };

  // Function to calculate status based on quantity
  const getItemStatus = (quantity) => {
    // Convert to number in case it's a string
    const qty = Number(quantity);
    
    if (qty === 0) {
      return 'Hết hàng';
    } else if (qty <= 20) {
      return 'Sắp hết';
    } else {
      return 'Sẵn có';
    }
  };  // Render inventory table with pagination
  const renderInventoryTable = () => {
    // Only show loading on initial load, not during filtering or other operations
    if (loading && (!inventoryItems || inventoryItems.length === 0)) {
      return <div className="loading">Đang tải dữ liệu...</div>;
    }
    
    if (error) return <div className="error">{error}</div>;
    
    if (!filteredItems || filteredItems.length === 0) {
      return <div className="no-items">Không tìm thấy vật phẩm nào phù hợp.</div>;
    }
    
    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    
    // Tổng số trang
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    return (
      <>
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên vật phẩm</th>
                <th>Loại</th>
                <th>Số lượng</th>
                <th>Đơn vị</th>
                <th>Ngày sản xuất</th>
                <th>Ngày hết hạn</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.itemId || index}>
                  <td className="id-column">{item.itemId || 'N/A'}</td>
                  <td>{item.itemName || item.name}</td>
                  <td>{item.itemType || item.category}</td>
                  <td>{item.stockQuantity || item.quantity}</td>
                  <td>{item.unit}</td>              
                  <td>{formatDate(item.manufactureDate || item.dateAdded)}</td>
                  <td>{formatDate(item.expiryDate) || 'N/A'}</td>
                  <td>{item.itemDescription || item.description || '-'}</td>
                  <td>
                    {(() => {
                      const quantity = item.stockQuantity || item.quantity;
                      const status = getItemStatus(quantity);
                      return (
                        <span className={`status ${status === 'Sẵn có' ? 'available' : 
                                                status === 'Sắp hết' ? 'low' : 
                                                status === 'Hết hàng' ? 'out' : ''}`}>
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="edit-button"
                      onClick={() => openEditModal(item)}
                    >
                      <i className="fas fa-edit"></i> Sửa
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => openDeleteModal(item)}
                    >
                      <i className="fas fa-trash-alt"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <i className="fas fa-angle-left"></i>
            </button>
            
            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              <i className="fas fa-angle-right"></i>
            </button>
            
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
            
            <div className="pagination-text">
              Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} trên {filteredItems.length} vật phẩm
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
    <div className="inventory-page">
      <div className="inventory-container">        
        <div className="inventory-header">
          <h2>Quản lý kho y tế</h2>
        </div>
        
        <div className="action-bar">
          {/* <div className="filter-buttons">
            <button className="filter-button active">Tên vật phẩm</button>
          </div> */}            
          <div className="search-area">              <div className="search-input-container">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search" 
                    onClick={() => setSearchTerm('')}
                    title="Xóa tìm kiếm"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button 
                className="search-button"
                title="Tìm kiếm"
              >
                <i className="fas fa-search"></i>
              </button>
          </div>
          
          <div className="button-group">
            <button className="add-button" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus"></i> Thêm vật phẩm
            </button>
            <button className="export-button" onClick={() => setShowExportModal(true)}>
              <i className="fas fa-file-export"></i> Xuất báo cáo
            </button>            <div className="dropdown">
              <button className="dropbtn filter-btn">
                <i className="fas fa-filter"></i> Lọc
              </button>              <div className="dropdown-content">                
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems.filter(item => {
                    const quantity = item.stockQuantity || item.quantity;
                    return getItemStatus(quantity) === 'Sẵn có';
                  }));
                  setCurrentPage(1); // Reset về trang 1 khi lọc
                }}>
                  <span className="status-dot available"></span> Sẵn có
                </a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems.filter(item => {
                    const quantity = item.stockQuantity || item.quantity;
                    return getItemStatus(quantity) === 'Sắp hết';
                  }));
                  setCurrentPage(1); // Reset về trang 1 khi lọc
                }}>
                  <span className="status-dot low"></span> Sắp hết
                </a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems.filter(item => {
                    const quantity = item.stockQuantity || item.quantity;
                    return getItemStatus(quantity) === 'Hết hàng';
                  }));
                  setCurrentPage(1); // Reset về trang 1 khi lọc
                }}>
                  <span className="status-dot out"></span> Hết hàng
                </a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems);
                  setCurrentPage(1); // Reset về trang 1 khi lọc
                }}>
                  <i className="fas fa-redo-alt"></i> Hiển thị tất cả
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="inventory-content">
          {renderInventoryTable()}
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
      
      {showExportModal && (
        <ExportData
          items={inventoryItems}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage;
