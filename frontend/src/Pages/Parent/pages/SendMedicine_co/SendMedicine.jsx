import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import fixed CSS file with prefixed classes
import "./styles/SendMedicineFixed.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useAuth } from "../../../../context/AuthContext";
import medicationRequestService from "../../../../services/medicationRequestService";
// import NotificationModal from "./components/NotificationModal";
// import {
//   // handleApiError,
//   // validateMedicineForm,
//   // validateImageFile,
//   formatDisplayDate,
//   // formatApiDate,
//   // getStatusInfo,
// } from "./utils/errorHandler";

const SendMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { API_ENDPOINTS } = useAuth();

  // State cho tabs và lịch sử
  const [activeTab, setActiveTab] = useState("form");
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("");
  const [successTimer, setSuccessTimer] = useState(null);
  const [notificationModal, setNotificationModal] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

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

  // State for temporary image upload
  const [tempImageUpload, setTempImageUpload] = useState({
    file: null,
    preview: null,
    uploadedImageBase64: null,
    isUploading: false,
    uploadError: null,
    tempRequestId: null,
  });

  const [errors, setErrors] = useState({});

  // State cho modal cập nhật
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [modalErrors, setModalErrors] = useState({});
  const [modalPrescriptionImage, setModalPrescriptionImage] = useState(null);
  const [modalImagePreview, setModalImagePreview] = useState(null);

  // State cho confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [confirmationList, setConfirmationList] = useState([]);
  const [currentConfirmationIndex, setCurrentConfirmationIndex] = useState(0);
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  const { students } = useStudentData();

  const timeOptions = [
    { value: "before_breakfast", label: "Trước bữa sáng" },
    { value: "after_breakfast", label: "Sau bữa sáng" },
    { value: "before_lunch", label: "Trước bữa trưa" },
    { value: "after_lunch", label: "Sau bữa trưa" },
    { value: "before_dinner", label: "Trước bữa tối" },
    { value: "after_dinner", label: "Sau bữa tối" },
    { value: "bedtime", label: "Trước khi đi ngủ" },
  ];

  useEffect(() => {
    if (formSubmitted) {
      const timer = setTimeout(() => {
        setFormSubmitted(false);
        setActiveTab("form");
      }, 5000);
      setSuccessTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [formSubmitted]);

  useEffect(() => {
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [successTimer]);

  useEffect(() => {
    if (notificationModal.show) {
      const timer = setTimeout(() => {
        setNotificationModal({ ...notificationModal, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationModal.show]);

  const showNotification = (type, title, message) => {
    setNotificationModal({ show: true, type, title, message });
  };

  // Helper function để format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function để lấy label trạng thái
  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING_APPROVAL: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      FULLY_TAKEN: "Đã uống đủ",
      PARTIALLY_TAKEN: "Uống một phần",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status || "Không xác định";
  };

  // Helper function để parse time of day
  const parseTimeOfDay = (timeOfDay) => {
    if (!timeOfDay) return [];
    if (Array.isArray(timeOfDay)) return timeOfDay;
    if (typeof timeOfDay === "string") {
      try {
        // Nếu là JSON string
        return JSON.parse(timeOfDay);
      } catch {
        // Nếu là string đơn giản, split bằng dấu phẩy
        return timeOfDay.split(",").map((time) => time.trim());
      }
    }
    return [];
  };

  // Helper function để lấy label thời gian uống thuốc
  const getTimeOfDayLabel = (time) => {
    console.log(
      `🔍 getTimeOfDayLabel input - Type: ${typeof time}, Value:`,
      time
    );

    // Nếu time là array, lấy phần tử đầu tiên
    if (Array.isArray(time)) {
      console.log(`⚠️ Time is array, taking first element: ${time[0]}`);
      time = time[0];
    }

    const timeLabels = {
      // Mapping cho các giá trị từ timeOptions
      before_breakfast: "Trước bữa sáng",
      after_breakfast: "Sau bữa sáng",
      before_lunch: "Trước bữa trưa",
      after_lunch: "Sau bữa trưa",
      before_dinner: "Trước bữa tối",
      after_dinner: "Sau bữa tối",
      bedtime: "Trước khi đi ngủ",
      // Mapping cho các giá trị cũ (để tương thích ngược)
      MORNING: "Sáng",
      AFTERNOON: "Chiều",
      EVENING: "Tối",
      NIGHT: "Đêm",
      BEFORE_MEAL: "Trước ăn",
      AFTER_MEAL: "Sau ăn",
      WITH_MEAL: "Trong bữa ăn",
    };

    // Nếu có mapping trực tiếp, sử dụng nó
    if (timeLabels[time]) {
      console.log(`✅ Found mapping: ${time} → ${timeLabels[time]}`);
      return timeLabels[time];
    }

    // Nếu là thời gian cụ thể (HH:MM), chuyển đổi thành label tiếng Việt
    if (typeof time === "string" && time.match(/^\d{2}:\d{2}$/)) {
      const hour = parseInt(time.split(":")[0]);

      if (hour >= 6 && hour < 11) {
        return "Sáng";
      } else if (hour >= 11 && hour < 14) {
        return "Trưa";
      } else if (hour >= 14 && hour < 18) {
        return "Chiều";
      } else if (hour >= 18 && hour < 22) {
        return "Tối";
      } else {
        return "Đêm";
      }
    }

    return time || "Không xác định";
  };

  // Component riêng cho time tag để đảm bảo render đúng
  const TimeTag = ({ time, index, requestId }) => {
    const label = getTimeOfDayLabel(time);
    console.log(
      `🏷️ TimeTag render - Request ${requestId} - Time: ${time} → Label: ${label}`
    );
    return (
      <span
        className="fix-time-tag"
        key={`time-${time}-${index}`}
        style={{
          background: "var(--fix-primary-color)",
          color: "white",
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "500",
          display: "inline-block",
        }}
        title={`Debug: Req ${requestId} - ${time} → ${label}`}
      >
        {label}
      </span>
    );
  };

  // Helper function để format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Không xác định";
    try {
      let date;

      // Handle array format from backend [year, month, day, hour, minute, second]
      if (Array.isArray(timestamp)) {
        if (timestamp.length >= 3) {
          // Month is 0-indexed in JavaScript Date constructor
          const year = timestamp[0];
          const month = timestamp[1] - 1; // Convert to 0-indexed
          const day = timestamp[2];
          const hour = timestamp[3] || 0;
          const minute = timestamp[4] || 0;
          const second = timestamp[5] || 0;

          date = new Date(year, month, day, hour, minute, second);
        } else {
          return "Không xác định";
        }
      }
      // Handle string format
      else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      }
      // Handle Date object
      else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Không xác định";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Không xác định";
      }

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Không xác định";
    }
  };

  // Function để lọc history theo student
  const getFilteredHistory = () => {
    if (!selectedStudentFilter) return medicationHistory;
    return medicationHistory.filter(
      (request) => request.studentId?.toString() === selectedStudentFilter
    );
  };

  // Function để xóa request
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("error", "Lỗi xác thực", "Vui lòng đăng nhập lại");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/parent-medication-requests/cancel-request/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa yêu cầu");
      }

      showNotification("success", "Xóa thành công", "Yêu cầu đã được xóa");
      fetchMedicationHistory();
    } catch (error) {
      console.error("Error deleting request:", error);
      showNotification(
        "error",
        "Lỗi",
        "Không thể xóa yêu cầu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicationHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const medicationHistory =
        await medicationRequestService.fetchMedicationHistory();
      console.log("📋 Medication History Data:", medicationHistory);
      if (medicationHistory && medicationHistory.length > 0) {
        console.log("📋 First item timeOfDay:", medicationHistory[0].timeOfDay);
        console.log(
          "📋 First item responseDate:",
          medicationHistory[0].responseDate
        );
      }
      setMedicationHistory(medicationHistory || []);
    } catch (error) {
      setHistoryError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải lịch sử yêu cầu thuốc"
      );
      console.error("Error fetching medication history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // useEffect để fetch history khi chuyển tab
  useEffect(() => {
    if (activeTab === "history") {
      fetchMedicationHistory();
    }
  }, [activeTab]);

  const refreshData = () => {
    if (activeTab === "history") fetchMedicationHistory();
    if (activeTab === "form") {
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
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "frequency") {
      if (value && !/^[0-9]+$/.test(value)) {
        setErrors({
          ...errors,
          frequency:
            "Tần suất chỉ được nhập số, không chứa chữ hay ký tự đặc biệt",
        });
        return;
      }
    }
    if (name === "dosage") {
      if (
        value &&
        !/^[0-9\s\.\,mlviêngiọttablettabletsmlmgmcgviênggamicrogram]+$/i.test(
          value
        )
      ) {
        setErrors({
          ...errors,
          dosage:
            "Liều lượng chỉ được chứa số và đơn vị như: ml, viên, giọt, mg",
        });
        return;
      }
    }
    if (name === "startDate") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setErrors({
          ...errors,
          startDate: "Ngày bắt đầu phải là từ hôm nay trở đi",
        });
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleTimeChange = (e) => {
    const { value, checked } = e.target;
    setFormData({
      ...formData,
      timeToTake: checked
        ? [...formData.timeToTake, value]
        : formData.timeToTake.filter((t) => t !== value),
    });
    if (errors.timeToTake) setErrors({ ...errors, timeToTake: null });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setTempImageUpload({
          ...tempImageUpload,
          uploadError: "File không được vượt quá 5MB",
        });
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setTempImageUpload({
          ...tempImageUpload,
          uploadError: "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)",
        });
        return;
      }
      setTempImageUpload({ ...tempImageUpload, uploadError: null });
      const reader = new FileReader();
      reader.onloadend = () =>
        setTempImageUpload((prev) => ({
          ...prev,
          file,
          preview: reader.result,
        }));
      reader.readAsDataURL(file);
      if (errors.prescriptionImage)
        setErrors({ ...errors, prescriptionImage: null });
    }
  };

  const uploadImageTemporary = async () => {
    if (!tempImageUpload.file) {
      setTempImageUpload({
        ...tempImageUpload,
        uploadError: "Vui lòng chọn file ảnh trước",
      });
      return;
    }
    console.log(
      "⚡ Image file prepared for upload:",
      tempImageUpload.file.name
    );
    setTempImageUpload((prev) => ({
      ...prev,
      isUploading: false,
      uploadError: null,
    }));
    showNotification(
      "success",
      "Ảnh đã sẵn sàng!",
      "Ảnh sẽ được upload khi bạn gửi yêu cầu thuốc."
    );
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
    if (formData.timeToTake.length === 0)
      newErrors.timeToTake = "Vui lòng chọn thời gian uống thuốc";
    console.log("Form validation result:", {
      hasErrors: Object.keys(newErrors).length > 0,
      errors: newErrors,
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Form submit started...");
    if (!validateForm()) {
      console.log("❌ Validation failed");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ No auth token");
        showNotification("error", "Lỗi xác thực", "Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }
      const requestData = {
        studentId: parseInt(formData.studentId),
        medicineName: formData.medicineName,
        dosage: formData.dosage,
        frequency: parseInt(formData.frequency),
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeToTake: formData.timeToTake,
        notes: formData.notes || "",
        prescriptionImageBase64: null,
      };
      console.log("Posting request:", requestData);
      const apiUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/parent-medication-requests/submit-request`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      console.log("📨 Status:", response.status);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }
      const resData = await response.json();
      let requestId = resData.data?.id || resData.id;
      if (!requestId) throw new Error("Không thể lấy ID của yêu cầu vừa tạo");
      if (tempImageUpload.file) {
        console.log("Uploading image for:", requestId);
        const uploadFormData = new FormData();
        uploadFormData.append("image", tempImageUpload.file);
        const uploadUrl = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/parent-medication-requests/${requestId}/upload-confirmation-image`;
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData,
        });
        if (!uploadRes.ok) console.warn("⚠️ Image upload failed");
      }
      if (activeTab === "history") fetchMedicationHistory();
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
      setTempImageUpload({
        file: null,
        preview: null,
        uploadedImageBase64: null,
        isUploading: false,
        uploadError: null,
        tempRequestId: null,
      });
      showNotification(
        "success",
        "Gửi yêu cầu thành công!",
        tempImageUpload.file
          ? "Yêu cầu dùng thuốc và ảnh đã được gửi thành công."
          : "Yêu cầu dùng thuốc đã được gửi thành công."
      );
    } catch (error) {
      console.error("Submit error:", error);
      const msg =
        error.message || error.response?.data?.message || "Có lỗi xảy ra";
      showNotification("error", "Gửi yêu cầu thất bại!", msg);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of handlers unchanged ...

  // Add handler for updating requests
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateRequest = (requestId) => {
    const requestToUpdate = medicationHistory.find((r) => r.id === requestId);
    if (!requestToUpdate) {
      showNotification("error", "Lỗi", "Không tìm thấy yêu cầu thuốc!");
      return;
    }
    if (requestToUpdate.status !== "PENDING_APPROVAL") {
      showNotification(
        "error",
        "Không thể cập nhật",
        "Chỉ có thể cập nhật các yêu cầu đang chờ duyệt"
      );
      return;
    }
    setEditFormData({
      id: requestToUpdate.id,
      medicationName: requestToUpdate.medicationName || "",
      dosageInstructions: requestToUpdate.dosageInstructions || "",
      frequencyPerDay: requestToUpdate.frequencyPerDay || "",
      startDate: requestToUpdate.startDate?.substring(0, 10) || "",
      endDate: requestToUpdate.endDate?.substring(0, 10) || "",
      timeToTake: [],
      specialInstructions: "",
      submittedAt: requestToUpdate.submittedAt,
      healthProfileId: requestToUpdate.healthProfileId,
      studentName: requestToUpdate.studentName,
      requestedBy: requestToUpdate.requestedBy,
      requestedByAccountId: requestToUpdate.requestedByAccountId,
      parentProvided: requestToUpdate.parentProvided,
      studentClass: requestToUpdate.studentClass,
      studentId: requestToUpdate.studentId,
      prescriptionImage: null,
      prescriptionImageUrl: requestToUpdate.prescriptionImageUrl || null,
    });

    setModalPrescriptionImage(null);
    console.log("Request to update:", requestToUpdate);

    if (
      requestToUpdate.prescriptionImageUrl &&
      requestToUpdate.prescriptionImageUrl.trim() !== ""
    ) {
      let imageUrl = requestToUpdate.prescriptionImageUrl;
      // If it's a relative path, make it absolute
      if (!imageUrl.startsWith("http")) {
        imageUrl = `${import.meta.env.VITE_BACKEND_URL}${
          imageUrl.startsWith("/") ? "" : "/"
        }${imageUrl}`;
      }
      setModalImagePreview(imageUrl);
      console.log("Set modal image preview to:", imageUrl);
    } else {
      setModalImagePreview(null);
      console.log("No prescription image URL found");
    }

    setIsModalOpen(true);
  };

  // Function to fetch confirmation data
  const fetchConfirmationData = async (requestId) => {
    setConfirmationLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("error", "Lỗi xác thực", "Vui lòng đăng nhập lại");
        setConfirmationLoading(false);
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/medication-administrations/all/medication-instruction/${requestId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Confirmation API Response:", responseData);

      if (
        responseData.status === "success" &&
        responseData.data &&
        responseData.data.length > 0
      ) {
        setConfirmationList(responseData.data);
        setCurrentConfirmationIndex(0);
        setConfirmationData(responseData.data[0]);
        setIsConfirmationModalOpen(true);
      } else {
        showNotification(
          "error",
          "Không có dữ liệu",
          "Không tìm thấy thông tin xác nhận cho yêu cầu này."
        );
      }
    } catch (error) {
      console.error("Error fetching confirmation data:", error);
      let errorMessage = "Không thể tải thông tin xác nhận. Vui lòng thử lại.";
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "Không tìm thấy thông tin xác nhận cho yêu cầu này.";
            break;
          case 403:
            errorMessage = "Bạn không có quyền xem thông tin này.";
            break;
          case 500:
            errorMessage = "Lỗi server. Vui lòng thử lại sau.";
            break;
          default:
            errorMessage =
              error.response.data?.message || error.message || errorMessage;
        }
      }
      showNotification("error", "Lỗi tải thông tin", errorMessage);
    } finally {
      setConfirmationLoading(false);
    }
  };
  // Functions cho pagination trong confirmation modal
  const goToNextConfirmation = () => {
    if (currentConfirmationIndex < confirmationList.length - 1) {
      const nextIndex = currentConfirmationIndex + 1;
      setCurrentConfirmationIndex(nextIndex);
      setConfirmationData(confirmationList[nextIndex]);
    }
  };

  const goToPreviousConfirmation = () => {
    if (currentConfirmationIndex > 0) {
      const prevIndex = currentConfirmationIndex - 1;
      setCurrentConfirmationIndex(prevIndex);
      setConfirmationData(confirmationList[prevIndex]);
    }
  };

  const goToConfirmationPage = (index) => {
    if (index >= 0 && index < confirmationList.length) {
      setCurrentConfirmationIndex(index);
      setConfirmationData(confirmationList[index]);
    }
  };

  // Keyboard navigation for confirmation modal
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isConfirmationModalOpen && confirmationList.length >= 1) {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            goToPreviousConfirmation();
            break;
          case "ArrowRight":
            event.preventDefault();
            goToNextConfirmation();
            break;
          case "Home":
            event.preventDefault();
            goToConfirmationPage(0);
            break;
          case "End":
            event.preventDefault();
            goToConfirmationPage(confirmationList.length - 1);
            break;
          default:
            // Check for number keys (1-9)
            const num = parseInt(event.key);
            if (!isNaN(num) && num >= 1 && num <= confirmationList.length) {
              event.preventDefault();
              goToConfirmationPage(num - 1);
            }
            break;
        }
      }
    };

    if (isConfirmationModalOpen) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [
    isConfirmationModalOpen,
    confirmationList.length,
    currentConfirmationIndex,
    goToPreviousConfirmation,
    goToNextConfirmation,
    goToConfirmationPage,
  ]);

  // Function để format timestamp cho confirmation
  const formatConfirmationTimestamp = (timestamp) => {
    console.log("formatConfirmationTimestamp input:", timestamp);

    if (!timestamp) return "Không có thông tin";

    try {
      let date;

      // Kiểm tra nếu timestamp là mảng Java LocalDateTime
      if (Array.isArray(timestamp)) {
        console.log("Processing array timestamp:", timestamp);

        if (timestamp.length >= 5) {
          const [year, month, day, hour = 0, minute = 0, second = 0] =
            timestamp;
          // Java month là 1-based, JavaScript month là 0-based
          date = new Date(year, month - 1, day, hour, minute, second);
          console.log("Created date from array:", date);
        } else {
          console.log("Array too short:", timestamp.length);
          return "Dữ liệu không hợp lệ";
        }
      } else {
        // Xử lý timestamp dạng string hoặc number
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) {
        console.log("Invalid date created:", date);
        return "Thời gian không hợp lệ";
      }

      // Format thành dd/MM/yyyy HH:mm:ss
      const result = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      console.log("formatConfirmationTimestamp result:", result);
      return result;
    } catch (error) {
      console.error("Error in formatConfirmationTimestamp:", error);
      return "Lỗi xử lý thời gian";
    }
  };

  // Function để lấy label và class cho administration status
  const getAdministrationStatusInfo = (status) => {
    const statusMap = {
      PENDING_APPROVAL: {
        label: "Chờ xác nhận",
        class: "pending",
      },
      APPROVED: {
        label: "Đã xác nhận",
        class: "success",
      },
      REJECTED: {
        label: "Từ chối",
        class: "refused",
      },
      FULLY_TAKEN: {
        label: "Đã uống đầy đủ",
        class: "success",
      },
      PARTIALLY_TAKEN: {
        label: "Đã uống một phần",
        class: "partial",
      },
      EXPIRED: {
        label: "Hết hạn",
        class: "refused",
      },
    };

    return (
      statusMap[status] || {
        label: status || "Không xác định",
        class: "unknown",
      }
    );
  };

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

  // Thêm handler cho modal image upload
  const handleModalImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setModalErrors({
          ...modalErrors,
          prescriptionImage: "File không được vượt quá 5MB",
        });
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setModalErrors({
          ...modalErrors,
          prescriptionImage: "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)",
        });
        return;
      }

      setModalPrescriptionImage(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm hàm kiểm tra form trước khi submit
  const validateModalForm = () => {
    const newErrors = {};

    if (!editFormData.medicationName) {
      newErrors.medicationName = "Vui lòng nhập tên thuốc";
    }

    if (!editFormData.dosageInstructions) {
      newErrors.dosageInstructions = "Vui lòng nhập liều lượng";
    }

    // Sửa lỗi xác thực frequencyPerDay
    if (
      !editFormData.frequencyPerDay ||
      isNaN(Number(editFormData.frequencyPerDay)) ||
      Number(editFormData.frequencyPerDay) < 1
    ) {
      newErrors.frequencyPerDay = "Vui lòng nhập số lần dùng thuốc hợp lệ";
    }

    if (!editFormData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    }

    if (!editFormData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    }

    if (editFormData.timeToTake.length === 0) {
      newErrors.timeToTake = "Vui lòng chọn thời điểm uống thuốc";
    }

    setModalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateModalForm()) {
      showNotification(
        "error",
        "Thông tin không hợp lệ",
        "Vui lòng điền đầy đủ thông tin"
      );
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu để gửi
      const formData = new FormData();
      formData.append("medicationName", editFormData.medicationName);
      formData.append("dosageInstructions", editFormData.dosageInstructions);
      // Sửa lỗi xử lý frequencyPerDay
      formData.append(
        "frequencyPerDay",
        editFormData.frequencyPerDay.toString()
      );
      formData.append("startDate", formatDateForAPI(editFormData.startDate));
      formData.append("endDate", formatDateForAPI(editFormData.endDate));
      formData.append("timeToTake", JSON.stringify(editFormData.timeToTake));
      formData.append(
        "specialInstructions",
        editFormData.specialInstructions || ""
      );

      // Thêm hình ảnh nếu có
      if (modalPrescriptionImage) {
        formData.append("prescriptionImage", modalPrescriptionImage);
      }

      // Lấy token xác thực
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification(
          "error",
          "Lỗi xác thực",
          "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"
        );
        setLoading(false);
        return;
      }

      // Xử lý hình ảnh nếu có
      let imageBase64 = null;
      if (modalPrescriptionImage) {
        imageBase64 = await medicationRequestService.convertImageToBase64(
          modalPrescriptionImage
        );
      }

      // Chuẩn bị dữ liệu theo định dạng JSON yêu cầu bởi API
      const updateData = {
        // Thông tin học sinh
        studentId: parseInt(
          editFormData.studentId || editFormData.healthProfileId
        ),

        // Thông tin thuốc - sử dụng đúng tên trường theo yêu cầu
        medicineName: editFormData.medicationName.trim(),
        dosage: editFormData.dosageInstructions.trim(),
        frequency: parseInt(editFormData.frequencyPerDay) || 1,

        // Thời gian dùng thuốc
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        timeToTake: editFormData.timeToTake, // Mảng thời gian uống thuốc

        // Ghi chú bổ sung
        notes: editFormData.specialInstructions?.trim() || "",

        // Hình ảnh đơn thuốc nếu có
        prescriptionImageBase64: imageBase64,
      };

      // Sử dụng service để cập nhật yêu cầu
      await medicationRequestService.updateMedicationRequest(
        editFormData.id,
        updateData
      );

      // Show success notification modal
      showNotification(
        "success",
        "Cập nhật thành công!",
        "Yêu cầu gửi thuốc đã được cập nhật thành công."
      );
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
      if (typeof error.response?.data === "string") {
        errorMessage = error.response.data;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage =
          "Không thể cập nhật yêu cầu thuốc. Vui lòng thử lại sau.";
      }

      // Show error notification modal
      showNotification("error", "Cập nhật thất bại!", errorMessage);
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

  // Remove all scroll effects to prevent conflicts with layout
  // Layout will handle scroll positioning automatically

  // State for image zoom functionality
  const [zoomedImage, setZoomedImage] = useState(null);

  // Hide header when modals are open - Added after all state declarations
  useEffect(() => {
    const shouldHideHeader =
      isModalOpen ||
      isConfirmationModalOpen ||
      notificationModal.show ||
      zoomedImage;

    if (shouldHideHeader) {
      document.body.classList.add("modal-open");
      // Try multiple selectors to hide header
      const headers = document.querySelectorAll(
        ".parent-header, .fix-parent-header, header"
      );
      headers.forEach((header) => {
        header.style.zIndex = "-999999";
        header.style.visibility = "hidden";
        header.style.opacity = "0";
      });
    } else {
      document.body.classList.remove("modal-open");
      // Restore header visibility
      const headers = document.querySelectorAll(
        ".parent-header, .fix-parent-header, header"
      );
      headers.forEach((header) => {
        header.style.zIndex = "";
        header.style.visibility = "";
        header.style.opacity = "";
      });
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("modal-open");
      const headers = document.querySelectorAll(
        ".parent-header, .fix-parent-header, header"
      );
      headers.forEach((header) => {
        header.style.zIndex = "";
        header.style.visibility = "";
        header.style.opacity = "";
      });
    };
  }, [
    isModalOpen,
    isConfirmationModalOpen,
    notificationModal.show,
    zoomedImage,
  ]);

  // Function to handle image click for zooming
  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  // Function to close the zoomed image
  const handleCloseZoom = () => {
    setZoomedImage(null);
  };

  return (
    <div className="parent-content-wrapper">
      <div className="fix-send-medicine-container">
        {/* Loading spinner */}
        {loading && (
          <div className="send-medicine-loading">
            <div className="loading-spinner"></div>
            <p>Đang xử lý...</p>
          </div>
        )}

        {/* Removed ToastContainer - using notification modal instead */}

        {/* Header */}
        <div className="fix-send-medicine-header">
          <div className="header-content">
            <h1>
              <i className="fas fa-pills"></i>
              Yêu cầu gửi thuốc
            </h1>
            <p>Gửi yêu cầu cho y tá trường để hỗ trợ uống thuốc cho học sinh</p>
            <button
              onClick={refreshData}
              className="refresh-btn"
              title="Tải lại dữ liệu"
              disabled={loading || isHistoryLoading}
            >
              <i
                className={`fas fa-sync-alt ${
                  loading || isHistoryLoading ? "fa-spin" : ""
                }`}
              ></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="fix-tab-navigation">
          <button
            className={`fix-tab-button ${activeTab === "form" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("form");
            }}
          >
            Gửi yêu cầu thuốc
          </button>
          <button
            className={`fix-tab-button ${
              activeTab === "history" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("history");
            }}
          >
            Lịch sử yêu cầu
          </button>
        </div>

        {activeTab === "form" ? (
          // Form gửi thuốc
          formSubmitted ? (
            <div className="fix-form-container">
              {" "}
              {/* Thêm container này để kiểm soát chiều rộng */}
              <div className="fix-success-message">
                <div className="fix-success-icon"></div>
                <h2>Gửi yêu cầu thành công!</h2>
                <p>
                  Yêu cầu của bạn đã được ghi nhận. Nhà trường sẽ liên hệ nếu
                  cần thêm thông tin.
                </p>
                <div className="fix-success-actions">
                  <button
                    className="fix-btn-primary"
                    onClick={() => {
                      setFormSubmitted(false);
                    }}
                  >
                    Gửi yêu cầu mới
                  </button>
                  <button
                    className="fix-btn-secondary"
                    onClick={() => {
                      setActiveTab("history");
                      fetchMedicationHistory();
                    }}
                  >
                    Xem lịch sử yêu cầu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form className="fix-send-medicine-form" onSubmit={handleSubmit}>
              <div className="fix-form-section">
                <h3>Thông tin học sinh</h3>
                <div className="fix-form-group-horizontal">
                  <label htmlFor="studentId">Chọn học sinh:</label>
                  <div>
                    <select
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className={`selectstudentfix ${
                        errors.studentId ? "error" : ""
                      }`}
                    >
                      <option value="">-- Chọn học sinh --</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} - Lớp {student.class}
                        </option>
                      ))}
                    </select>
                    {errors.studentId && (
                      <span className="fix-error-text">{errors.studentId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="fix-form-section">
                <h3>Thông tin thuốc</h3>
                <div className="fix-form-group-horizontal">
                  <label htmlFor="medicineName">Tên thuốc:</label>
                  <div>
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
                      <span className="fix-error-text">
                        {errors.medicineName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="fix-form-group-horizontal">
                  <label htmlFor="dosage">Liều lượng:</label>
                  <div>
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
                      <span className="fix-error-text">{errors.dosage}</span>
                    )}
                  </div>
                </div>

                <div className="fix-form-group-horizontal">
                  <label htmlFor="frequency">Tần suất:</label>
                  <div>
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
                      <span className="fix-error-text">{errors.frequency}</span>
                    )}
                  </div>
                </div>

                <div className="fix-form-row chonngayguithuoc">
                  <div className="fix-form-group">
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
                      <span className="fix-error-text">{errors.startDate}</span>
                    )}
                  </div>

                  <div className="fix-form-group">
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
                      <span className="fix-error-text">{errors.endDate}</span>
                    )}
                  </div>
                </div>

                <div className="fix-form-group-horizontal">
                  <label>Thời điểm uống thuốc:</label>
                  <div>
                    <div className="fix-checkbox-group-two-columns">
                      {timeOptions
                        .filter((option) => option.value !== "bedtime")
                        .map((option) => (
                          <div className="fix-checkbox-item" key={option.value}>
                            <input
                              type="checkbox"
                              id={option.value}
                              name="timeToTake"
                              value={option.value}
                              checked={formData.timeToTake.includes(
                                option.value
                              )}
                              onChange={handleTimeChange}
                            />
                            <label htmlFor={option.value}>{option.label}</label>
                          </div>
                        ))}
                    </div>
                    {errors.timeToTake && (
                      <span className="fix-error-text">
                        {errors.timeToTake}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="fix-form-section">
                <h3>Thông tin bổ sung</h3>
                {/* Thêm trường hình ảnh đơn thuốc với upload riêng biệt */}
                <div className="fix-form-group">
                  <label htmlFor="prescriptionImage">Hình ảnh đơn thuốc:</label>
                  <div className="fix-help-text">
                    📋 Bước 1: Chọn ảnh → Bước 2: Nhấn "Tải ảnh lên" → Bước 3:
                    Điền form và gửi yêu cầu
                  </div>
                  <div className="fix-image-upload-container">
                    <input
                      type="file"
                      id="prescriptionImage"
                      name="prescriptionImage"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageChange}
                      className="fix-image-input"
                      disabled={tempImageUpload.isUploading}
                    />
                    <label
                      htmlFor="prescriptionImage"
                      className={`fix-upload-button ${
                        tempImageUpload.isUploading ? "disabled" : ""
                      }`}
                    >
                      {tempImageUpload.isUploading ? "Đang tải..." : "Chọn ảnh"}
                    </label>

                    {/* Show selected file name */}
                    {tempImageUpload.file && (
                      <span className="fix-file-name">
                        {tempImageUpload.file.name}
                      </span>
                    )}

                    {/* Upload button - only show when file is selected and not uploaded yet */}
                    {tempImageUpload.file &&
                      !tempImageUpload.uploadedImageBase64 &&
                      !tempImageUpload.isUploading && (
                        <button
                          type="button"
                          onClick={uploadImageTemporary}
                          className="fix-upload-image-btn"
                          disabled={tempImageUpload.isUploading}
                        >
                          Tải ảnh lên
                        </button>
                      )}

                    {/* Loading indicator */}
                    {tempImageUpload.isUploading && (
                      <div className="fix-upload-loading">
                        <span>Đang tải ảnh lên...</span>
                      </div>
                    )}

                    {/* Success indicator */}
                    {tempImageUpload.uploadedImageBase64 && (
                      <div className="fix-upload-success">
                        <span>✓ Ảnh đã được tải lên thành công</span>
                      </div>
                    )}

                    {/* Error display */}
                    {(tempImageUpload.uploadError ||
                      errors.prescriptionImage) && (
                      <div className="fix-error-text">
                        {tempImageUpload.uploadError ||
                          errors.prescriptionImage}
                      </div>
                    )}

                    {/* Image preview */}
                    {tempImageUpload.preview && (
                      <div className="fix-image-preview-container">
                        <img
                          src={tempImageUpload.preview}
                          alt="Đơn thuốc"
                          className="fix-image-preview"
                          onClick={() =>
                            handleImageClick(tempImageUpload.preview)
                          }
                        />
                      </div>
                    )}
                  </div>
                  <span className="fix-help-text">
                    Tối đa 5MB. Định dạng: JPG, PNG.
                  </span>
                </div>

                <div className="fix-form-row-large">
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

              <div className="fix-form-actions">
                <button
                  type="button"
                  className="fix-btn-secondary"
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
                  className="fix-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="fix-spinner"></span>
                  ) : (
                    "Gửi yêu cầu"
                  )}
                </button>
              </div>
            </form>
          )
        ) : (
          // Tab lịch sử
          <div className="fix-medication-history-container">
            <div className="fix-history-header">
              <h2>Lịch sử yêu cầu dùng thuốc</h2>

              {students && students.length > 0 && (
                <div className="fix-history-filter">
                  <label htmlFor="studentFilter">Lọc theo học sinh:</label>
                  <select
                    id="studentFilter"
                    className="selectstudentfix"
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
              <div className="error-message">{historyError}</div>
            )}

            {isHistoryLoading ? (
              <div className="fix-loading-container">
                <div className="fix-spinner"></div>
                <p>Đang tải lịch sử yêu cầu...</p>
              </div>
            ) : medicationHistory.length === 0 ? (
              <div className="fix-empty-history">
                <p>Bạn chưa có yêu cầu dùng thuốc nào</p>
                <button
                  className="fix-btn-primary"
                  onClick={() => setActiveTab("form")}
                >
                  Tạo yêu cầu mới
                </button>
              </div>
            ) : (
              <div className="fix-medication-request-list">
                {getFilteredHistory().map((request) => (
                  <div className="fix-medication-request-card" key={request.id}>
                    <div className="fix-med-request-header">
                      <div className="fix-med-request-title">
                        <h3>{request.medicationName}</h3>
                        <p className="fix-med-request-student">
                          {request.studentName} - Lớp {request.studentClass}
                        </p>
                        <p className="fix-med-request-date">
                          Ngày yêu cầu: {formatDate(request.submittedAt)}
                        </p>
                      </div>
                      <div className="fix-med-request-actions">
                        {request.status === "PENDING_APPROVAL" && (
                          <>
                            <button
                              className="fix-med-btn fix-med-btn-primary"
                              onClick={() => handleUpdateRequest(request.id)}
                            >
                              Cập nhật
                            </button>
                            <button
                              className="fix-med-btn fix-med-btn-danger"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
                              Xóa
                            </button>
                          </>
                        )}
                        {(request.status === "APPROVED" ||
                          request.status === "FULLY_TAKEN" ||
                          request.status === "PARTIALLY_TAKEN") && (
                          <button
                            className="fix-med-btn fix-med-btn-success"
                            onClick={() => fetchConfirmationData(request.id)}
                            disabled={confirmationLoading}
                          >
                            {confirmationLoading
                              ? "Đang tải..."
                              : "Xem xác nhận"}
                          </button>
                        )}
                        <div
                          className={`fix-med-status fix-med-status-${request.status
                            .toLowerCase()
                            .replace("_", "-")}`}
                        >
                          {getStatusLabel(request.status)}
                        </div>
                      </div>
                    </div>

                    <div className="fix-request-details">
                      <div className="fix-med-info-container">
                        <div className="fix-med-info-row">
                          <div className="fix-med-info-item">
                            <span className="fix-med-info-label">
                              Liều lượng:
                            </span>
                            <div className="med-info-value">
                              {request.dosageInstructions}
                            </div>
                          </div>

                          <div className="fix-med-info-item">
                            <span className="fix-med-info-label">
                              Tần suất:
                            </span>
                            <div className="med-info-value">
                              <strong>
                                {request.frequencyPerDay} lần/ngày
                              </strong>
                              <div className="med-date-range">
                                <span>
                                  {formatDate(request.startDate)} -{" "}
                                  {formatDate(request.endDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="fix-med-info-row">
                          <div className="fix-med-info-full">
                            <span className="fix-med-info-label">
                              Thời điểm uống:
                            </span>
                            <div className="fix-time-tags">
                              {(() => {
                                console.log(
                                  `🔍 Request ID: ${request.id} - Raw timeOfDay:`,
                                  request.timeOfDay
                                );
                                const parsedTimes = parseTimeOfDay(
                                  request.timeOfDay
                                );
                                console.log(
                                  `🔍 Request ID: ${request.id} - Parsed times:`,
                                  parsedTimes
                                );
                                return parsedTimes.map((time, index) => {
                                  console.log(
                                    `🎯 About to render TimeTag for: ${time}`
                                  );
                                  const label = getTimeOfDayLabel(time);
                                  console.log(
                                    `🏷️ INLINE render - Request ${request.id} - Time: ${time} → Label: ${label}`
                                  );
                                  return (
                                    <span
                                      key={`req-${request.id}-time-${time}-${index}`}
                                      className="fix-time-tag"
                                      style={{
                                        background: "var(--fix-primary-color)",
                                        color: "white",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        fontSize: "0.75rem",
                                        fontWeight: "500",
                                        display: "inline-block",
                                      }}
                                      title={`Debug: Req ${request.id} - ${time} → ${label}`}
                                    >
                                      {label}
                                    </span>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        {request.specialInstructions && (
                          <div className="fix-med-info-row">
                            <div className="fix-med-info-full">
                              <span className="fix-med-info-label">
                                Hướng dẫn đặc biệt:
                              </span>
                              <div className="fix-med-info-note">
                                {request.specialInstructions}
                              </div>
                            </div>
                          </div>
                        )}

                        {request.status === "REJECTED" &&
                          request.rejectionReason && (
                            <div className="rejection-reason">
                              <span className="detail-label">
                                Lý do từ chối:
                              </span>
                              <span className="detail-value">
                                {request.rejectionReason}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {request.approvedBy && (
                      <div className="request-footer">
                        <div className="approval-info">
                          <span>Duyệt bởi: {request.approvedBy}</span>
                          {request.responseDate && (
                            <span>
                              Ngày phản hồi:{" "}
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
          <div className="fix-med-modal-overlay">
            <div className="fix-med-modal">
              <div className="fix-med-modal-header">
                <h3>Cập nhật yêu cầu thuốc</h3>
                <button
                  className="fix-med-modal-close"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 6L18 18M6 18L18 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="fix-med-modal-content">
                <form onSubmit={handleModalFormSubmit}>
                  {/* Student info */}
                  <div className="fix-form-group">
                    <label htmlFor="modal-studentId">Học sinh:</label>
                    <input
                      type="text"
                      id="modal-studentName"
                      value={`${editFormData.studentName || ""} - Lớp ${
                        editFormData.studentClass || ""
                      }`}
                      disabled
                    />
                  </div>

                  {/* Medicine info */}
                  <div className="fix-form-group">
                    <label htmlFor="modal-medicationName">Tên thuốc:</label>
                    <input
                      type="text"
                      id="modal-medicationName"
                      name="medicationName"
                      value={editFormData.medicationName || ""}
                      onChange={handleModalInputChange}
                      placeholder="Nhập tên thuốc"
                      className={modalErrors.medicationName ? "error" : ""}
                      required
                    />
                    {modalErrors.medicationName && (
                      <span className="fix-error-text">
                        {modalErrors.medicationName}
                      </span>
                    )}
                  </div>

                  {/* Form rows for better layout */}
                  <div className="fix-form-row">
                    <div className="fix-form-group">
                      <label htmlFor="modal-dosageInstructions">
                        Liều lượng:
                      </label>
                      <input
                        type="text"
                        id="modal-dosageInstructions"
                        name="dosageInstructions"
                        value={editFormData.dosageInstructions || ""}
                        onChange={handleModalInputChange}
                        placeholder="Ví dụ: 1 viên mỗi lần"
                        className={
                          modalErrors.dosageInstructions ? "error" : ""
                        }
                        required
                      />
                      {modalErrors.dosageInstructions && (
                        <span className="fix-error-text">
                          {modalErrors.dosageInstructions}
                        </span>
                      )}
                    </div>

                    <div className="fix-form-group">
                      <label htmlFor="modal-frequencyPerDay">
                        Số lần dùng mỗi ngày:
                      </label>
                      <input
                        type="number"
                        id="modal-frequencyPerDay"
                        name="frequencyPerDay"
                        value={editFormData.frequencyPerDay || ""}
                        onChange={handleModalInputChange}
                        min="1"
                        max="10"
                        placeholder="Số lần dùng thuốc trong ngày"
                        className={modalErrors.frequencyPerDay ? "error" : ""}
                        required
                      />
                      {modalErrors.frequencyPerDay && (
                        <span className="fix-error-text">
                          {modalErrors.frequencyPerDay}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="fix-form-row">
                    <div className="fix-form-group">
                      <label htmlFor="modal-startDate">Ngày bắt đầu:</label>
                      <input
                        type="date"
                        id="modal-startDate"
                        name="startDate"
                        value={editFormData.startDate || ""}
                        onChange={handleModalInputChange}
                        className={modalErrors.startDate ? "error" : ""}
                        required
                      />
                      {modalErrors.startDate && (
                        <span className="fix-error-text">
                          {modalErrors.startDate}
                        </span>
                      )}
                    </div>

                    <div className="fix-form-group">
                      <label htmlFor="modal-endDate">Ngày kết thúc:</label>
                      <input
                        type="date"
                        id="modal-endDate"
                        name="endDate"
                        value={editFormData.endDate || ""}
                        onChange={handleModalInputChange}
                        className={modalErrors.endDate ? "error" : ""}
                        required
                      />
                      {modalErrors.endDate && (
                        <span className="fix-error-text">
                          {modalErrors.endDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="fix-form-group">
                    <label htmlFor="time-options">Thời gian uống thuốc:</label>
                    <div className="fix-checkbox-group">
                      {timeOptions.map((option) => (
                        <div className="fix-checkbox-item" key={option.value}>
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
                    {editFormData.timeToTake.length === 0 && (
                      <span className="fix-error-text">
                        Vui lòng chọn ít nhất một thời điểm uống thuốc
                      </span>
                    )}
                  </div>

                  <div className="fix-form-group">
                    <label htmlFor="modal-specialInstructions">
                      Hướng dẫn đặc biệt:
                    </label>
                    <textarea
                      id="modal-specialInstructions"
                      name="specialInstructions"
                      value={editFormData.specialInstructions || ""}
                      onChange={handleModalInputChange}
                      placeholder="Nhập hướng dẫn đặc biệt (nếu có)"
                      rows="3"
                    ></textarea>
                  </div>

                  {/* Image Upload Section */}
                  <div className="fix-form-group">
                    <label htmlFor="modal-prescriptionImage">
                      Hình ảnh đơn thuốc:
                    </label>
                    <div className="fix-image-upload-container">
                      {/* Show existing image info if available */}
                      {editFormData.prescriptionImageUrl &&
                        !modalPrescriptionImage && (
                          <div className="fix-existing-image-info">
                            <p className="fix-existing-image-label">
                              <strong>Hình ảnh hiện tại:</strong>
                            </p>
                            <div className="fix-existing-image-preview">
                              <img
                                src={modalImagePreview}
                                alt="Đơn thuốc hiện tại"
                                className="fix-image-preview"
                                onClick={() =>
                                  handleImageClick(modalImagePreview)
                                }
                              />
                              <p className="fix-image-note">
                                Nhấn vào hình để xem chi tiết
                              </p>
                            </div>
                          </div>
                        )}

                      <input
                        type="file"
                        id="modal-prescriptionImage"
                        name="prescriptionImage"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleModalImageChange}
                        className="fix-image-input"
                      />
                      <label
                        htmlFor="modal-prescriptionImage"
                        className="fix-upload-button"
                      >
                        {editFormData.prescriptionImageUrl
                          ? "Thay đổi hình ảnh"
                          : "Chọn ảnh"}
                      </label>

                      {modalPrescriptionImage && (
                        <span className="fix-file-name">
                          <strong>Hình mới:</strong>{" "}
                          {modalPrescriptionImage.name}
                        </span>
                      )}

                      <span className="fix-help-text">
                        {editFormData.prescriptionImageUrl
                          ? "Chọn hình ảnh mới để thay thế hình hiện tại. Tối đa 5MB. Định dạng: JPG, PNG."
                          : "Tối đa 5MB. Định dạng: JPG, PNG."}
                      </span>

                      {/* Show new image preview if selected */}
                      {modalPrescriptionImage && modalImagePreview && (
                        <div className="fix-new-image-preview">
                          <p className="fix-new-image-label">
                            <strong>Hình ảnh mới:</strong>
                          </p>
                          <div className="fix-image-preview-container">
                            <img
                              src={modalImagePreview}
                              alt="Đơn thuốc mới"
                              className="fix-image-preview"
                              onClick={() =>
                                handleImageClick(modalImagePreview)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="fix-form-actions">
                    <button
                      type="button"
                      className="fix-btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="fix-btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Updated with pagination */}
        {isConfirmationModalOpen && confirmationData && (
          <div className="fix-med-modal-overlay">
            <div className="fix-med-modal">
              <div className="fix-med-modal-header">
                <h3>
                  Thông tin xác nhận cho thuốc
                  {confirmationList.length > 1 && (
                    <span className="confirmation-pagination-info">
                      (Trang {currentConfirmationIndex + 1}/
                      {confirmationList.length})
                    </span>
                  )}
                </h3>
                {confirmationList.length > 1 && (
                  <div className="confirmation-header-info">
                    <small>
                      Tìm thấy {confirmationList.length} lần xác nhận • Dùng
                      phím ← → hoặc số 1-{confirmationList.length} để chuyển
                      trang
                    </small>
                  </div>
                )}
                <button
                  className="fix-med-modal-close"
                  onClick={() => {
                    setIsConfirmationModalOpen(false);
                    setConfirmationData(null);
                    setConfirmationList([]);
                    setCurrentConfirmationIndex(0);
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 6L18 18M6 18L18 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="fix-med-modal-content">
                <div className="confirmation-details">
                  {/* Thông tin cơ bản */}
                  <div className="confirmation-section">
                    <h4>Thông tin thuốc</h4>
                    <div className="confirmation-row">
                      <div className="confirmation-item">
                        <span className="confirmation-label">Tên thuốc:</span>
                        <span className="confirmation-value">
                          {confirmationData.medicationName}
                        </span>
                      </div>
                      <div className="confirmation-item">
                        <span className="confirmation-label">Học sinh:</span>
                        <span className="confirmation-value">
                          {confirmationData.studentName}
                        </span>
                      </div>
                    </div>
                    <div className="confirmation-row">
                      <div className="confirmation-item">
                        <span className="confirmation-label">
                          Mã yêu cầu thuốc:
                        </span>
                        <span className="confirmation-value">
                          #{confirmationData.medicationInstructionId || "N/A"}
                        </span>
                      </div>
                      <div className="confirmation-item">
                        <span className="confirmation-label">Mã xác nhận:</span>
                        <span className="confirmation-value">
                          #{confirmationData.id || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="confirmation-row">
                      <div className="confirmation-item">
                        <span className="confirmation-label">
                          Số lần dùng mỗi ngày:
                        </span>
                        <span className="confirmation-value">
                          {confirmationData.frequencyPerDay || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin thực hiện */}
                  <div className="confirmation-section">
                    <h4>Thông tin thực hiện</h4>
                    <div className="confirmation-row">
                      <div className="confirmation-item">
                        <span className="confirmation-label">
                          Thời gian cho thuốc:
                        </span>
                        <span className="confirmation-value">
                          {formatConfirmationTimestamp(
                            confirmationData.administeredAt
                          )}
                        </span>
                      </div>
                      <div className="confirmation-item">
                        <span className="confirmation-label">
                          Người thực hiện:
                        </span>
                        <span className="confirmation-value">
                          {confirmationData.administeredBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trạng thái */}
                  <div className="confirmation-section">
                    <h4>Trạng thái</h4>
                    <div className="confirmation-row">
                      <div className="confirmation-item">
                        <span className="confirmation-label">
                          Trạng thái thực hiện:
                        </span>
                        <span
                          className={`confirmation-status ${
                            getAdministrationStatusInfo(
                              confirmationData.administrationStatus
                            ).class
                          }`}
                        >
                          {
                            getAdministrationStatusInfo(
                              confirmationData.administrationStatus
                            ).label
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  {confirmationData.notes && (
                    <div className="confirmation-section">
                      <h4>Ghi chú</h4>
                      <div className="confirmation-notes">
                        {confirmationData.notes}
                      </div>
                    </div>
                  )}

                  {/* Hình ảnh xác nhận */}
                  <div className="confirmation-section">
                    <h4>Hình ảnh xác nhận</h4>
                    <div className="confirmation-image">
                      {confirmationData.confirmationImageUrl ? (
                        <img
                          src={confirmationData.confirmationImageUrl}
                          alt="Hình ảnh xác nhận cho thuốc"
                          className="confirmation-img"
                          onClick={() =>
                            handleImageClick(
                              confirmationData.confirmationImageUrl
                            )
                          }
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <p>Không có hình ảnh xác nhận</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pagination controls */}
                {confirmationList.length > 1 && (
                  <div className="confirmation-pagination">
                    <div className="pagination-info">
                      <span>
                        Xác nhận {currentConfirmationIndex + 1} /{" "}
                        {confirmationList.length}
                      </span>
                    </div>

                    <div className="pagination-controls">
                      <button
                        className="pagination-btn prev-btn"
                        onClick={goToPreviousConfirmation}
                        disabled={currentConfirmationIndex === 0}
                        title="Xem xác nhận trước"
                      >
                        <i className="fas fa-chevron-left"></i>
                        Trước
                      </button>

                      <div className="pagination-pages">
                        {confirmationList.map((_, index) => (
                          <button
                            key={index}
                            className={`pagination-page ${
                              index === currentConfirmationIndex ? "active" : ""
                            }`}
                            onClick={() => goToConfirmationPage(index)}
                            title={`Xem xác nhận ${index + 1}`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        className="pagination-btn next-btn"
                        onClick={goToNextConfirmation}
                        disabled={
                          currentConfirmationIndex ===
                          confirmationList.length - 1
                        }
                        title="Xem xác nhận tiếp theo"
                      >
                        Sau
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                )}

                <div className="fix-med-modal-actions">
                  <button
                    className="fix-btn-primary"
                    onClick={() => {
                      setIsConfirmationModalOpen(false);
                      setConfirmationData(null);
                      setConfirmationList([]);
                      setCurrentConfirmationIndex(0);
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {notificationModal.show && (
          <div className="fix-notification-modal-overlay">
            <div
              className={`fix-notification-modal fix-notification-${notificationModal.type}`}
            >
              <div className="fix-notification-icon">
                {notificationModal.type === "success" ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="fix-notification-content">
                <h3>{notificationModal.title}</h3>
                <p>{notificationModal.message}</p>
              </div>
              <div className="fix-notification-progress"></div>
              <button
                className="fix-notification-close"
                onClick={() =>
                  setNotificationModal({ ...notificationModal, show: false })
                }
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Image Zoom Overlay */}
        {zoomedImage && (
          <div className="zoom-overlay" onClick={handleCloseZoom}>
            <img
              src={zoomedImage}
              alt="Hình ảnh chi tiết"
              className="zoomed-image"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="zoom-close-btn" onClick={handleCloseZoom}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L18 18M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMedicine;
