import React, { useState, useEffect } from "react";
import {
  FaSyringe,
  FaCalendarAlt,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPlusCircle,
  FaHospital,
  FaSchool,
  FaClock,
  FaTrash,
  FaChevronDown,
} from "react-icons/fa";
import vaccinationPlanService from "../../../../services/APIAdmin/vaccinationPlanService";
import vaccineService from "../../../../services/APIAdmin/vaccineService";
import classService from "../../../../services/APIAdmin/classService";
import SuccessModal from "../../components/SuccessModal/SuccessModal";
import ErrorModal from "../../components/ErrorModal/ErrorModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { useSuccessModal } from "../../hooks/useSuccessModal";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import "./CreateVaccinationPlan.css";

const CreateVaccinationPlan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal hooks
  const {
    isOpen: isSuccessModalVisible,
    modalData: successModalData,
    showSuccess,
    hideSuccess,
  } = useSuccessModal();
  const {
    isOpen: isErrorModalVisible,
    modalData: errorModalData,
    showError,
    hideError,
  } = useErrorModal();
  const {
    isOpen: isConfirmModalVisible,
    modalData: confirmModalData,
    showConfirm,
    hideConfirm,
  } = useConfirmModal();
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(true);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [groupedClasses, setGroupedClasses] = useState({});
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [tempSelectedClasses, setTempSelectedClasses] = useState([]);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [tempSelectedVaccines, setTempSelectedVaccines] = useState([]);
  const [vaccineSearchTerm, setVaccineSearchTerm] = useState("");

  // Form data với giá trị mặc định theo API mới
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    vaccinationDate: "",
    deadlineDate: "",
    vaccineIds: [],
    className: [],
  });

  // Lấy danh sách vaccine và classes khi component mount
  useEffect(() => {
    fetchVaccines();
    fetchClasses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".class-selector-container")) {
        setShowClassDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchVaccines = async () => {
    try {
      setLoadingVaccines(true);
      const result = await vaccineService.getAllVaccines();
      if (result.success) {
        setVaccines(result.data);
      } else {
        console.error("Lỗi khi lấy danh sách vaccine:", result.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vaccine:", error);
    } finally {
      setLoadingVaccines(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const result = await classService.getAllClasses();
      if (result.success) {
        setAvailableClasses(result.data);
        // Group classes by grade level
        const grouped = groupClassesByGrade(result.data);
        setGroupedClasses(grouped);
      } else {
        console.error("Lỗi khi lấy danh sách lớp học:", result.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lớp học:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Group classes by grade level
  const groupClassesByGrade = (classes) => {
    const grouped = {};
    classes.forEach((className) => {
      const grade = extractGradeFromClassName(className);
      if (!grouped[grade]) {
        grouped[grade] = [];
      }
      grouped[grade].push(className);
    });
    // Sort grades and classes within each grade
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const numA = parseInt(a.replace("Khối ", ""));
        const numB = parseInt(b.replace("Khối ", ""));
        return numA - numB;
      })
      .forEach((grade) => {
        sortedGrouped[grade] = grouped[grade].sort();
      });
    return sortedGrouped;
  };

  // Extract grade from class name (e.g., "3A" -> "Khối 3", "10B" -> "Khối 10")
  const extractGradeFromClassName = (className) => {
    const match = className.match(/^(\d+)/);
    return match ? `Khối ${match[1]}` : "Khác";
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Vui lòng nhập tên kế hoạch tiêm chủng");
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Vui lòng nhập mô tả kế hoạch");
      return false;
    }
    if (!formData.vaccinationDate) {
      setErrorMessage("Vui lòng chọn ngày tiêm");
      return false;
    }
    if (!formData.deadlineDate) {
      setErrorMessage("Vui lòng chọn hạn chót đăng ký");
      return false;
    }
    if (formData.vaccineIds.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một loại vaccine");
      return false;
    }
    if (formData.className.length === 0) {
      setErrorMessage("Vui lòng thêm ít nhất một lớp học");
      return false;
    }

    // Kiểm tra deadline phải trước ngày tiêm
    const deadlineDate = new Date(formData.deadlineDate);
    const vaccinationDate = new Date(formData.vaccinationDate);
    if (deadlineDate >= vaccinationDate) {
      setErrorMessage("Hạn chót đăng ký phải trước ngày tiêm");
      return false;
    }

    return true;
  };

  // Validation chi tiết cho từng field
  const validateField = (field, value) => {
    switch (field) {
      case "name":
        return value.trim().length >= 5
          ? null
          : "Tên kế hoạch phải có ít nhất 5 ký tự";
      case "description":
        return value.trim().length >= 10
          ? null
          : "Mô tả phải có ít nhất 10 ký tự";
      case "vaccinationDate":
        const vacDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return vacDate >= today ? null : "Ngày tiêm phải từ hôm nay trở đi";
      case "deadlineDate":
        const deadlineDate = new Date(value);
        const vaccinationDate = new Date(formData.vaccinationDate);
        if (deadlineDate >= vaccinationDate) {
          return "Hạn chót đăng ký phải trước ngày tiêm";
        }
        return null;
      default:
        return null;
    }
  };

  // State để lưu lỗi validation realtime
  const [fieldErrors, setFieldErrors] = useState({});

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Lỗi xác thực", errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      // Chuẩn bị data theo format API mới
      const planData = {
        name: formData.name,
        description: formData.description,
        vaccinationDate: formData.vaccinationDate,
        deadlineDate: new Date(formData.deadlineDate).toISOString(), // Convert to ISO string
        vaccineIds: formData.vaccineIds,
        className: formData.className,
      };

      console.log("🚀 Tạo kế hoạch tiêm chủng:", planData);

      const result = await vaccinationPlanService.createVaccinationPlan(
        planData
      );

      if (result.success) {
        // Sử dụng SuccessModal
        console.log("🎯 Đang hiển thị modal success...");
        showSuccess(
          "Thành công!",
          "Kế hoạch tiêm chủng đã được tạo thành công!"
        );

        // Reset form sau khi thành công
        setFormData({
          name: "",
          description: "",
          vaccinationDate: "",
          deadlineDate: "",
          vaccineIds: [],
          className: [],
        });
      } else {
        throw new Error(result.message || "Có lỗi xảy ra khi tạo kế hoạch");
      }
    } catch (err) {
      console.error("❌ Lỗi tạo kế hoạch:", err);
      showError(
        "Có lỗi xảy ra!",
        err.message || "Có lỗi không mong muốn xảy ra"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý validation khi người dùng nhập
  const handleInputChangeWithValidation = (field, value) => {
    handleInputChange(field, value);

    // Validate field
    const error = validateField(field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // Xử lý chọn vaccine
  const handleVaccineChange = (vaccineId) => {
    setFormData((prev) => {
      const currentIds = prev.vaccineIds;
      const newIds = currentIds.includes(vaccineId)
        ? currentIds.filter((id) => id !== vaccineId)
        : [...currentIds, vaccineId];

      return {
        ...prev,
        vaccineIds: newIds,
      };
    });
  };

  // Xử lý chọn lớp học từ dropdown
  const handleClassSelection = (className) => {
    setFormData((prev) => {
      const currentClasses = prev.className;
      const newClasses = currentClasses.includes(className)
        ? currentClasses.filter((cls) => cls !== className)
        : [...currentClasses, className];

      return {
        ...prev,
        className: newClasses,
      };
    });
  };

  // Modal functions
  const openClassModal = () => {
    setTempSelectedClasses([...formData.className]);
    setShowClassModal(true);
  };

  const closeClassModal = () => {
    setShowClassModal(false);
    setClassSearchTerm("");
  };

  const confirmClassSelection = () => {
    setFormData((prev) => ({
      ...prev,
      className: [...tempSelectedClasses],
    }));
    closeClassModal();
  };

  const handleTempClassSelection = (className) => {
    setTempSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((cls) => cls !== className)
        : [...prev, className]
    );
  };

  const handleGradeSelection = (gradeClasses, isSelected) => {
    if (isSelected) {
      setTempSelectedClasses((prev) => [
        ...new Set([...prev, ...gradeClasses]),
      ]);
    } else {
      setTempSelectedClasses((prev) =>
        prev.filter((cls) => !gradeClasses.includes(cls))
      );
    }
  };

  const removeSelectedClass = (className) => {
    setFormData((prev) => ({
      ...prev,
      className: prev.className.filter((cls) => cls !== className),
    }));
  };

  const clearAllClasses = () => {
    setFormData((prev) => ({
      ...prev,
      className: [],
    }));
  };

  // Vaccine modal functions
  const openVaccineModal = () => {
    setTempSelectedVaccines([...formData.vaccineIds]);
    setShowVaccineModal(true);
  };

  const closeVaccineModal = () => {
    setShowVaccineModal(false);
    setVaccineSearchTerm("");
  };

  const confirmVaccineSelection = () => {
    setFormData((prev) => ({
      ...prev,
      vaccineIds: [...tempSelectedVaccines],
    }));
    closeVaccineModal();
  };

  const handleTempVaccineSelection = (vaccineId) => {
    setTempSelectedVaccines((prev) =>
      prev.includes(vaccineId)
        ? prev.filter((id) => id !== vaccineId)
        : [...prev, vaccineId]
    );
  };

  const removeSelectedVaccine = (vaccineId) => {
    setFormData((prev) => ({
      ...prev,
      vaccineIds: prev.vaccineIds.filter((id) => id !== vaccineId),
    }));
  };

  const clearAllVaccines = () => {
    setFormData((prev) => ({
      ...prev,
      vaccineIds: [],
    }));
  };

  // Filter vaccines for modal
  const getFilteredVaccines = () => {
    if (!vaccineSearchTerm) return vaccines;
    return vaccines.filter(
      (vaccine) =>
        vaccine.name.toLowerCase().includes(vaccineSearchTerm.toLowerCase()) ||
        vaccine.description
          ?.toLowerCase()
          .includes(vaccineSearchTerm.toLowerCase())
    );
  };

  // Xử lý xóa lớp học
  const handleRemoveClassName = (classToRemove) => {
    setFormData((prev) => ({
      ...prev,
      className: prev.className.filter((cls) => cls !== classToRemove),
    }));
  };

  // Filter classes based on search term
  const getFilteredClasses = () => {
    if (!classSearchTerm.trim()) return groupedClasses;

    const filtered = {};
    Object.keys(groupedClasses).forEach((grade) => {
      const filteredClassesInGrade = groupedClasses[grade].filter((className) =>
        className.toLowerCase().includes(classSearchTerm.toLowerCase())
      );
      if (filteredClassesInGrade.length > 0) {
        filtered[grade] = filteredClassesInGrade;
      }
    });
    return filtered;
  };

  // Select all classes in a grade
  const handleSelectGrade = (grade) => {
    const classesInGrade = groupedClasses[grade] || [];
    const allSelected = classesInGrade.every((className) =>
      formData.className.includes(className)
    );

    setFormData((prev) => {
      let newClasses;
      if (allSelected) {
        // Deselect all classes in this grade
        newClasses = prev.className.filter(
          (className) => !classesInGrade.includes(className)
        );
      } else {
        // Select all classes in this grade
        const toAdd = classesInGrade.filter(
          (className) => !prev.className.includes(className)
        );
        newClasses = [...prev.className, ...toAdd];
      }

      return {
        ...prev,
        className: newClasses,
      };
    });
  };

  // Check if all classes in a grade are selected
  const isGradeFullySelected = (grade) => {
    const classesInGrade = groupedClasses[grade] || [];
    return (
      classesInGrade.length > 0 &&
      classesInGrade.every((className) =>
        formData.className.includes(className)
      )
    );
  };

  // Check if some classes in a grade are selected (for indeterminate state)
  const isGradePartiallySelected = (grade) => {
    const classesInGrade = groupedClasses[grade] || [];
    const selectedCount = classesInGrade.filter((className) =>
      formData.className.includes(className)
    ).length;
    return selectedCount > 0 && selectedCount < classesInGrade.length;
  };

  // Helper functions để format dữ liệu hiển thị
  const formatVaccineDisplay = (vaccine) => {
    const ageDisplay =
      vaccine.minAgeMonths && vaccine.maxAgeMonths
        ? `${vaccine.minAgeMonths} - ${vaccine.maxAgeMonths} tháng`
        : "Chưa xác định độ tuổi";

    return {
      ...vaccine,
      ageDisplay,
      displayName: vaccine.name || "Vaccine không tên",
    };
  };

  const formatSelectedVaccines = (selectedIds, vaccines) => {
    return selectedIds
      .map((id) => vaccines.find((v) => v.id === id))
      .filter(Boolean)
      .map((v) => v.name)
      .join(", ");
  };

  return (
    <div className="admin-create-vaccination-plan">
      {/* Header */}
      <div className="admin-create-vaccination-form-header">
        <div className="admin-create-vaccination-header-icon">
          <FaHospital />
        </div>
        <div className="admin-create-vaccination-header-content">
          <h2>Tạo Kế Hoạch Tiêm Chủng Mới</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-vaccination-form">
        {/* Thông tin cơ bản */}
        <div className="admin-form-section">
          <h3>
            <FaFileAlt className="admin-section-icon" />
            Thông Tin Cơ Bản
          </h3>

          <div className="admin-form-grid">
            <div className="admin-create-vaccination-form-group">
              <label htmlFor="name">
                <FaSyringe className="admin-label-icon" />
                Tên Kế Hoạch Tiêm Chủng *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ví dụ: Tiêm nhắc DPT cho học sinh lớp 1"
                value={formData.name}
                onChange={(e) =>
                  handleInputChangeWithValidation("name", e.target.value)
                }
                required
              />
              {fieldErrors.name && (
                <div className="admin-field-error">{fieldErrors.name}</div>
              )}
            </div>

            <div className="admin-create-vaccination-form-group full-width">
              <label htmlFor="description">
                <FaFileAlt className="admin-label-icon" />
                Mô Tả Kế Hoạch *
              </label>
              <textarea
                id="description"
                rows="4"
                placeholder="Ví dụ: Tiêm nhắc vắc-xin phòng bạch hầu, ho gà và uốn ván cho học sinh lớp 1 theo chương trình tiêm chủng mở rộng."
                value={formData.description}
                onChange={(e) =>
                  handleInputChangeWithValidation("description", e.target.value)
                }
                required
              />
              {fieldErrors.description && (
                <div className="admin-field-error">
                  {fieldErrors.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="admin-form-section">
          <h3>
            <FaCalendarAlt className="admin-section-icon" />
            Thời Gian Thực Hiện
          </h3>

          <div className="admin-form-grid">
            <div className="admin-create-vaccination-form-group">
              <label htmlFor="vaccinationDate">
                <FaCalendarAlt className="admin-label-icon" />
                Ngày Tiêm *
              </label>
              <input
                id="vaccinationDate"
                type="date"
                value={formData.vaccinationDate}
                onChange={(e) =>
                  handleInputChangeWithValidation(
                    "vaccinationDate",
                    e.target.value
                  )
                }
                min={new Date().toISOString().split("T")[0]}
                required
              />
              {fieldErrors.vaccinationDate && (
                <div className="admin-field-error">
                  {fieldErrors.vaccinationDate}
                </div>
              )}
            </div>

            <div className="admin-create-vaccination-form-group">
              <label htmlFor="deadlineDate">
                <FaClock className="admin-label-icon" />
                Hạn Chót Đăng Ký *
              </label>
              <input
                id="deadlineDate"
                type="datetime-local"
                value={formData.deadlineDate}
                onChange={(e) =>
                  handleInputChangeWithValidation(
                    "deadlineDate",
                    e.target.value
                  )
                }
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              {fieldErrors.deadlineDate && (
                <div className="admin-field-error">
                  {fieldErrors.deadlineDate}
                </div>
              )}
              <small className="admin-helper-text">
                Hạn chót phải trước ngày tiêm
              </small>
            </div>
          </div>
        </div>

        {/* Chọn vaccine */}
        <div className="admin-form-section">
          <h3>
            <FaSyringe className="admin-section-icon" />
            Chọn Vaccine
          </h3>

          {loadingVaccines ? (
            <div className="admin-loading-vaccines">
              <FaSpinner className="admin-spinning" />
              <span>Đang tải danh sách vaccine...</span>
            </div>
          ) : (
            <>
              <div className="admin-create-vaccination-form-group">
                <label>
                  <FaSyringe className="admin-label-icon" />
                  Chọn vaccine cần tiêm *
                </label>

                <button
                  type="button"
                  className="admin-class-selection-button"
                  onClick={openVaccineModal}
                >
                  <div className="admin-class-selection-text">
                    <FaSyringe className="admin-class-selection-icon" />
                    <span>
                      {formData.vaccineIds.length > 0
                        ? `Đã chọn ${formData.vaccineIds.length} vaccine`
                        : "Chọn vaccine từ danh sách"}
                    </span>
                  </div>
                  <FaChevronDown className="admin-class-selection-arrow" />
                </button>

                <small className="admin-helper-text">
                  Có {vaccines.length} vaccine có sẵn trong hệ thống
                </small>
              </div>

              {formData.vaccineIds.length > 0 && (
                <div className="admin-selected-classes-display">
                  <div className="admin-selected-classes-header">
                    <span className="admin-selected-classes-title">
                      Vaccine đã chọn ({formData.vaccineIds.length})
                    </span>
                    <button
                      type="button"
                      onClick={clearAllVaccines}
                      className="admin-clear-all-button"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="admin-class-tags">
                    {formData.vaccineIds.map((vaccineId) => {
                      const vaccine = vaccines.find((v) => v.id === vaccineId);
                      return vaccine ? (
                        <div key={vaccineId} className="admin-class-tag">
                          <span>{vaccine.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedVaccine(vaccineId)}
                            className="admin-remove-class-button"
                            title="Bỏ chọn vaccine này"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chọn lớp học */}
        <div className="admin-form-section">
          <h3>
            <FaSchool className="admin-section-icon" />
            Lớp Học Tham Gia
          </h3>

          <div className="admin-class-selection-section">
            {loadingClasses ? (
              <div className="admin-loading-classes">
                <FaSpinner className="admin-spinning" />
                <span>Đang tải danh sách lớp học...</span>
              </div>
            ) : (
              <>
                <div className="admin-create-vaccination-form-group">
                  <label>
                    <FaSchool className="admin-label-icon" />
                    Chọn lớp học tham gia *
                  </label>

                  <button
                    type="button"
                    className="admin-class-selection-button"
                    onClick={openClassModal}
                  >
                    <div className="admin-class-selection-text">
                      <FaSchool className="admin-class-selection-icon" />
                      <span>
                        {formData.className.length > 0
                          ? `Đã chọn ${formData.className.length} lớp học`
                          : "Chọn lớp học từ danh sách"}
                      </span>
                    </div>
                    <FaChevronDown className="admin-class-selection-arrow" />
                  </button>

                  <small className="admin-helper-text">
                    Có {availableClasses.length} lớp học có sẵn trong hệ thống
                  </small>
                </div>

                {formData.className.length > 0 && (
                  <div className="admin-selected-classes-display">
                    <div className="admin-selected-classes-header">
                      <span className="admin-selected-classes-title">
                        Các lớp đã chọn ({formData.className.length})
                      </span>
                      <button
                        type="button"
                        onClick={clearAllClasses}
                        className="admin-clear-all-button"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="admin-class-tags">
                      {formData.className.sort().map((className, index) => (
                        <div key={index} className="admin-class-tag">
                          <span>{className}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedClass(className)}
                            className="admin-remove-class-button"
                            title="Bỏ chọn lớp này"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="admin-spinning" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <FaPlusCircle />
                <span>Tạo kế hoạch</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="admin-info-cards">
        <div className="admin-info-card">
          <div className="admin-card-icon">📋</div>
          <div className="admin-card-content">
            <h4>Lưu ý quan trọng</h4>
            <p>
              Kế hoạch tiêm chủng cần được thông báo trước cho phụ huynh ít nhất
              7 ngày
            </p>
          </div>
        </div>

        <div className="admin-info-card">
          <div className="admin-card-icon">⏰</div>
          <div className="admin-card-content">
            <h4>Thời gian thực hiện</h4>
            <p>
              Nên lên kế hoạch vào thời gian không ảnh hưởng đến việc học của
              học sinh
            </p>
          </div>
        </div>

        <div className="admin-info-card">
          <div className="admin-card-icon">👥</div>
          <div className="admin-card-content">
            <h4>Đối tượng tham gia</h4>
            <p>
              Y tá trường, giáo viên chủ nhiệm và đại diện phụ huynh cần phối
              hợp
            </p>
          </div>
        </div>
      </div>

      {/* Vaccine Selection Modal */}
      {showVaccineModal && (
        <div className="admin-class-modal-overlay" onClick={closeVaccineModal}>
          <div
            className="admin-class-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-class-modal-header">
              <h3>Chọn vaccine cần tiêm</h3>
              <button
                type="button"
                className="admin-class-modal-close"
                onClick={closeVaccineModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="admin-class-modal-body">
              <div className="admin-class-search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm vaccine theo tên hoặc mô tả..."
                  value={vaccineSearchTerm}
                  onChange={(e) => setVaccineSearchTerm(e.target.value)}
                  className="admin-class-search-input"
                />
              </div>

              <div className="admin-vaccine-modal-grid">
                {getFilteredVaccines().length > 0 ? (
                  getFilteredVaccines().map((vaccine) => {
                    const formatted = formatVaccineDisplay(vaccine);
                    const isSelected = tempSelectedVaccines.includes(
                      vaccine.id
                    );

                    return (
                      <div
                        key={vaccine.id}
                        className={`admin-vaccine-modal-item ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleTempVaccineSelection(vaccine.id)}
                      >
                        <div className="admin-vaccine-modal-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleTempVaccineSelection(vaccine.id)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="admin-vaccine-modal-info">
                          <div className="admin-vaccine-modal-name">
                            {formatted.displayName}
                          </div>
                          <div className="admin-vaccine-modal-details">
                            Độ tuổi: {formatted.ageDisplay}
                            {vaccine.description && (
                              <div className="admin-vaccine-modal-description">
                                {vaccine.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="admin-vaccine-modal-icon">
                          <FaSyringe />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="admin-no-search-results">
                    <p>
                      Không tìm thấy vaccine nào với từ khóa "
                      {vaccineSearchTerm}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-class-modal-footer">
              <span className="admin-selected-count">
                Đã chọn {tempSelectedVaccines.length} vaccine
              </span>
              <div className="admin-modal-buttons">
                <button
                  type="button"
                  className="admin-modal-button cancel"
                  onClick={closeVaccineModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="admin-modal-button confirm"
                  onClick={confirmVaccineSelection}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Selection Modal */}
      {showClassModal && (
        <div className="admin-class-modal-overlay" onClick={closeClassModal}>
          <div
            className="admin-class-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-class-modal-header">
              <h3>Chọn lớp học tham gia</h3>
              <button
                type="button"
                className="admin-class-modal-close"
                onClick={closeClassModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="admin-class-modal-body">
              <div className="admin-class-search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học (VD: 3A, 10B)..."
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  className="admin-class-search-input"
                />
              </div>

              <div className="admin-class-grid">
                {Object.keys(getFilteredClasses()).length > 0 ? (
                  Object.entries(getFilteredClasses()).map(
                    ([grade, classesInGrade]) => {
                      const isGradeSelected = classesInGrade.every((cls) =>
                        tempSelectedClasses.includes(cls)
                      );
                      const isGradePartial =
                        classesInGrade.some((cls) =>
                          tempSelectedClasses.includes(cls)
                        ) && !isGradeSelected;

                      return (
                        <div key={grade} className="admin-grade-group">
                          <div className="admin-grade-header">
                            <label className="admin-grade-checkbox">
                              <input
                                type="checkbox"
                                checked={isGradeSelected}
                                ref={(el) => {
                                  if (el) el.indeterminate = isGradePartial;
                                }}
                                onChange={() =>
                                  handleGradeSelection(
                                    classesInGrade,
                                    !isGradeSelected
                                  )
                                }
                              />
                              <span className="admin-grade-name">{grade}</span>
                              <span className="admin-grade-count">
                                ({classesInGrade.length} lớp)
                              </span>
                            </label>
                          </div>
                          <div className="admin-grade-classes">
                            {classesInGrade.map((className) => (
                              <label
                                key={className}
                                className="admin-class-item"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempSelectedClasses.includes(
                                    className
                                  )}
                                  onChange={() =>
                                    handleTempClassSelection(className)
                                  }
                                />
                                <span>{className}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="admin-no-search-results">
                    <p>
                      Không tìm thấy lớp nào với từ khóa "{classSearchTerm}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-class-modal-footer">
              <span className="admin-selected-count">
                Đã chọn {tempSelectedClasses.length} lớp học
              </span>
              <div className="admin-modal-buttons">
                <button
                  type="button"
                  className="admin-modal-button cancel"
                  onClick={closeClassModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="admin-modal-button confirm"
                  onClick={confirmClassSelection}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Components */}
      {isSuccessModalVisible && (
        <SuccessModal
          isOpen={isSuccessModalVisible}
          onClose={hideSuccess}
          title={successModalData.title}
          message={successModalData.message}
          details={successModalData.details}
        />
      )}

      {isErrorModalVisible && (
        <ErrorModal
          isOpen={isErrorModalVisible}
          onClose={hideError}
          title={errorModalData.title}
          message={errorModalData.message}
          details={errorModalData.details}
        />
      )}

      {isConfirmModalVisible && (
        <ConfirmModal
          isOpen={isConfirmModalVisible}
          onConfirm={hideConfirm}
          onCancel={hideConfirm}
          title={confirmModalData.title}
          message={confirmModalData.message}
        />
      )}

      {/* Debug info - Hidden */}
      {false && process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            fontSize: "12px",
            zIndex: 9999,
          }}
        >
          Success Modal: {isSuccessModalVisible ? "VISIBLE" : "HIDDEN"}
          <br />
          Error Modal: {isErrorModalVisible ? "VISIBLE" : "HIDDEN"}
          <br />
          Success Data: {JSON.stringify(successModalData)}
          <br />
          Error Data: {JSON.stringify(errorModalData)}
        </div>
      )}
    </div>
  );
};

export default CreateVaccinationPlan;
