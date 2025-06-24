import React, { useState, useEffect } from 'react';
import './InventoryMain.css';
import inventoryService from '../../../../services/inventoryService';
import AddItem from './AddItem/AddItem';
import EditItem from './EditItem/EditItem';
import DeleteItem from './DeleteItem/DeleteItem';
import ExportData from './ExportData/ExportData';

// Mock Data for Inventory
// Generate mock data with status calculated automatically
const mockInventoryData = [
  {
    id: 1,
    name: "Băng cá nhân",
    category: "Vật tư sơ cứu",
    quantity: 150,
    unit: "Cái",
    dateAdded: "01/06/2025",
    expiryDate: "01/06/2026"
  },
  {
    id: 2,
    name: "Paracetamol 500mg",
    category: "Thuốc",
    quantity: 30,
    unit: "Vỉ",
    dateAdded: "05/05/2025",
    expiryDate: "05/05/2027"
  },
  {
    id: 3,
    name: "Cồn y tế 70%",
    category: "Vật tư y tế",
    quantity: 5,
    unit: "Chai",
    dateAdded: "10/05/2025",
    expiryDate: "10/05/2026"
  },
  {
    id: 4,
    name: "Bông gòn y tế",
    category: "Vật tư y tế",
    quantity: 19,
    unit: "Gói",
    dateAdded: "15/05/2025",
    expiryDate: "15/05/2027"
  },
  {
    id: 5,
    name: "Vitamin C 500mg",
    category: "Thuốc",
    quantity: 0,
    unit: "Hộp",
    dateAdded: "20/05/2025",
    expiryDate: "20/05/2026"
  },
  {
    id: 6,
    name: "Nhiệt kế điện tử",
    category: "Thiết bị",
    quantity: 8,
    unit: "Cái",
    dateAdded: "25/05/2025",
    expiryDate: "25/05/2030"
  },
  {
    id: 7,
    name: "Khẩu trang y tế",
    category: "Vật tư y tế",
    quantity: 200,
    unit: "Cái",
    dateAdded: "30/05/2025",
    expiryDate: "30/05/2026"
  },
  {
    id: 8,
    name: "Dung dịch sát khuẩn tay",
    category: "Vật tư y tế",
    quantity: 3,
    unit: "Chai",
    dateAdded: "01/06/2025",
    expiryDate: "01/06/2026"
  },
  {
    id: 9,
    name: "Thuốc ho",
    category: "Thuốc",
    quantity: 0,
    unit: "Chai",
    dateAdded: "10/04/2025",
    expiryDate: "10/04/2026"
  },
  {
    id: 10,
    name: "Găng tay y tế",
    category: "Vật tư y tế",
    quantity: 100,
    unit: "Đôi",
    dateAdded: "15/05/2025",
    expiryDate: "15/05/2027"
  }
];

const InventoryPage = () => {  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
    // Sử dụng dữ liệu giả thay vì gọi service
  useEffect(() => {
    // Simulated loading to mimic API call
    setLoading(true);
    setTimeout(() => {
      setInventoryItems(mockInventoryData);
      setFilteredItems(mockInventoryData);
      setLoading(false);
    }, 500);
  }, []);  // Xử lý lọc dữ liệu khi searchTerm thay đổi
  useEffect(() => {
    filterItems();
  }, [searchTerm, inventoryItems]);
  // Hàm lọc dữ liệu (tìm kiếm theo tên, loại và đơn vị)
  const filterItems = () => {
    if (!searchTerm.trim()) {
      setFilteredItems(inventoryItems);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = inventoryItems.filter(item => {
      // Tìm theo tên, loại hoặc đơn vị
      return item.name.toLowerCase().includes(lowerCaseSearchTerm) || 
             item.category.toLowerCase().includes(lowerCaseSearchTerm) ||
             item.unit.toLowerCase().includes(lowerCaseSearchTerm);
    });
    setFilteredItems(filtered);
  };

  // Handlers cho việc thêm, sửa, xóa item
  const handleAddItem = async (newItem) => {
    try {
      // Vì đang dùng mock data nên mô phỏng thêm item mới
      const newId = inventoryItems.length > 0 ? Math.max(...inventoryItems.map(item => item.id)) + 1 : 1;
      const dateFormatted = new Date().toLocaleDateString('vi-VN');
      
      // Tạo item mới với ID tự động tăng
      const itemToAdd = {
        ...newItem,
        id: newId,
        dateAdded: dateFormatted,
      };
      
      // Trong thực tế sẽ gọi API
      // const addedItem = await inventoryService.addItem(itemToAdd);
      
      // Mô phỏng thêm thành công
      setInventoryItems([...inventoryItems, itemToAdd]);
      setFilteredItems([...inventoryItems, itemToAdd]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Lỗi khi thêm vật phẩm:", err);
      setError("Không thể thêm vật phẩm. Vui lòng thử lại sau.");
    }
  };

  const handleEditItem = async (updatedItem) => {
    try {
      const updated = await inventoryService.updateItem(updatedItem);
      setInventoryItems(inventoryItems.map(item => item.id === updated.id ? updated : item));
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật vật phẩm:", err);
      setError("Không thể cập nhật vật phẩm. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await inventoryService.deleteItem(id);
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Lỗi khi xóa vật phẩm:", err);
      setError("Không thể xóa vật phẩm. Vui lòng thử lại sau.");
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
  // Function to calculate status based on quantity
  const getItemStatus = (quantity) => {
    if (quantity === 0) {
      return 'Hết hàng';
    } else if (quantity <= 20) {
      return 'Sắp hết';
    } else {
      return 'Sẵn có';
    }
  };

  // Render inventory table
  const renderInventoryTable = () => {
    if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
    
    if (error) return <div className="error">{error}</div>;
    
    if (filteredItems.length === 0) {
      return <div className="no-items">Không tìm thấy vật phẩm nào phù hợp.</div>;
    }    return (
      <div className="table-container">
        <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên vật phẩm</th>
            <th>Loại</th>
            <th>Số lượng</th>
            <th>Đơn vị</th>            <th>Ngày nhập</th>
            <th>Ngày hết hạn</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.dateAdded}</td>
              <td>{item.expiryDate || 'N/A'}</td>                <td>
                {(() => {
                  const status = getItemStatus(item.quantity);
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
        </tbody>      </table>
      </div>
    );
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
          <div className="search-area">
              <div className="search-input-container">
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
                onClick={() => filterItems()}
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
            </button>
            <div className="dropdown">
              <button className="dropbtn filter-btn">
                <i className="fas fa-filter"></i> Lọc
              </button>
              <div className="dropdown-content">                
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems.filter(item => getItemStatus(item.quantity) === 'Sẵn có'));
                }}>
                  <span className="status-dot available"></span> Sẵn có
                </a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems.filter(item => getItemStatus(item.quantity) === 'Sắp hết'));
                }}>
                  <span className="status-dot low"></span> Sắp hết
                </a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems.filter(item => getItemStatus(item.quantity) === 'Hết hàng'));
                }}>
                  <span className="status-dot out"></span> Hết hàng
                </a>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setFilteredItems(inventoryItems);                
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
          onClose={() => setShowEditModal(false)}
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
