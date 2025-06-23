import React, { useState, useMemo } from 'react';
import './CheckupTable.css';

const CheckupTable = ({ checkups, isLoading, onView, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting function with memoization
  const sortedCheckups = useMemo(() => {
    const sortableCheckups = [...checkups];
    sortableCheckups.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableCheckups;
  }, [checkups, sortConfig]);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCheckups = sortedCheckups.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCheckups.length / itemsPerPage);
  
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

  // Get status class for styling
  const getStatusClass = (trangThai) => {
    switch(trangThai) {
      case 'Đã hoàn thành':
        return 'status-completed';
      case 'Đang thực hiện':
        return 'status-in-progress';
      case 'Chưa bắt đầu':
        return 'status-not-started';
      case 'Đã hủy':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Calculate progress percentage
  const calculateProgress = (daKham, soLuongHocSinh) => {
    if (!soLuongHocSinh || soLuongHocSinh === 0) return 0;
    return Math.round((daKham / soLuongHocSinh) * 100);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="checkup-table-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu kiểm tra sức khỏe...</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (checkups.length === 0) {
    return (
      <div className="checkup-table-container">
        <div className="empty-state">
          <i className="fas fa-calendar-check"></i>
          <p>Không tìm thấy dữ liệu kiểm tra sức khỏe nào</p>
          <span>Thay đổi bộ lọc hoặc thêm dữ liệu mới</span>
        </div>
      </div>
    );
  }

  return (
    <div className="checkup-table-container">
      <table className="checkup-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('id')} className="sortable">
              ID {getSortDirectionIcon('id')}
            </th>
            <th onClick={() => requestSort('tenDotKham')} className="sortable">
              Tên đợt kiểm tra {getSortDirectionIcon('tenDotKham')}
            </th>
            <th onClick={() => requestSort('ngayBatDau')} className="sortable">
              Ngày bắt đầu {getSortDirectionIcon('ngayBatDau')}
            </th>
            <th onClick={() => requestSort('ngayKetThuc')} className="sortable">
              Ngày kết thúc {getSortDirectionIcon('ngayKetThuc')}
            </th>
            <th onClick={() => requestSort('doiTuong')} className="sortable">
              Đối tượng {getSortDirectionIcon('doiTuong')}
            </th>
            <th onClick={() => requestSort('trangThai')} className="sortable">
              Trạng thái {getSortDirectionIcon('trangThai')}
            </th>
            <th>Tiến độ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentCheckups.map((checkup) => (
            <tr key={checkup.id}>
              <td>{checkup.id}</td>
              <td className="checkup-name">{checkup.tenDotKham}</td>
              <td>{checkup.ngayBatDau}</td>
              <td>{checkup.ngayKetThuc}</td>
              <td>{checkup.doiTuong}</td>
              <td>
                <span className={`status-badge ${getStatusClass(checkup.trangThai)}`}>
                  {checkup.trangThai}
                </span>
              </td>
              <td>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${calculateProgress(checkup.daKham, checkup.soLuongHocSinh)}%`,
                        backgroundColor: checkup.trangThai === 'Đã hoàn thành' ? '#38a169' : '#3182ce'
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {checkup.daKham}/{checkup.soLuongHocSinh} ({calculateProgress(checkup.daKham, checkup.soLuongHocSinh)}%)
                  </span>
                </div>
              </td>
              <td className="action-buttons">
                <button
                  className="btn-action view"
                  onClick={() => onView(checkup)}
                  title="Xem chi tiết"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="btn-action edit"
                  onClick={() => onEdit(checkup)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn-action delete"
                  onClick={() => onDelete(checkup.id)}
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
            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedCheckups.length)} trên tổng số {sortedCheckups.length} bản ghi
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

export default CheckupTable;
