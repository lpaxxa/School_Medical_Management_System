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
      background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%) !important;
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
    
    @media (max-width: 992px) {
      .lukhang-inventory-main-wrapper {
        padding: 1rem !important;
      }
      
      .lukhang-inventory-title-custom {
        font-size: 1.5rem !important;
      }
    }
  `;
  
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
    // Convert to number in case it's a string, handle null/undefined
    const qty = quantity !== undefined && quantity !== null ? Number(quantity) : 0;
    console.log('getItemStatus - quantity:', quantity, 'parsed qty:', qty, 'type:', typeof quantity);
    
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
                  <td className="fw-semibold">{item.itemName || item.name}</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {item.itemType || item.category}
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
                  <td className="text-dark">{item.unit}</td>              
                  <td className="text-dark">{formatDate(item.expiryDate) || 'N/A'}</td>
                  <td>
                    {(() => {
                      const quantity = item.stockQuantity !== undefined && item.stockQuantity !== null ? item.stockQuantity : 
                                     item.quantity !== undefined && item.quantity !== null ? item.quantity : 
                                     item.currentStock !== undefined && item.currentStock !== null ? item.currentStock : 0;
                      console.log('Item:', item.itemName, 'stockQuantity:', item.stockQuantity, 'quantity:', item.quantity, 'currentStock:', item.currentStock, 'final quantity:', quantity);
                      const status = getItemStatus(quantity);
                      return (
                        <span className={`badge ${
                          status === 'Sẵn có' ? 'bg-success' : 
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
        
        {/* Bootstrap Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
            <div className="text-muted small">
              Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} trên {filteredItems.length} vật phẩm
            </div>
            
            <nav aria-label="Table pagination">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                    title="Trang đầu"
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                </li>
                
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    title="Trang trước"
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                </li>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                </li>
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages}
                    title="Trang cuối"
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
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
                  {/* Search Area */}
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Tìm kiếm theo tên, loại hoặc đơn vị..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => setSearchTerm('')}
                          title="Xóa tìm kiếm"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="col-md-6">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <button 
                        className="btn"
                        onClick={() => setShowAddModal(true)}
                        style={{ backgroundColor: '#0d6efd', color: 'white' }}
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
