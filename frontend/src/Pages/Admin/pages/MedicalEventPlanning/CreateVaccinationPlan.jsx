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
import "./CreateVaccinationPlan.css";

const CreateVaccinationPlan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(true);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [groupedClasses, setGroupedClasses] = useState({});
  const [classSearchTerm, setClassSearchTerm] = useState("");
  const [showClassDropdown, setShowClassDropdown] = useState(false);

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
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setIsLoading(true);
    setShowSuccess(false);
    setShowError(false);

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
        setShowSuccess(true);
        // Reset form sau khi thành công
        setFormData({
          name: "",
          description: "",
          vaccinationDate: "",
          deadlineDate: "",
          vaccineIds: [],
          className: [],
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        throw new Error(result.message || "Có lỗi xảy ra khi tạo kế hoạch");
      }
    } catch (err) {
      console.error("❌ Lỗi tạo kế hoạch:", err);
      setErrorMessage(err.message || "Có lỗi không mong muốn xảy ra");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
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
    <div className="create-vaccination-plan">
      {/* Header */}
      <div className="create-vaccination-form-header">
        <div className="create-vaccination-header-icon">
          <FaHospital />
        </div>
        <div className="create-vaccination-header-content">
          <h2>Tạo Kế Hoạch Tiêm Chủng Mới</h2>
        
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="create-vaccination-notification success">
          <FaCheck className="notification-icon" />
          <div className="notification-content">
            <h4>Thành công!</h4>
            <p>Kế hoạch tiêm chủng đã được tạo thành công</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="create-vaccination-notification error">
          <FaTimes className="notification-icon" />
          <div className="notification-content">
            <h4>Có lỗi xảy ra!</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="vaccination-form">
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h3>
            <FaFileAlt className="section-icon" />
            Thông Tin Cơ Bản
          </h3>

          <div className="form-grid">
            <div className="create-vaccination-form-group">
              <label htmlFor="name">
                <FaSyringe className="label-icon" />
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
                <div className="field-error">{fieldErrors.name}</div>
              )}
            </div>

            <div className="create-vaccination-form-group full-width">
              <label htmlFor="description">
                <FaFileAlt className="label-icon" />
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
                <div className="field-error">{fieldErrors.description}</div>
              )}
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="form-section">
          <h3>
            <FaCalendarAlt className="section-icon" />
            Thời Gian Thực Hiện
          </h3>

          <div className="form-grid">
            <div className="create-vaccination-form-group">
              <label htmlFor="vaccinationDate">
                <FaCalendarAlt className="label-icon" />
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
                <div className="field-error">{fieldErrors.vaccinationDate}</div>
              )}
            </div>

            <div className="create-vaccination-form-group">
              <label htmlFor="deadlineDate">
                <FaClock className="label-icon" />
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
                <div className="field-error">{fieldErrors.deadlineDate}</div>
              )}
              <small className="helper-text">
                Hạn chót phải trước ngày tiêm
              </small>
            </div>
          </div>
        </div>

        {/* Chọn vaccine */}
        <div className="form-section">
          <h3>
            <FaSyringe className="section-icon" />
            Chọn Vaccine
          </h3>

          {loadingVaccines ? (
            <div className="loading-vaccines">
              <FaSpinner className="spinning" />
              <span>Đang tải danh sách vaccine...</span>
            </div>
          ) : (
            <div className="vaccine-list">
              {vaccines.length > 0 ? (
                vaccines.map((vaccine) => {
                  const formatted = formatVaccineDisplay(vaccine);
                  return (
                    <div key={vaccine.id} className="vaccine-item">
                      <label className="vaccine-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.vaccineIds.includes(vaccine.id)}
                          onChange={() => handleVaccineChange(vaccine.id)}
                        />
                        <span className="checkmark"></span>
                        <div className="vaccine-info">
                          <div className="vaccine-name">
                            {formatted.displayName}
                          </div>
                          <div className="vaccine-details">
                            Độ tuổi: {formatted.ageDisplay}
                            {vaccine.description && (
                              <span className="vaccine-description">
                                | {vaccine.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="no-vaccines">
                  <p>Không có vaccine nào trong hệ thống</p>
                </div>
              )}

              {formData.vaccineIds.length > 0 && (
                <div className="selected-vaccines-summary">
                  <strong>Đã chọn {formData.vaccineIds.length} vaccine:</strong>
                  <span>
                    {formatSelectedVaccines(formData.vaccineIds, vaccines)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chọn lớp học */}
        <div className="form-section">
          <h3>
            <FaSchool className="section-icon" />
            Lớp Học Tham Gia
          </h3>

          <div className="class-selection-section">
            {loadingClasses ? (
              <div className="loading-classes">
                <FaSpinner className="spinning" />
                <span>Đang tải danh sách lớp học...</span>
              </div>
            ) : (
              <>
                <div className="class-selector-container">
                  <label className="dropdown-label">
                    Chọn lớp từ danh sách có sẵn ({availableClasses.length}{" "}
                    lớp):
                  </label>

                  {/* Search and dropdown trigger */}
                  <div className="class-search-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        placeholder="Tìm kiếm lớp học (VD: 3A, 10B)..."
                        value={classSearchTerm}
                        onChange={(e) => setClassSearchTerm(e.target.value)}
                        onFocus={() => setShowClassDropdown(true)}
                        className="class-search-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClassDropdown(!showClassDropdown)}
                        className="dropdown-toggle-btn"
                      >
                        <FaChevronDown
                          className={showClassDropdown ? "rotated" : ""}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown content */}
                  {showClassDropdown && (
                    <div className="class-dropdown-content">
                      {availableClasses.length > 0 ? (
                        Object.keys(getFilteredClasses()).length > 0 ? (
                          Object.entries(getFilteredClasses()).map(
                            ([grade, classesInGrade]) => (
                              <div key={grade} className="grade-group">
                                <div className="grade-header">
                                  <label className="grade-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={isGradeFullySelected(grade)}
                                      ref={(el) => {
                                        if (el)
                                          el.indeterminate =
                                            isGradePartiallySelected(grade);
                                      }}
                                      onChange={() => handleSelectGrade(grade)}
                                    />
                                    <span className="grade-name">{grade}</span>
                                    <span className="grade-count">
                                      ({classesInGrade.length} lớp)
                                    </span>
                                  </label>
                                </div>
                                <div className="grade-classes">
                                  {classesInGrade.map((className) => (
                                    <label
                                      key={className}
                                      className="class-item"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={formData.className.includes(
                                          className
                                        )}
                                        onChange={() =>
                                          handleClassSelection(className)
                                        }
                                      />
                                      <span className="class-name">
                                        {className}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="no-search-results">
                            <p>
                              Không tìm thấy lớp nào với từ khóa "
                              {classSearchTerm}"
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="no-classes">
                          <p>Không có lớp học nào trong hệ thống</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {formData.className.length > 0 && (
                  <div className="selected-classes">
                    <h4>Các lớp đã chọn ({formData.className.length}):</h4>
                    <div className="class-tags">
                      {formData.className.sort().map((className, index) => (
                        <div key={index} className="class-tag">
                          <span>{className}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClassName(className)}
                            className="remove-class-btn"
                            title="Bỏ chọn lớp này"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="class-selection-summary">
                      <span>Đã chọn {formData.className.length} lớp học</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, className: [] }))
                        }
                        className="clear-all-btn"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spinning" />
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
      <div className="info-cards">
        <div className="info-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h4>Lưu ý quan trọng</h4>
            <p>
              Kế hoạch tiêm chủng cần được thông báo trước cho phụ huynh ít nhất
              7 ngày
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <h4>Thời gian thực hiện</h4>
            <p>
              Nên lên kế hoạch vào thời gian không ảnh hưởng đến việc học của
              học sinh
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h4>Đối tượng tham gia</h4>
            <p>
              Y tá trường, giáo viên chủ nhiệm và đại diện phụ huynh cần phối
              hợp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVaccinationPlan;
