import React, { useState, useEffect, useCallback } from "react";
import "./CheckupManagement.css";
import CheckupTable from "./components/CheckupTable";
import CheckupModal from "./components/CheckupModal";
import CheckupDetailModal from "./components/CheckupDetailModal";
import axios from "axios";

// Mock data for checkups
const mockCheckups = [
  {
    id: 1,
    tenDotKham: "Kiểm tra sức khỏe học kỳ 1 năm học 2023-2024",
    ngayBatDau: "2023-09-01",
    ngayKetThuc: "2023-09-15",
    doiTuong: "Học sinh toàn trường",
    trangThai: "Đã hoàn thành",
    nguoiPhuTrach: "Nguyễn Thị Y Tá",
    soLuongHocSinh: 500,
    daKham: 485,
    ghiChu: "Kiểm tra sức khỏe định kỳ đầu năm học"
  },
  {
    id: 2,
    tenDotKham: "Kiểm tra nha khoa 2023",
    ngayBatDau: "2023-10-10",
    ngayKetThuc: "2023-10-20",
    doiTuong: "Học sinh tiểu học",
    trangThai: "Đã hoàn thành",
    nguoiPhuTrach: "Trần Văn Nha Sĩ",
    soLuongHocSinh: 300,
    daKham: 298,
    ghiChu: "Kiểm tra răng miệng và tư vấn vệ sinh răng"
  },
  {
    id: 3,
    tenDotKham: "Kiểm tra thị lực học kỳ 1 năm 2023-2024",
    ngayBatDau: "2023-11-05",
    ngayKetThuc: "2023-11-15",
    doiTuong: "Học sinh khối 1, 6, 10",
    trangThai: "Đã hoàn thành",
    nguoiPhuTrach: "Lê Thị Nhãn Khoa",
    soLuongHocSinh: 250,
    daKham: 240,
    ghiChu: "Kiểm tra thị lực và tư vấn chăm sóc mắt"
  },
  {
    id: 4,
    tenDotKham: "Kiểm tra sức khỏe học kỳ 2 năm học 2023-2024",
    ngayBatDau: "2024-02-15",
    ngayKetThuc: "2024-02-28",
    doiTuong: "Học sinh toàn trường",
    trangThai: "Đang thực hiện",
    nguoiPhuTrach: "Nguyễn Thị Y Tá",
    soLuongHocSinh: 500,
    daKham: 320,
    ghiChu: "Kiểm tra sức khỏe định kỳ giữa năm học"
  },
  {
    id: 5,
    tenDotKham: "Kiểm tra sức khỏe học kỳ 2023-2024 cho học sinh mới",
    ngayBatDau: "2024-05-01",
    ngayKetThuc: "2024-05-10",
    doiTuong: "Học sinh mới",
    trangThai: "Chưa bắt đầu",
    nguoiPhuTrach: "Phạm Thị Khám",
    soLuongHocSinh: 100,
    daKham: 0,
    ghiChu: "Kiểm tra sức khỏe cho học sinh mới nhập học"
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
const checkupApiService = {
  // Get all checkups (with optional filters)
  getAllCheckups: async (filters = {}) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for getAllCheckups");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Apply filters to mock data
      let filteredCheckups = [...mockCheckups];
      
      if (filters.tenDotKham) {
        filteredCheckups = filteredCheckups.filter(checkup => 
          checkup.tenDotKham.toLowerCase().includes(filters.tenDotKham.toLowerCase())
        );
      }
      
      if (filters.trangThai) {
        filteredCheckups = filteredCheckups.filter(checkup => 
          checkup.trangThai === filters.trangThai
        );
      }
      
      if (filters.doiTuong) {
        filteredCheckups = filteredCheckups.filter(checkup => 
          checkup.doiTuong.toLowerCase().includes(filters.doiTuong.toLowerCase())
        );
      }
      
      return filteredCheckups;
    }
    try {
      const response = await authAxios().get('/checkups', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching checkups:", error);
      throw error;
    }
  },

  // Get a single checkup by ID
  getCheckupById: async (id) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for getCheckupById");
      await new Promise(resolve => setTimeout(resolve, 200));
      const checkup = mockCheckups.find(c => c.id === id);
      if (!checkup) throw new Error("Không tìm thấy thông tin kiểm tra");
      return checkup;
    }
    try {
      const response = await authAxios().get(`/checkups/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching checkup ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new checkup
  createCheckup: async (checkupData) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for createCheckup");
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        ...checkupData,
        id: mockCheckups.length + 1
      };
    }
    try {
      const response = await authAxios().post('/checkups', checkupData);
      return response.data;
    } catch (error) {
      console.error("Error creating checkup:", error);
      throw error;
    }
  },

  // Update an existing checkup
  updateCheckup: async (id, checkupData) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for updateCheckup");
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...checkupData, id };
    }
    try {
      const response = await authAxios().put(`/checkups/${id}`, checkupData);
      return response.data;
    } catch (error) {
      console.error(`Error updating checkup ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a checkup
  deleteCheckup: async (id) => {
    if (USE_MOCK_API) {
      console.log("Using mock data for deleteCheckup");
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
    try {
      const response = await authAxios().delete(`/checkups/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting checkup ID ${id}:`, error);
      throw error;
    }
  }
};

const CheckupManagement = () => {
  // State definitions
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    tenDotKham: '',
    trangThai: '',
    doiTuong: ''
  });

  // Load checkups
  useEffect(() => {
    const fetchCheckups = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await checkupApiService.getAllCheckups(filters);
        setCheckups(data);
      } catch (err) {
        console.error("Error loading checkups:", err);
        setError("Không thể tải dữ liệu kiểm tra sức khỏe. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckups();
  }, [filters, refreshTrigger]);

  // Handle view details
  const handleView = useCallback((checkup) => {
    setSelectedCheckup(checkup);
    setIsDetailModalOpen(true);
  }, []);

  // Handle create new
  const handleCreate = useCallback(() => {
    setSelectedCheckup(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((checkup) => {
    setSelectedCheckup(checkup);
    setIsEditMode(true);
    setIsModalOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đợt kiểm tra sức khỏe này?")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await checkupApiService.deleteCheckup(id);
      setRefreshTrigger(prev => prev + 1);
      alert("Xóa đợt kiểm tra sức khỏe thành công!");
    } catch (err) {
      console.error("Error deleting checkup:", err);
      setError("Không thể xóa đợt kiểm tra sức khỏe. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle save (create or update)
  const handleSave = useCallback(async (checkupData) => {
    setLoading(true);
    setError(null);
    try {
      if (isEditMode && selectedCheckup) {
        await checkupApiService.updateCheckup(selectedCheckup.id, checkupData);
        alert("Cập nhật đợt kiểm tra sức khỏe thành công!");
      } else {
        await checkupApiService.createCheckup(checkupData);
        alert("Tạo mới đợt kiểm tra sức khỏe thành công!");
      }
      setIsModalOpen(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error saving checkup:", err);
      setError(isEditMode 
        ? "Không thể cập nhật đợt kiểm tra sức khỏe. Vui lòng thử lại sau."
        : "Không thể tạo mới đợt kiểm tra sức khỏe. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [isEditMode, selectedCheckup]);

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    setFilters({
      tenDotKham: '',
      trangThai: '',
      doiTuong: ''
    });
  }, []);

  return (
    <div className="checkup-management">
      <h1 className="section-title">
        <i className="fas fa-calendar-check"></i> Quản lý kiểm tra sức khỏe định kỳ
      </h1>
      
      {/* Filter section */}
      <div className="filter-section">
        <h2>Bộ lọc</h2>
        <div className="filter-form">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="tenDotKham">Tên đợt kiểm tra</label>
              <input
                type="text"
                id="tenDotKham"
                name="tenDotKham"
                value={filters.tenDotKham}
                onChange={handleFilterChange}
                placeholder="Nhập tên đợt kiểm tra..."
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
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
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

      {/* Checkup table */}
      <CheckupTable
        checkups={checkups}
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Checkup modal for create/edit */}
      {isModalOpen && (
        <CheckupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          checkup={selectedCheckup}
          isEditMode={isEditMode}
        />
      )}

      {/* Checkup detail modal */}
      {isDetailModalOpen && (
        <CheckupDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          checkup={selectedCheckup}
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

export default CheckupManagement;
