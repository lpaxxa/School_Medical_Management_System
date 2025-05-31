import React, { useState, useEffect } from 'react';
import vaccinationService from '../../../../../services/vaccinationService';
import './VaccineManagement.css';
// Import component VaccineForm từ thư mục mới
import VaccineForm from './VaccineManagement_Components/VaccineForm';

const VaccineManagement = ({ refreshData, openAddVaccineModal }) => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '' });
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState(null);
  
  // Thêm state cho modal thêm mới vaccine
  const [showAddModal, setShowAddModal] = useState(false);
  // Thêm state cho modal chỉnh sửa vaccine
  const [showEditModal, setShowEditModal] = useState(false);
  const [vaccineToEdit, setVaccineToEdit] = useState(null);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const data = await vaccinationService.getAllVaccines();
      setVaccines(data);
    } catch (error) {
      console.error("Failed to fetch vaccines:", error);
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
      const filteredVaccines = await vaccinationService.searchVaccines(filters.keyword);
      setVaccines(filteredVaccines);
    } catch (error) {
      console.error("Error searching vaccines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ keyword: '' });
    fetchVaccines();
  };

  const handleViewDetails = (vaccine) => {
    setSelectedVaccine(vaccine);
    setShowDetailModal(true);
  };

  // Thêm hàm xử lý hiển thị modal xác nhận xóa
  const handleDeleteClick = (vaccine) => {
    setVaccineToDelete(vaccine);
    setShowDeleteModal(true);
  };

  // Thêm hàm xử lý xóa vaccine
  const handleDeleteVaccine = async () => {
    if (!vaccineToDelete) return;
    
    try {
      setLoading(true);
      await vaccinationService.deleteVaccine(vaccineToDelete.id);
      // Cập nhật lại danh sách sau khi xóa
      fetchVaccines();
      // Đóng modal xác nhận
      setShowDeleteModal(false);
      setVaccineToDelete(null);
    } catch (error) {
      console.error("Failed to delete vaccine:", error);
      alert("Không thể xóa vaccine. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm mở modal thêm vaccine
  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  // Thêm hàm đóng modal thêm vaccine
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  // Thêm hàm xử lý thêm vaccine mới
  const handleAddVaccine = async (vaccineData) => {
    try {
      setLoading(true);
      await vaccinationService.addVaccine(vaccineData);
      fetchVaccines();
      setShowAddModal(false);
      alert('Thêm vaccine mới thành công!');
    } catch (error) {
      console.error("Failed to add vaccine:", error);
      alert('Không thể thêm vaccine. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm mở modal chỉnh sửa
  const handleEditVaccine = (vaccine) => {
    setVaccineToEdit(vaccine);
    setShowEditModal(true);
  };

  // Thêm hàm đóng modal chỉnh sửa
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setVaccineToEdit(null);
  };

  // Thêm hàm xử lý cập nhật vaccine
  const handleUpdateVaccine = async (updatedData) => {
    if (!vaccineToEdit) return;
    
    try {
      setLoading(true);
      // Thêm ID của vaccine vào dữ liệu cập nhật
      await vaccinationService.updateVaccine({
        ...updatedData,
        id: vaccineToEdit.id
      });
      fetchVaccines();
      setShowEditModal(false);
      setVaccineToEdit(null);
      alert('Cập nhật vaccine thành công!');
    } catch (error) {
      console.error("Failed to update vaccine:", error);
      alert('Không thể cập nhật vaccine. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vaccine-management">
      <div className="header-actions">
        <h3>Quản lý Vaccine</h3>
        <button className="add-btn" onClick={handleOpenAddModal}>
          <i className="fas fa-plus"></i> Thêm Vaccine mới
        </button>
      </div>

      <div className="filter-section compact">
        <div className="filter-row">
          <div className="filter-item">
            <input
              type="text"
              name="keyword"
              placeholder="Tìm theo tên vaccine hoặc mã..."
              value={filters.keyword}
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
          <p>Đang tải dữ liệu vaccine...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="vaccines-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã</th>
                <th>Tên Vaccine</th>
                <th>Độ tuổi khuyến nghị</th>
                <th>Số mũi</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vaccines.length > 0 ? (
                vaccines.map((vaccine, index) => (
                  <tr key={vaccine.id}>
                    <td>{index + 1}</td>
                    <td>{vaccine.code}</td>
                    <td>{vaccine.name}</td>
                    <td>{vaccine.recommendedAge} tháng</td>
                    <td>{vaccine.dosages}</td>
                    <td>
                      <span className={`badge ${vaccine.mandatory ? 'mandatory' : 'optional'}`}>
                        {vaccine.mandatory ? 'Bắt buộc' : 'Không bắt buộc'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${vaccine.active ? 'active' : 'inactive'}`}>
                        {vaccine.active ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(vaccine)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEditVaccine(vaccine)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {/* Thêm nút xóa vào đây */}
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClick(vaccine)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    Không tìm thấy vaccine nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal thêm mới vaccine */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Thêm Vaccine Mới</h3>
              <button className="btn-close" onClick={handleCloseAddModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <VaccineForm 
                onSubmit={handleAddVaccine}
                onCancel={handleCloseAddModal}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa vaccine */}
      {showEditModal && vaccineToEdit && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chỉnh sửa Vaccine</h3>
              <button className="btn-close" onClick={handleCloseEditModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <VaccineForm 
                vaccine={vaccineToEdit}
                onSubmit={handleUpdateVaccine}
                onCancel={handleCloseEditModal}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết vaccine */}
      {showDetailModal && selectedVaccine && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chi tiết Vaccine</h3>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="vaccine-details">
                <div className="detail-row">
                  <div className="detail-label">Mã vaccine:</div>
                  <div className="detail-value">{selectedVaccine.code}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Tên vaccine:</div>
                  <div className="detail-value">{selectedVaccine.name}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Độ tuổi khuyến nghị:</div>
                  <div className="detail-value">{selectedVaccine.recommendedAge} tháng</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Số mũi cần tiêm:</div>
                  <div className="detail-value">{selectedVaccine.dosages}</div>
                </div>
                {selectedVaccine.interval && (
                  <div className="detail-row">
                    <div className="detail-label">Khoảng cách giữa các mũi:</div>
                    <div className="detail-value">{selectedVaccine.interval} tháng</div>
                  </div>
                )}
                <div className="detail-row">
                  <div className="detail-label">Loại:</div>
                  <div className="detail-value">
                    <span className={`badge ${selectedVaccine.mandatory ? 'mandatory' : 'optional'}`}>
                      {selectedVaccine.mandatory ? 'Bắt buộc' : 'Không bắt buộc'}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Trạng thái:</div>
                  <div className="detail-value">
                    <span className={`status ${selectedVaccine.active ? 'active' : 'inactive'}`}>
                      {selectedVaccine.active ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Mô tả:</div>
                  <div className="detail-value description">{selectedVaccine.description || 'Không có mô tả'}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowDetailModal(false)}>
                <i className="fas fa-check"></i> Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thêm Modal xác nhận xóa */}
      {showDeleteModal && vaccineToDelete && (
        <div className="modal-overlay">
          <div className="modal-container confirmation-modal">
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa vaccine <strong>{vaccineToDelete.name}</strong>?</p>
              <p className="warning-text">Lưu ý: Thao tác này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i> Hủy bỏ
              </button>
              <button className="btn-danger" onClick={handleDeleteVaccine}>
                <i className="fas fa-trash-alt"></i> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineManagement;