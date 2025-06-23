import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SendMedicine.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import api from "../../../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//http://localhost:8080/api/parent-medication-requests/my-requests
//lịch sử gửi thuốc của phụ huynh

const SendMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { API_ENDPOINTS } = useAuth();

  // State cho tabs và lịch sử
  const [activeTab, setActiveTab] = useState("form"); // "form" hoặc "history"
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    medicineName: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    timeToTake: [],
    notes: "",
    prescriptionImage: null,
  });

  const [errors, setErrors] = useState({});

  const { students, isLoading: studentsLoading } = useStudentData();

  const timeOptions = [
    { value: "before_breakfast", label: "Trước bữa sáng" },
    { value: "after_breakfast", label: "Sau bữa sáng" },
    { value: "before_lunch", label: "Trước bữa trưa" },
    { value: "after_lunch", label: "Sau bữa trưa" },
    { value: "before_dinner", label: "Trước bữa tối" },
    { value: "after_dinner", label: "Sau bữa tối" },
    { value: "bedtime", label: "Trước khi đi ngủ" },
  ];

  // Fetch lịch sử gửi thuốc khi chuyển tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchMedicationHistory();
    }
  }, [activeTab]);

  // Fetch lịch sử gửi thuốc
  const fetchMedicationHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await api.get("/parent-medication-requests/my-requests");
      console.log("Medication history:", response.data);
      setMedicationHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching medication history:", error);
      setHistoryError(
        error.response?.data?.message ||
          "Không thể tải lịch sử yêu cầu thuốc. Vui lòng thử lại sau."
      );
      setMedicationHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi khi người dùng nhập
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleTimeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        timeToTake: [...formData.timeToTake, value],
      });
    } else {
      setFormData({
        ...formData,
        timeToTake: formData.timeToTake.filter((time) => time !== value),
      });
    }

    // Xóa lỗi khi người dùng chọn
    if (errors.timeToTake) {
      setErrors({
        ...errors,
        timeToTake: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          prescriptionImage: "File không được vượt quá 5MB",
        });
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors({
          ...errors,
          prescriptionImage: "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)",
        });
        return;
      }

      setFormData({
        ...formData,
        prescriptionImage: file,
      });

      // Xóa lỗi khi người dùng chọn file hợp lệ
      if (errors.prescriptionImage) {
        setErrors({
          ...errors,
          prescriptionImage: null,
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) newErrors.studentId = "Vui lòng chọn học sinh";
    if (!formData.medicineName)
      newErrors.medicineName = "Vui lòng nhập tên thuốc";
    if (!formData.dosage) newErrors.dosage = "Vui lòng nhập liều lượng";
    if (!formData.frequency)
      newErrors.frequency = "Vui lòng nhập tần suất dùng thuốc";
    if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (formData.timeToTake.length === 0) {
      newErrors.timeToTake = "Vui lòng chọn thời gian uống thuốc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get authentication token
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Vui lòng đăng nhập lại");
        return;
      }

      // Prepare data for API
      const requestData = {
        studentId: parseInt(formData.studentId),
        medicineName: formData.medicineName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeToTake: formData.timeToTake, // Keep as array - DTO expects List<String>
        notes: formData.notes || "",
        // Note: prescriptionImage handling would need multipart form data
      };

      console.log("Dữ liệu gửi đi:", requestData);

      // Call real API
      const response = await axios.post(
        API_ENDPOINTS.parent.submitMedicationRequest,
        requestData,
        {
          headers:
            {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
        }
      );

      console.log("API Response:", response.data);
      setFormSubmitted(true);

      // Refresh lịch sử yêu cầu thuốc nếu cần
      if (activeTab === "history") {
        fetchMedicationHistory();
      }

      // Reset form sau khi gửi thành công
      setFormData({
        studentId: "",
        medicineName: "",
        dosage: "",
        frequency: "",
        startDate: "",
        endDate: "",
        timeToTake: [],
        notes: "",
        prescriptionImage: null,
      });
    } catch (error) {
      console.error("Lỗi khi gửi:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra, vui lòng thử lại sau.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format date cho việc hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Nếu chưa có hàm parseTimeOfDay, thêm hàm này
  const parseTimeOfDay = (timeOfDayString) => {
    if (!timeOfDayString) return [];

    try {
      // Xử lý khi timeOfDayString có định dạng "[string1, string2]"
      // Cần loại bỏ dấu [ và ] rồi tách theo dấu phẩy
      if (typeof timeOfDayString === "string") {
        // Nếu là một chuỗi string JSON đã được parse
        const cleanedString = timeOfDayString.replace(/^\[|\]$/g, "").trim();
        if (!cleanedString) return [];

        // Tách theo dấu phẩy và loại bỏ khoảng trắng, dấu ngoặc kép
        return cleanedString
          .split(",")
          .map((item) => item.replace(/^"|"$|\s/g, "").trim())
          .filter((item) => item);
      }
      // Nếu đã là mảng
      if (Array.isArray(timeOfDayString)) {
        return timeOfDayString;
      }

      // Thử parse JSON nếu là chuỗi JSON hợp lệ
      return JSON.parse(timeOfDayString);
    } catch (error) {
      console.error("Error parsing timeOfDay:", error);
      return [];
    }
  };

  // Chuyển đổi code thành label cho timeOfDay
  const getTimeOfDayLabel = (code) => {
    const option = timeOptions.find((opt) => opt.value === code);
    return option ? option.label : code;
  };

  // Lấy label trạng thái
  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING_APPROVAL: "Đang chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      COMPLETED: "Đã hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Lấy class cho trạng thái
  const getStatusClass = (status) => {
    const statusClasses = {
      PENDING_APPROVAL: "status-pending",
      APPROVED: "status-approved",
      REJECTED: "status-rejected",
      COMPLETED: "status-completed",
      CANCELLED: "status-cancelled",
    };
    return statusClasses[status] || "";
  };

  // Lọc danh sách lịch sử theo học sinh
  const getFilteredHistory = () => {
    if (!selectedStudentFilter) return medicationHistory;

    // Nếu có lọc theo học sinh
    return medicationHistory.filter((item) => {
      const student = students.find(
        (s) => s.id === parseInt(selectedStudentFilter)
      );
      return student && item.studentName === student.name;
    });
  };

  // Add this function to handle updating medication requests
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateRequestId, setUpdateRequestId] = useState(null);

  const handleUpdateRequest = (requestId) => {
    // Tìm yêu cầu cần cập nhật
    const requestToUpdate = medicationHistory.find(
      (request) => request.id === requestId
    );

    if (!requestToUpdate) {
      toast.error("Không tìm thấy yêu cầu thuốc!");
      return;
    }

    // Chỉ cho phép cập nhật yêu cầu đang chờ duyệt
    if (requestToUpdate.status !== "PENDING_APPROVAL") {
      toast.warning("Chỉ có thể cập nhật các yêu cầu đang chờ duyệt");
      return;
    }

    // Điền form modal với dữ liệu hiện tại
    setEditFormData({
      id: requestToUpdate.id,
      medicationName: requestToUpdate.medicationName || "",
      dosageInstructions: requestToUpdate.dosageInstructions || "",
      frequencyPerDay: requestToUpdate.frequencyPerDay || "",
      startDate: requestToUpdate.startDate?.substring(0, 10) || "",
      endDate: requestToUpdate.endDate?.substring(0, 10) || "",
      timeToTake: parseTimeOfDay(requestToUpdate.timeOfDay) || [],
      specialInstructions: requestToUpdate.specialInstructions || "",
      // Lưu thêm thông tin khác cần thiết
      submittedAt: requestToUpdate.submittedAt,
      healthProfileId: requestToUpdate.healthProfileId,
      studentName: requestToUpdate.studentName,
      requestedBy: requestToUpdate.requestedBy,
      requestedByAccountId: requestToUpdate.requestedByAccountId,
      parentProvided: requestToUpdate.parentProvided,
    });

    // Mở modal
    setIsModalOpen(true);
  };

  // Thêm hàm handleDeleteRequest
  const handleDeleteRequest = async (requestId) => {
    // Confirm before cancellation
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này không?")) {
      return;
    }

    setIsHistoryLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Thay đổi URL để sử dụng cancel-request endpoint
      const response = await axios.delete(
        `http://localhost:8080/api/v1/parent-medication-requests/cancel-request/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        // Cập nhật lại danh sách yêu cầu thuốc
        fetchMedicationHistory();
        toast.success("Yêu cầu đã được hủy thành công");
      }
    } catch (error) {
      console.error("Error canceling medication request:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể hủy yêu cầu. Vui lòng thử lại."
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Thêm state cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    medicationName: "",
    dosageInstructions: "",
    frequencyPerDay: "",
    startDate: "",
    endDate: "",
    timeToTake: [],
    specialInstructions: "",
  });

  const [modalErrors, setModalErrors] = useState({});

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleModalTimeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setEditFormData({
        ...editFormData,
        timeToTake: [...editFormData.timeToTake, value],
      });
    } else {
      setEditFormData({
        ...editFormData,
        timeToTake: editFormData.timeToTake.filter((time) => time !== value),
      });
    }
  };

  // Thêm hàm kiểm tra form trước khi submit
  const validateModalForm = () => {
    const modalErrors = {};

    if (!editFormData.medicationName) {
      modalErrors.medicationName = "Vui lòng nhập tên thuốc";
    }

    if (!editFormData.dosageInstructions) {
      modalErrors.dosageInstructions = "Vui lòng nhập liều lượng";
    }

    if (!editFormData.frequencyPerDay) {
      modalErrors.frequencyPerDay = "Vui lòng nhập tần suất";
    }

    if (!editFormData.startDate) {
      modalErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }

    if (!editFormData.endDate) {
      modalErrors.endDate = "Vui lòng chọn ngày kết thúc";
    }

    if (editFormData.timeToTake.length === 0) {
      modalErrors.timeToTake = "Vui lòng chọn thời điểm uống thuốc";
    }

    if (Object.keys(modalErrors).length > 0) {
      setModalErrors(modalErrors);
      return false;
    }

    return true;
  };

  const handleModalFormSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Kiểm tra các trường bắt buộc
      if (!editFormData.medicationName?.trim() ||
          !editFormData.dosageInstructions?.trim() ||
          !editFormData.frequencyPerDay?.trim() ||
          !editFormData.startDate ||
          !editFormData.endDate ||
          !editFormData.timeToTake ||
          editFormData.timeToTake.length === 0) {
        toast.error("Vui lòng điền đầy đủ thông tin thuốc");
        setLoading(false);
        return;
      }

      // Lấy token xác thực
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu gửi đi với TẤT CẢ tên trường có thể
      const updateData = {
        id: editFormData.id,
        submittedAt: editFormData.submittedAt || new Date().toISOString().split("T")[0],
        healthProfileId: editFormData.healthProfileId,
        studentName: editFormData.studentName,
        requestedBy: editFormData.requestedBy,
        requestedByAccountId: editFormData.requestedByAccountId,
        
        // Các trường thông tin thuốc - gửi tất cả các biến thể tên có thể
        medicationName: editFormData.medicationName.trim(),
        medicineName: editFormData.medicationName.trim(),  // Thêm tên trường này
        medicine: editFormData.medicationName.trim(),      // Thêm tên trường này
        
        dosageInstructions: editFormData.dosageInstructions.trim(),
        dosage: editFormData.dosageInstructions.trim(),    // Thêm tên trường này
        
        frequencyPerDay: editFormData.frequencyPerDay.trim(),
        frequency: editFormData.frequencyPerDay.trim(),
        
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        
        // Thêm nhiều biến thể cho timeOfDay/timeToTake
        timeOfDay: Array.isArray(editFormData.timeToTake) ? 
          `[${editFormData.timeToTake.join(', ')}]` : 
          `[${editFormData.timeToTake}]`,
        timeToTake: editFormData.timeToTake,
        
        specialInstructions: editFormData.specialInstructions?.trim() || "",
        notes: editFormData.specialInstructions?.trim() || "",
        
        parentProvided: true,
        status: "PENDING_APPROVAL",
        rejectionReason: null,
        approvedBy: null,
        responseDate: null
      };

      console.log("JSON gửi đi:", JSON.stringify(updateData, null, 2));

      // Gọi API cập nhật
      const response = await axios.put(
        `http://localhost:8080/api/v1/parent-medication-requests/${editFormData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Phản hồi API:", response.data);
      toast.success("Cập nhật yêu cầu thuốc thành công!");
      setIsModalOpen(false);
      fetchMedicationHistory();
      
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu thuốc:", error);
      
      // Hiển thị chi tiết lỗi
      if (error.response) {
        console.error("Dữ liệu lỗi:", error.response.data);
        console.error("Mã trạng thái:", error.response.status);
      }
      
      let errorMessage;
      if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = "Không thể cập nhật yêu cầu thuốc. Vui lòng thử lại sau.";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format lại dữ liệu trước khi gửi đi
  const handleUpdate = async () => {
    try {
      // Đảm bảo định dạng ngày tháng đúng (yyyy-MM-dd)
      const formattedStartDate = formatDateForAPI(editData.startDate);
      const formattedEndDate = formatDateForAPI(editData.endDate);

      // Tạo dữ liệu cập nhật với định dạng ngày tháng đúng
      const updateData = {
        ...requestToUpdate,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        timeOfDay: JSON.stringify(selectedTimes), // Đảm bảo timeOfDay là chuỗi JSON
      };

      // Gọi API cập nhật
      const response = await axios.put(
        `http://localhost:8080/api/v1/parent-medication-requests/${updateData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Xử lý thành công
      toast.success("Cập nhật yêu cầu thuốc thành công!");
      setIsModalOpen(false);

      // Cập nhật lại danh sách lịch sử
      fetchMedicationHistory();
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu thuốc:", error);

      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật yêu cầu thuốc";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hàm để format ngày cho API
  const formatDateForAPI = (dateString) => {
    // Nếu ngày đã có định dạng yyyy-MM-dd, giữ nguyên
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Nếu là dd/MM/yyyy, chuyển sang yyyy-MM-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const parts = dateString.split("/");
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Trường hợp khác, thử chuyển đổi bằng Date object
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Lấy phần yyyy-MM-dd
    } catch {
      // Nếu không thể chuyển đổi, trả về giá trị ban đầu
      return dateString;
    }
  };

  return (
    <div className="send-medicine-container">
      <div className="send-medicine-header">
        <h1>Yêu cầu dùng thuốc cho học sinh</h1>
        <p>
          Phụ huynh có thể gửi yêu cầu cho con uống thuốc tại trường và theo dõi
          trạng thái các yêu cầu đã gửi
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "form" ? "active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          <i className="fas fa-prescription-bottle-alt"></i> Gửi yêu cầu thuốc
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <i className="fas fa-history"></i> Lịch sử yêu cầu
        </button>
      </div>

      {activeTab === "form" ? (
        // Form gửi thuốc
        formSubmitted ? (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Gửi yêu cầu thành công!</h2>
            <p>
              Yêu cầu của bạn đã được ghi nhận. Nhà trường sẽ liên hệ nếu cần
              thêm thông tin.
            </p>
            <div className="success-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  setFormSubmitted(false);
                }}
              >
                Gửi yêu cầu mới
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setActiveTab("history");
                  fetchMedicationHistory();
                }}
              >
                Xem lịch sử yêu cầu
              </button>
            </div>
          </div>
        ) : (
          <form className="send-medicine-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Thông tin học sinh</h3>
              <div className="form-group">
                <label htmlFor="studentId">Chọn học sinh:</label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={errors.studentId ? "error" : ""}
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - Lớp {student.class}
                    </option>
                  ))}
                </select>
                {errors.studentId && (
                  <span className="error-text">{errors.studentId}</span>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Thông tin thuốc</h3>
              <div className="form-group">
                <label htmlFor="medicineName">Tên thuốc:</label>
                <input
                  type="text"
                  id="medicineName"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  placeholder="Nhập tên thuốc"
                  className={errors.medicineName ? "error" : ""}
                />
                {errors.medicineName && (
                  <span className="error-text">{errors.medicineName}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dosage">Liều lượng:</label>
                  <input
                    type="text"
                    id="dosage"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    placeholder="VD: 1 viên, 5ml, ..."
                    className={errors.dosage ? "error" : ""}
                  />
                  {errors.dosage && (
                    <span className="error-text">{errors.dosage}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Tần suất:</label>
                  <input
                    type="text"
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    placeholder="VD: 2 lần/ngày, 8 tiếng/lần, ..."
                    className={errors.frequency ? "error" : ""}
                  />
                  {errors.frequency && (
                    <span className="error-text">{errors.frequency}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={errors.startDate ? "error" : ""}
                  />
                  {errors.startDate && (
                    <span className="error-text">{errors.startDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Ngày kết thúc:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={errors.endDate ? "error" : ""}
                  />
                  {errors.endDate && (
                    <span className="error-text">{errors.endDate}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Thời điểm uống thuốc:</label>
                <div className="checkbox-group">
                  {timeOptions.map((option) => (
                    <div className="checkbox-item" key={option.value}>
                      <input
                        type="checkbox"
                        id={option.value}
                        name="timeToTake"
                        value={option.value}
                        checked={formData.timeToTake.includes(option.value)}
                        onChange={handleTimeChange}
                      />
                      <label htmlFor={option.value}>{option.label}</label>
                    </div>
                  ))}
                </div>
                {errors.timeToTake && (
                  <span className="error-text">{errors.timeToTake}</span>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Thông tin bổ sung</h3>
              <div className="form-group">
                <label htmlFor="prescriptionImage">
                  Đính kèm đơn thuốc (nếu có):
                </label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="prescriptionImage"
                    name="prescriptionImage"
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/jpg"
                    className={errors.prescriptionImage ? "error" : ""}
                  />
                  <label htmlFor="prescriptionImage" className="file-label">
                    <i className="fas fa-upload"></i>
                    {formData.prescriptionImage
                      ? formData.prescriptionImage.name
                      : "Chọn file ảnh"}
                  </label>
                </div>
                {errors.prescriptionImage && (
                  <span className="error-text">{errors.prescriptionImage}</span>
                )}
                <span className="help-text">
                  Chỉ chấp nhận file ảnh (JPEG, PNG, JPG), tối đa 5MB
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú:</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Các lưu ý đặc biệt về việc dùng thuốc (nếu có)"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (isUpdating) {
                    // Nếu đang cập nhật thì hủy và reset form
                    setIsUpdating(false);
                    setUpdateRequestId(null);
                    setFormData({
                      studentId: "",
                      medicineName: "",
                      dosage: "",
                      frequency: "",
                      startDate: "",
                      endDate: "",
                      timeToTake: [],
                      notes: "",
                      prescriptionImage: null,
                    });
                  } else {
                    // Nếu đang tạo mới thì quay lại trang chủ
                    navigate("/parent");
                  }
                }}
              >
                {isUpdating ? "Hủy cập nhật" : "Hủy bỏ"}
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                onClick={isUpdating ? handleUpdateSubmit : handleSubmit}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : isUpdating ? (
                  "Cập nhật yêu cầu"
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </div>
          </form>
        )
      ) : (
        // Tab lịch sử
        <div className="medication-history-container">
          <div className="history-header">
            <h2>Lịch sử yêu cầu dùng thuốc</h2>

            {students && students.length > 0 && (
              <div className="history-filter">
                <label htmlFor="studentFilter">Lọc theo học sinh:</label>
                <select
                  id="studentFilter"
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                >
                  <option value="">Tất cả học sinh</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {historyError && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {historyError}
            </div>
          )}

          {isHistoryLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải lịch sử yêu cầu...</p>
            </div>
          ) : medicationHistory.length === 0 ? (
            <div className="empty-history">
              <i className="fas fa-prescription-bottle-alt"></i>
              <p>Bạn chưa có yêu cầu dùng thuốc nào</p>
              <button
                className="btn-primary"
                onClick={() => setActiveTab("form")}
              >
                Tạo yêu cầu mới
              </button>
            </div>
          ) : (
            <div className="medication-request-list">
              {getFilteredHistory().map((request) => (
                <div className="medication-request-card" key={request.id}>
                  <div className="request-header">
                    <div className="request-title">
                      <h3>{request.medicationName}</h3>
                      <p className="request-student">{request.studentName}</p>
                      <p className="request-date">
                        Ngày yêu cầu: {formatDate(request.submittedAt)}
                      </p>
                    </div>
                    <div className="request-actions">
                      {request.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            className="btn-update"
                            onClick={() => handleUpdateRequest(request.id)}
                          >
                            <i className="fas fa-edit"></i> Cập nhật
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <i className="fas fa-trash"></i> Xóa
                          </button>
                        </>
                      )}
                      <div
                        className={`request-status ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </div>
                    </div>
                  </div>

                  <div className="request-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="detail-label">Liều lượng:</span>
                        <span className="detail-value">
                          {request.dosageInstructions}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tần suất:</span>
                        <span className="detail-value">
                          {request.frequencyPerDay} lần/ngày
                        </span>
                        <span className="detail-value">
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
                        </span>
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <span className="detail-label">Thời điểm uống:</span>
                      <div className="time-tags">
                        {parseTimeOfDay(request.timeOfDay).map(
                          (time, index) => (
                            <span className="time-tag" key={index}>
                              {getTimeOfDayLabel(time)}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {request.specialInstructions && (
                      <div className="detail-item full-width">
                        <span className="detail-label">
                          Hướng dẫn đặc biệt:
                        </span>
                        <span className="detail-value">
                          {request.specialInstructions}
                        </span>
                      </div>
                    )}

                    {request.status === "REJECTED" &&
                      request.rejectionReason && (
                        <div className="rejection-reason">
                          <span className="detail-label">Lý do từ chối:</span>
                          <span className="detail-value">
                            {request.rejectionReason}
                          </span>
                        </div>
                      )}
                  </div>

                  {request.approvedBy && (
                    <div className="request-footer">
                      <div className="approval-info">
                        <span>
                          <i className="fas fa-user-nurse"></i> Duyệt bởi:{" "}
                          {request.approvedBy}
                        </span>
                        {request.responseDate && (
                          <span>
                            <i className="far fa-clock"></i> Ngày phản hồi:{" "}
                            {formatTimestamp(request.responseDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal cập nhật */}
      {isModalOpen && (
        <div className="update-modal-overlay">
          <div className="update-modal">
            <div className="modal-header">
              <h3>Cập nhật yêu cầu thuốc</h3>
              <button
                className="close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <form onSubmit={handleModalFormSubmit}>
                <div className="form-group">
                  <label htmlFor="modal-medicineName">Tên thuốc:</label>
                  <input
                    type="text"
                    id="modal-medicineName"
                    name="medicationName"
                    value={editFormData.medicineName}
                    onChange={handleModalInputChange}
                    placeholder="Nhập tên thuốc"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-dosage">Liều lượng:</label>
                    <input
                      type="text"
                      id="modal-dosage"
                      name="dosageInstructions"
                      value={editFormData.dosageInstructions}
                      onChange={handleModalInputChange}
                      placeholder="VD: 1 viên, 5ml, ..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-frequency">Tần suất:</label>
                    <input
                      type="text"
                      id="modal-frequency"
                      name="frequencyPerDay"
                      value={editFormData.frequencyPerDay}
                      onChange={handleModalInputChange}
                      placeholder="VD: 2 lần/ngày"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="modal-startDate">Ngày bắt đầu:</label>
                    <input
                      type="date"
                      id="modal-startDate"
                      name="startDate"
                      value={editFormData.startDate}
                      onChange={handleModalInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-endDate">Ngày kết thúc:</label>
                    <input
                      type="date"
                      id="modal-endDate"
                      name="endDate"
                      value={editFormData.endDate}
                      onChange={handleModalInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Thời điểm uống thuốc:</label>
                  <div className="checkbox-group">
                    {timeOptions.map((option) => (
                      <div className="checkbox-item" key={option.value}>
                        <input
                          type="checkbox"
                          id={`modal-${option.value}`}
                          name="timeToTake"
                          value={option.value}
                          checked={editFormData.timeToTake.includes(
                            option.value
                          )}
                          onChange={handleModalTimeChange}
                        />
                        <label htmlFor={`modal-${option.value}`}>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-notes">Ghi chú:</label>
                  <textarea
                    id="modal-notes"
                    name="specialInstructions"
                    value={editFormData.specialInstructions}
                    onChange={handleModalInputChange}
                    placeholder="Các lưu ý đặc biệt về việc dùng thuốc (nếu có)"
                    rows="3"
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span> Đang cập nhật...
                      </>
                    ) : (
                      "Cập nhật yêu cầu"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default SendMedicine;
