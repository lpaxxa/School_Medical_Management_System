import React, { useState, useEffect, useCallback } from "react";
import "./VaccinationManagement.css";
import VaccinationTable from "./components/VaccinationTable";
import VaccinationModal from "./components/VaccinationModal";
import VaccinationDetailModal from "./components/VaccinationDetailModal";
import axios from "axios";

// Mock data for vaccinations
const mockVaccinations = [
  {
    id: 1,
    tenVaccine: "Vắc xin Sởi - Quai bị - Rubella (MMR)",
    nhaCanXuat: "GlaxoSmithKline",
    soLo: "MMR-12345",
    hanSuDung: "2025-12-31",
    soLuong: 150,
    doiTuong: "Học sinh 6 tuổi",
    trangThai: "Đang sử dụng",
    ngayNhap: "2023-01-15",
    nguoiNhap: "Nguyễn Văn A",
    ghiChu: "Vắc xin phòng ngừa bệnh sởi, quai bị, rubella",
  },
  {
    id: 2,
    tenVaccine: "Vắc xin Bạch hầu - Uốn ván - Ho gà (DTP)",
    nhaCanXuat: "Pfizer",
    soLo: "DTP-67890",
    hanSuDung: "2025-11-30",
    soLuong: 120,
    doiTuong: "Học sinh 4 tuổi",
    trangThai: "Đang sử dụng",
    ngayNhap: "2023-02-20",
    nguoiNhap: "Trần Thị B",
    ghiChu: "Vắc xin phòng ngừa bệnh bạch hầu, uốn ván, ho gà",
  },
  {
    id: 3,
    tenVaccine: "Vắc xin Viêm gan B",
    nhaCanXuat: "Merck",
    soLo: "HEP-B-54321",
    hanSuDung: "2025-10-15",
    soLuong: 200,
    doiTuong: "Tất cả học sinh",
    trangThai: "Đang sử dụng",
    ngayNhap: "2023-03-10",
    nguoiNhap: "Lê Văn C",
    ghiChu: "Vắc xin phòng ngừa bệnh viêm gan B",
  },
  {
    id: 4,
    tenVaccine: "Vắc xin Cúm mùa",
    nhaCanXuat: "Sanofi",
    soLo: "FLU-11223",
    hanSuDung: "2024-06-30",
    soLuong: 80,
    doiTuong: "Tất cả học sinh",
    trangThai: "Đang sử dụng",
    ngayNhap: "2023-04-05",
    nguoiNhap: "Phạm Thị D",
    ghiChu: "Vắc xin phòng ngừa bệnh cúm mùa",
  },
  {
    id: 5,
    tenVaccine: "Vắc xin Thủy đậu",
    nhaCanXuat: "Merck",
    soLo: "VAR-99887",
    hanSuDung: "2024-09-30",
    soLuong: 100,
    doiTuong: "Học sinh 5-10 tuổi",
    trangThai: "Sắp hết hàng",
    ngayNhap: "2023-05-15",
    nguoiNhap: "Hoàng Văn E",
    ghiChu: "Vắc xin phòng ngừa bệnh thủy đậu",
  }
];

// API service functions integrated directly
const USE_MOCK_API = true;
const API_URL = 'http://localhost:5000/api';

// Axios instance with auth header
const authAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// API service functions
const vaccinationApiService = {
  // Get all vaccinations (with optional filters)
  getAllVaccinations: async (filters = {}) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for getAllVaccinations");
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockVaccinations;
    }
    try {
      const response = await authAxios().get('/vaccinations', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching vaccinations:", error);
      throw error;
    }
  },

  // Get a single vaccination by ID
  getVaccinationById: async (id) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for getVaccinationById");
      await new Promise(resolve => setTimeout(resolve, 200));
      const vaccination = mockVaccinations.find(v => v.id === id);
      if (!vaccination) throw new Error("Không tìm thấy thông tin tiêm chủng");
      return vaccination;
    }
    try {
      const response = await authAxios().get(`/vaccinations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccination ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new vaccination
  createVaccination: async (vaccinationData) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for createVaccination");
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        ...vaccinationData,
        id: mockVaccinations.length + 1,
        ngayNhap: new Date().toISOString().split('T')[0]
      };
    }
    try {
      const response = await authAxios().post('/vaccinations', vaccinationData);
      return response.data;
    } catch (error) {
      console.error("Error creating vaccination:", error);
      throw error;
    }
  },

  // Update an existing vaccination
  updateVaccination: async (id, vaccinationData) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for updateVaccination");
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...vaccinationData, id };
    }
    try {
      const response = await authAxios().put(`/vaccinations/${id}`, vaccinationData);
      return response.data;
    } catch (error) {
      console.error(`Error updating vaccination ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a vaccination
  deleteVaccination: async (id) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for deleteVaccination");
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
    try {
      const response = await authAxios().delete(`/vaccinations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting vaccination ID ${id}:`, error);
      throw error;
    }
  }
};

const VaccinationManagement = () => {
  // State definitions
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    tenVaccine: '',
    trangThai: '',
    doiTuong: ''
  });

  // Load vaccinations
  useEffect(() => {
    const fetchVaccinations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vaccinationApiService.getAllVaccinations(filters);
        setVaccinations(data);
      } catch (err) {
        console.error("Error loading vaccinations:", err);
        setError("Không thể tải dữ liệu tiêm chủng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, [filters, refreshTrigger]);

  // Handle view details
  const handleView = useCallback((vaccination) => {
    setSelectedVaccination(vaccination);
    setIsDetailModalOpen(true);
  }, []);

  // Handle create new
  const handleCreate = useCallback(() => {
    setSelectedVaccination(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((vaccination) => {
    setSelectedVaccination(vaccination);
    setIsEditMode(true);
    setIsModalOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông tin tiêm chủng này?")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await vaccinationApiService.deleteVaccination(id);
      setRefreshTrigger(prev => prev + 1);
      alert("Xóa thông tin tiêm chủng thành công!");
    } catch (err) {
      console.error("Error deleting vaccination:", err);
      setError("Không thể xóa thông tin tiêm chủng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle save (create or update)
  const handleSave = useCallback(async (vaccinationData) => {
    setLoading(true);
    setError(null);
    try {
      if (isEditMode && selectedVaccination) {
        await vaccinationApiService.updateVaccination(selectedVaccination.id, vaccinationData);
        alert("Cập nhật thông tin tiêm chủng thành công!");
      } else {
        await vaccinationApiService.createVaccination(vaccinationData);
        alert("Tạo mới thông tin tiêm chủng thành công!");
      }
      setIsModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error saving vaccination:", err);
      setError(isEditMode 
        ? "Không thể cập nhật thông tin tiêm chủng. Vui lòng thử lại sau."
        : "Không thể tạo mới thông tin tiêm chủng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [isEditMode, selectedVaccination]);

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      tenVaccine: '',
      trangThai: '',
      doiTuong: ''
    });
  }, []);

  return (
    <div className="vaccination-management">
      <h1 className="section-title">
        <i className="fas fa-syringe"></i> Quản lý tiêm chủng
      </h1>
      
      {/* Filter section */}
      <div className="filter-section">
        <h2>Bộ lọc</h2>
        <div className="filter-form">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="tenVaccine">Tên vắc xin</label>
              <input
                type="text"
                id="tenVaccine"
                name="tenVaccine"
                value={filters.tenVaccine}
                onChange={handleFilterChange}
                placeholder="Nhập tên vắc xin..."
              />
            </div>
            <div className="filter-group">
              <label htmlFor="trangThai">Trạng thái</label>
              <select
                id="trangThai"
                name="trangThai"
                value={filters.trangThai}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="Đang sử dụng">Đang sử dụng</option>
                <option value="Sắp hết hàng">Sắp hết hàng</option>
                <option value="Hết hạn">Hết hạn</option>
                <option value="Ngừng sử dụng">Ngừng sử dụng</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="doiTuong">Đối tượng</label>
              <input
                type="text"
                id="doiTuong"
                name="doiTuong"
                value={filters.doiTuong}
                onChange={handleFilterChange}
                placeholder="Nhập đối tượng..."
              />
            </div>
            <div className="filter-actions">
              <button className="btn-secondary" onClick={handleResetFilters}>
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-bar">
        <button className="btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus"></i> Thêm mới
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Vaccination table */}
      <VaccinationTable
        vaccinations={vaccinations}
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Vaccination modal for create/edit */}
      {isModalOpen && (
        <VaccinationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          vaccination={selectedVaccination}
          isEditMode={isEditMode}
        />
      )}

      {/* Vaccination detail modal */}
      {isDetailModalOpen && (
        <VaccinationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          vaccination={selectedVaccination}
          onEdit={() => {
            setIsDetailModalOpen(false);
            setIsEditMode(true);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default VaccinationManagement;
