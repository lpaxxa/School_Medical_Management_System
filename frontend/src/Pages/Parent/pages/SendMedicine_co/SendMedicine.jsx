import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import only our consolidated CSS file
import "./styles/SendMedicine.css";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useAuth } from "../../../../context/AuthContext";
import medicationRequestService from "../../../../services/medicationRequestService";
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

  // Fetch lịch sử gửi thuốc - Updated to use the service
  const fetchMedicationHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      // Use the medication request service instead of axios
      const medicationHistory =
        await medicationRequestService.fetchMedicationHistory();
      console.log("Medication history:", medicationHistory);
      setMedicationHistory(medicationHistory || []);

      // Cuộn lên đầu trang sau khi tải xong dữ liệu
      window.scrollTo({ top: 0, behavior: "smooth" });
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

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          prescriptionImage: file,
          prescriptionImagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);

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

  // Cập nhật handleSubmit để xử lý hình ảnh và đúng format API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Lấy token xác thực
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      // Use the medication request service instead of direct API call
      const response = await medicationRequestService.submitMedicationRequest({
        studentId: formData.studentId,
        medicineName: formData.medicineName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeToTake: formData.timeToTake,
        notes: formData.notes || "",
        prescriptionImage: formData.prescriptionImage,
      });

      console.log("API Response:", response);
      setFormSubmitted(true);

      // Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });

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

      toast.success("Gửi yêu cầu dùng thuốc thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Có lỗi xảy ra, vui lòng thử lại sau.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm để chuyển đổi hình ảnh sang Base64 - Use from service instead
  const convertImageToBase64 = medicationRequestService.convertImageToBase64;

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
    // Chuyển đổi status code sang format CSS class mới
    const statusCode = status.toLowerCase().replace("_", "-");
    return `med-status-${statusCode}`;
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

    // Điền form modal với dữ liệu hiện tại, nhưng xóa trắng thời gian uống và hướng dẫn đặc biệt
    setEditFormData({
      id: requestToUpdate.id,
      medicationName: requestToUpdate.medicationName || "",
      dosageInstructions: requestToUpdate.dosageInstructions || "",
      frequencyPerDay: requestToUpdate.frequencyPerDay || "",
      startDate: requestToUpdate.startDate?.substring(0, 10) || "",
      endDate: requestToUpdate.endDate?.substring(0, 10) || "",
      timeToTake: [], // Xóa trắng thời gian uống để người dùng chọn lại
      specialInstructions: "", // Xóa trắng hướng dẫn đặc biệt
      // Lưu thêm thông tin khác cần thiết
      submittedAt: requestToUpdate.submittedAt,
      healthProfileId: requestToUpdate.healthProfileId,
      studentName: requestToUpdate.studentName,
      requestedBy: requestToUpdate.requestedBy,
      requestedByAccountId: requestToUpdate.requestedByAccountId,
      parentProvided: requestToUpdate.parentProvided,
      studentClass: requestToUpdate.studentClass,
      studentId: requestToUpdate.studentId,
      prescriptionImage: null,
    });

    // Reset modal image state
    setModalPrescriptionImage(null);
    setModalImagePreview(null);

    // Mở modal
    setIsModalOpen(true);
  };

  // Thêm hàm handleDeleteRequest - Updated to use service
  const handleDeleteRequest = async (requestId) => {
    // Confirm before cancellation
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này không?")) {
      return;
    }

    setIsHistoryLoading(true);

    try {
      // Use the service instead of direct axios call
      await medicationRequestService.cancelMedicationRequest(requestId);

      // Cập nhật lại danh sách yêu cầu thuốc
      fetchMedicationHistory();
      toast.success("Yêu cầu đã được hủy thành công");
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
    prescriptionImage: null,
  });

  // State cho prescription image trong modal
  const [modalPrescriptionImage, setModalPrescriptionImage] = useState(null);
  const [modalImagePreview, setModalImagePreview] = useState(null);

  // State cho confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  const [modalErrors, setModalErrors] = useState({});

  // Function để fetch confirmation data
  const fetchConfirmationData = async (requestId) => {
    setConfirmationLoading(true);
    try {
      // Use the service to get medication administration details
      const response =
        await medicationRequestService.getMedicationAdministrationDetails(
          requestId,
          API_ENDPOINTS
        );

      // Check if response has the new JSON format structure
      const confirmationData =
        response.data &&
        response.data.content &&
        response.data.content.length > 0
          ? response.data.content[0]
          : response;

      setConfirmationData(confirmationData);
      setIsConfirmationModalOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải thông tin xác nhận. Vui lòng thử lại."
      );
    } finally {
      setConfirmationLoading(false);
    }
  };

  // Function để format timestamp cho confirmation
  const formatConfirmationTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
        toast.error("File không được vượt quá 5MB");
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)");
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
      toast.error("Vui lòng điền đầy đủ thông tin");
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
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
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

      console.log("Updating medication request with data:", updateData);

      // Sử dụng service để cập nhật yêu cầu
      await medicationRequestService.updateMedicationRequest(
        editFormData.id,
        updateData
      );

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
      if (typeof error.response?.data === "string") {
        errorMessage = error.response.data;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage =
          "Không thể cập nhật yêu cầu thuốc. Vui lòng thử lại sau.";
      }

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

  useEffect(() => {
    // Cuộn lên đầu trang khi component được load
    window.scrollTo(0, 0);
  }, []);

  // Đảm bảo trang luôn cuộn về đầu khi hiển thị thông báo thành công
  useEffect(() => {
    // Cuộn lên đầu trang khi formSubmitted thay đổi
    if (formSubmitted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [formSubmitted]);

  // State for image zoom functionality
  const [zoomedImage, setZoomedImage] = useState(null);

  // Function to handle image click for zooming
  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  // Function to close the zoomed image
  const handleCloseZoom = () => {
    setZoomedImage(null);
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
          onClick={() => {
            setActiveTab("form");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Gửi yêu cầu thuốc
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("history");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Lịch sử yêu cầu
        </button>
      </div>

      {activeTab === "form" ? (
        // Form gửi thuốc
        formSubmitted ? (
          <div className="form-container">
            {" "}
            {/* Thêm container này để kiểm soát chiều rộng */}
            <div className="success-message">
              <div className="success-icon"></div>
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
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Gửi yêu cầu mới
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setActiveTab("history");
                    fetchMedicationHistory();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Xem lịch sử yêu cầu
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="send-medicine-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Thông tin học sinh</h3>
              <div className="form-group-horizontal">
                <label htmlFor="studentId">Chọn học sinh:</label>
                <div>
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
            </div>

            <div className="form-section">
              <h3>Thông tin thuốc</h3>
              <div className="form-group-horizontal">
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
                    <span className="error-text">{errors.medicineName}</span>
                  )}
                </div>
              </div>

              <div className="form-group-horizontal">
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
                    <span className="error-text">{errors.dosage}</span>
                  )}
                </div>
              </div>

              <div className="form-group-horizontal">
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

              <div className="form-group-horizontal">
                <label>Thời điểm uống thuốc:</label>
                <div>
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
            </div>

            <div className="form-section">
              <h3>Thông tin bổ sung</h3>
              {/* Thêm trường hình ảnh đơn thuốc */}
              <div className="form-group">
                <label htmlFor="prescriptionImage">Hình ảnh đơn thuốc:</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="prescriptionImage"
                    name="prescriptionImage"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    className="image-input"
                  />
                  <label htmlFor="prescriptionImage" className="upload-button">
                    Chọn ảnh
                  </label>
                  {formData.prescriptionImage && (
                    <span className="file-name">
                      {formData.prescriptionImage.name}
                    </span>
                  )}
                  {errors.prescriptionImage && (
                    <div className="error-text">{errors.prescriptionImage}</div>
                  )}
                  {formData.prescriptionImagePreview && (
                    <div className="image-preview-container">
                      <img
                        src={formData.prescriptionImagePreview}
                        alt="Đơn thuốc"
                        className="image-preview"
                        onClick={() =>
                          handleImageClick(formData.prescriptionImagePreview)
                        }
                      />
                    </div>
                  )}
                </div>
                <span className="help-text">
                  Tối đa 5MB. Định dạng: JPG, PNG.
                </span>
              </div>

              <div className="form-row-large">
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
                onClick={isUpdating ? handleModalFormSubmit : handleSubmit}
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

          {historyError && <div className="error-message">{historyError}</div>}

          {isHistoryLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải lịch sử yêu cầu...</p>
            </div>
          ) : medicationHistory.length === 0 ? (
            <div className="empty-history">
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
                  <div className="med-request-header">
                    <div className="med-request-title">
                      <h3>{request.medicationName}</h3>
                      <p className="med-request-student">
                        {request.studentName} - Lớp {request.studentClass}
                      </p>
                      <p className="med-request-date">
                        Ngày yêu cầu: {formatDate(request.submittedAt)}
                      </p>
                    </div>
                    <div className="med-request-actions">
                      {request.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            className="med-btn med-btn-primary"
                            onClick={() => handleUpdateRequest(request.id)}
                          >
                            Cập nhật
                          </button>
                          <button
                            className="med-btn med-btn-danger"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Xóa
                          </button>
                        </>
                      )}
                      {request.status === "APPROVED" && (
                        <button
                          className="med-btn med-btn-success"
                          onClick={() => fetchConfirmationData(request.id)}
                          disabled={confirmationLoading}
                        >
                          {confirmationLoading ? "Đang tải..." : "Xem xác nhận"}
                        </button>
                      )}
                      <div
                        className={`med-status med-status-${request.status
                          .toLowerCase()
                          .replace("_", "-")}`}
                      >
                        {getStatusLabel(request.status)}
                      </div>
                    </div>
                  </div>

                  <div className="request-details">
                    <div className="med-info-container">
                      <div className="med-info-row">
                        <div className="med-info-item">
                          <span className="med-info-label">Liều lượng:</span>
                          <div className="med-info-value">
                            {request.dosageInstructions}
                          </div>
                        </div>

                        <div className="med-info-item">
                          <span className="med-info-label">Tần suất:</span>
                          <div className="med-info-value">
                            <strong>{request.frequencyPerDay} lần/ngày</strong>
                            <div className="med-date-range">
                              <span>
                                {formatDate(request.startDate)} -{" "}
                                {formatDate(request.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="med-info-row">
                        <div className="med-info-full">
                          <span className="med-info-label">
                            Thời điểm uống:
                          </span>
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
                      </div>

                      {request.specialInstructions && (
                        <div className="med-info-row">
                          <div className="med-info-full">
                            <span className="med-info-label">
                              Hướng dẫn đặc biệt:
                            </span>
                            <div className="med-info-note">
                              {request.specialInstructions}
                            </div>
                          </div>
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
        <div className="med-modal-overlay">
          <div className="med-modal">
            <div className="med-modal-header">
              <h3>Cập nhật yêu cầu thuốc</h3>
              <button
                className="med-modal-close"
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
            <div className="med-modal-content">
              <form onSubmit={handleModalFormSubmit}>
                {/* Student info */}
                <div className="form-group">
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
                <div className="form-group">
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
                    <span className="error-text">
                      {modalErrors.medicationName}
                    </span>
                  )}
                </div>

                {/* Form rows for better layout */}
                <div className="form-row">
                  <div className="form-group">
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
                      className={modalErrors.dosageInstructions ? "error" : ""}
                      required
                    />
                    {modalErrors.dosageInstructions && (
                      <span className="error-text">
                        {modalErrors.dosageInstructions}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
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
                      <span className="error-text">
                        {modalErrors.frequencyPerDay}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
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
                      <span className="error-text">
                        {modalErrors.startDate}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
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
                      <span className="error-text">{modalErrors.endDate}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="time-options">Thời gian uống thuốc:</label>
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
                  {editFormData.timeToTake.length === 0 && (
                    <span className="error-text">
                      Vui lòng chọn ít nhất một thời điểm uống thuốc
                    </span>
                  )}
                </div>

                <div className="form-group">
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
                <div className="form-group">
                  <label htmlFor="modal-prescriptionImage">
                    Hình ảnh đơn thuốc:
                  </label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="modal-prescriptionImage"
                      name="prescriptionImage"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleModalImageChange}
                      className="image-input"
                    />
                    <label
                      htmlFor="modal-prescriptionImage"
                      className="upload-button"
                    >
                      Chọn ảnh
                    </label>
                    {modalPrescriptionImage && (
                      <span className="file-name">
                        {modalPrescriptionImage.name}
                      </span>
                    )}
                    <span className="help-text">
                      Tối đa 5MB. Định dạng: JPG, PNG.
                    </span>
                    {modalImagePreview && (
                      <div className="image-preview-container">
                        <img
                          src={modalImagePreview}
                          alt="Đơn thuốc"
                          className="image-preview"
                          onClick={() => handleImageClick(modalImagePreview)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
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
                    {loading ? "Đang cập nhật..." : "Cập nhật"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Updated with image zoom */}
      {isConfirmationModalOpen && confirmationData && (
        <div className="med-modal-overlay">
          <div className="med-modal confirmation-modal">
            <div className="med-modal-header">
              <h3>Thông tin xác nhận cho thuốc</h3>
              <button
                className="med-modal-close"
                onClick={() => {
                  setIsConfirmationModalOpen(false);
                  setConfirmationData(null);
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

            <div className="med-modal-content">
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

              <div className="med-modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsConfirmationModalOpen(false);
                    setConfirmationData(null);
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
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

      <ToastContainer />
    </div>
  );
};

export default SendMedicine;
