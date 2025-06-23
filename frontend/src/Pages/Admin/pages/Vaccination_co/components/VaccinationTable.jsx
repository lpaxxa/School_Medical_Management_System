import React, { useState, useMemo } from 'react';
import './VaccinationTable.css';

const VaccinationTable = ({ vaccinations, isLoading, onView, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'ascending'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting function with memoization
  const sortedVaccinations = useMemo(() => {
    const sortableVaccinations = [...vaccinations];
    sortableVaccinations.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableVaccinations;
  }, [vaccinations, sortConfig]);
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVaccinations = sortedVaccinations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedVaccinations.length / itemsPerPage);
  
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
      case 'Đang sử dụng':
        return 'status-active';
      case 'Sắp hết hàng':
        return 'status-warning';
      case 'Hết hạn':
        return 'status-expired';
      case 'Ngừng sử dụng':
        return 'status-inactive';
      default:
        return '';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="vaccination-table-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu tiêm chủng...</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (vaccinations.length === 0) {
    return (
      <div className="vaccination-table-container">
        <div className="empty-state">
          <i className="fas fa-syringe"></i>
          <p>Không tìm thấy dữ liệu tiêm chủng nào</p>
          <span>Thay đổi bộ lọc hoặc thêm dữ liệu mới</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccination-table-container">
      <table className="vaccination-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('id')} className="sortable">
              ID {getSortDirectionIcon('id')}
            </th>
            <th onClick={() => requestSort('tenVaccine')} className="sortable">
              Tên vắc xin {getSortDirectionIcon('tenVaccine')}
            </th>
            <th onClick={() => requestSort('nhaCanXuat')} className="sortable">
              Nhà cung cấp {getSortDirectionIcon('nhaCanXuat')}
            </th>
            <th onClick={() => requestSort('soLuong')} className="sortable">
              Số lượng {getSortDirectionIcon('soLuong')}
            </th>
            <th onClick={() => requestSort('hanSuDung')} className="sortable">
              Hạn sử dụng {getSortDirectionIcon('hanSuDung')}
            </th>
            <th onClick={() => requestSort('doiTuong')} className="sortable">
              Đối tượng {getSortDirectionIcon('doiTuong')}
            </th>
            <th onClick={() => requestSort('trangThai')} className="sortable">
              Trạng thái {getSortDirectionIcon('trangThai')}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentVaccinations.map((vaccination) => (
            <tr key={vaccination.id}>
              <td>{vaccination.id}</td>
              <td className="vaccine-name">{vaccination.tenVaccine}</td>
              <td>{vaccination.nhaCanXuat}</td>
              <td>{vaccination.soLuong}</td>
              <td>{vaccination.hanSuDung}</td>
              <td>{vaccination.doiTuong}</td>
              <td>
                <span className={`status-badge ${getStatusClass(vaccination.trangThai)}`}>
                  {vaccination.trangThai}
                </span>
              </td>
              <td className="action-buttons">
                <button
                  className="btn-action view"
                  onClick={() => onView(vaccination)}
                  title="Xem chi tiết"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="btn-action edit"
                  onClick={() => onEdit(vaccination)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn-action delete"
                  onClick={() => onDelete(vaccination.id)}
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
            Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedVaccinations.length)} trên tổng số {sortedVaccinations.length} bản ghi
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

export default VaccinationTable;
