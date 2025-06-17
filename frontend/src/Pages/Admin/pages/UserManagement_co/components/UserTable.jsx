import React, { useState, useMemo } from 'react';
import './UserTable.css';

const UserTable = ({ users, isLoading, onView, onEdit, onDelete, onToggleStatus }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // Sorting function with memoization
  const sortedUsers = useMemo(() => {
    const sortableUsers = [...users];
    sortableUsers.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableUsers;
  }, [users, sortConfig]);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIcon = (name) => {
    if (sortConfig.key !== name) {
      return <i className="fas fa-sort text-muted"></i>;
    }
    return sortConfig.direction === 'ascending' 
      ? <i className="fas fa-sort-up"></i> 
      : <i className="fas fa-sort-down"></i>;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="user-table-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu người dùng...</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (users.length === 0) {
    return (
      <div className="user-table-container">
        <div className="empty-state">
          <i className="fas fa-users-slash"></i>
          <p>Không tìm thấy người dùng nào</p>
          <span>Thay đổi bộ lọc hoặc thêm người dùng mới</span>
        </div>
      </div>
    );
  }
  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>          <tr>
            <th onClick={() => requestSort('id')} className="sortable">
              ID {getSortDirectionIcon('id')}
            </th>
            <th onClick={() => requestSort('hoTen')} className="sortable">
              Họ tên {getSortDirectionIcon('hoTen')}
            </th>
            <th onClick={() => requestSort('email')} className="sortable">
              Email {getSortDirectionIcon('email')}
            </th>
            <th onClick={() => requestSort('soDienThoai')} className="sortable">
              Số điện thoại {getSortDirectionIcon('soDienThoai')}
            </th>
            <th onClick={() => requestSort('gioiTinh')} className="sortable">
              Giới tính {getSortDirectionIcon('gioiTinh')}
            </th>
            <th onClick={() => requestSort('vaiTro')} className="sortable">
              Vai trò {getSortDirectionIcon('vaiTro')}
            </th>
            <th onClick={() => requestSort('trangThai')} className="sortable">
              Trạng thái {getSortDirectionIcon('trangThai')}
            </th>
            <th onClick={() => requestSort('ngayTao')} className="sortable">
              Ngày tạo {getSortDirectionIcon('ngayTao')}
            </th>
            <th>Hành động</th>
          </tr>
        </thead>        <tbody>          {currentUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td className="user-name">{user.hoTen}</td>
              <td>{user.email}</td>
              <td>{user.soDienThoai}</td>
              <td>
                <span className={`gender-badge ${user.gioiTinh || 'unknown'}`}>
                  {user.gioiTinh === 'nam' && 'Nam'}
                  {user.gioiTinh === 'nu' && 'Nữ'}
                  {user.gioiTinh === 'khac' && 'Khác'}
                  {!user.gioiTinh && 'Không xác định'}
                </span>
              </td>
              <td>
                <span className={`role-badge ${user.vaiTro}`}>
                  {user.vaiTro === 'admin' && 'Quản trị viên'}
                  {user.vaiTro === 'nurse' && 'Y tá'}
                  {user.vaiTro === 'parent' && 'Phụ huynh'}
                </span>
              </td><td>
                <span 
                  className={`status-badge ${user.trangThai ? 'active' : 'inactive'} clickable`}
                  onClick={() => onToggleStatus(user.id, !user.trangThai)}
                  title={user.trangThai ? 'Nhấp để tạm ngưng' : 'Nhấp để kích hoạt'}
                >
                  {user.trangThai ? 'Hoạt động' : 'Tạm ngưng'}
                </span>
              </td>
              <td>{user.ngayTao}</td>
              <td className="action-buttons">
                <button
                  className="btn-action view"
                  onClick={() => onView(user)}
                  title="Xem chi tiết"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="btn-action edit"
                  onClick={() => onEdit(user)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn-action delete"
                  onClick={() => onDelete(user.id)}
                  title="Xóa"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedUsers.length)} trên tổng số {sortedUsers.length} người dùng
          </div>
          <div className="pagination">
            <button 
              className="pagination-button" 
              onClick={prevPage} 
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(num => 
                num === 1 || 
                num === totalPages || 
                (num >= currentPage - 1 && num <= currentPage + 1)
              )
              .map((number, index, array) => {
                // Add ellipsis where needed
                if (index > 0 && array[index - 1] !== number - 1) {
                  return (
                    <React.Fragment key={`ellipsis-${number}`}>
                      <span className="pagination-ellipsis">...</span>
                      <button
                        className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <button
                    key={number}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                );
              })}
              
            <button 
              className="pagination-button" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
