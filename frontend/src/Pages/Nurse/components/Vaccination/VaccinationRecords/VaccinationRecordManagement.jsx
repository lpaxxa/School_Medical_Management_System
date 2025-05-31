import React, { useState, useEffect } from 'react';
import vaccinationService from '../../../../../services/vaccinationService';
import './VaccinationRecordManagement.css'; // Thêm dòng này để import CSS

const VaccinationRecordManagement = ({ refreshData, openAddRecordModal }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await vaccinationService.getAllVaccinationRecords();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch vaccination records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filteredRecords = await vaccinationService.searchVaccinationRecords(filters);
      setRecords(filteredRecords);
    } catch (error) {
      console.error("Error searching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
    fetchRecords();
  };

  const getStatusClass = (status) => {
    status = status.toLowerCase();
    if (status.includes('hoàn thành')) return 'hoàn-thành';
    if (status.includes('dự kiến')) return 'dự-kiến';
    if (status.includes('hoãn')) return 'hoãn-lại';
    if (status.includes('từ chối')) return 'từ-chối';
    return '';
  };

  return (
    <div className="vaccination-record-management">
      <div className="header-actions">
        <h3>Ghi nhận Tiêm chủng</h3>
        <button className="btn-add-record" onClick={openAddRecordModal}>
          <i className="fas fa-plus"></i> Thêm mũi tiêm mới
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="keyword">Tìm kiếm:</label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              placeholder="Tên học sinh, mã..."
              value={filters.keyword}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-item">
            <label htmlFor="status">Trạng thái:</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Dự kiến">Dự kiến</option>
              <option value="Hoãn lại">Hoãn lại</option>
              <option value="Từ chối">Từ chối</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="fromDate">Từ ngày:</label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-item">
            <label htmlFor="toDate">Đến ngày:</label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-actions">
            <button className="btn-search" onClick={handleSearch}>
              <i className="fas fa-search"></i> Tìm kiếm
            </button>
            <button className="btn-reset" onClick={handleReset}>
              <i className="fas fa-redo"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu tiêm chủng...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Học sinh</th>
                <th>Lớp</th>
                <th>Vaccine</th>
                <th>Mũi số</th>
                <th>Ngày tiêm</th>
                <th>Trạng thái</th>
                <th>Người thực hiện</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={record.id} className={`status-${getStatusClass(record.status)}`}>
                    <td>{index + 1}</td>
                    <td>
                      {record.studentName}
                      <div className="record-code">{record.studentCode}</div>
                    </td>
                    <td>{record.className}</td>
                    <td>
                      {record.vaccineName}
                      <div className="record-code">{record.vaccineCode}</div>
                    </td>
                    <td>{record.dose}</td>
                    <td>
                      {record.dateAdministered
                        ? new Date(record.dateAdministered).toLocaleDateString('vi-VN')
                        : 'Chưa tiêm'}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.administrator || '—'}</td>
                    <td className="actions">
                      <button
                        className="btn-view"
                        onClick={() => handleViewRecord(record)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditRecord(record)}
                        title="Cập nhật"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    Không tìm thấy bản ghi tiêm chủng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VaccinationRecordManagement;