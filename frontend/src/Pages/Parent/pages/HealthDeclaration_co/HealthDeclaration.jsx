import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import api from "../../../../services/api";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./HealthDeclaration.css";
import "./HealthDeclarationFix.css";
import "../shared/student-selector.css";
import "./VaccineSelection.css";
import "./ServerWarning.css";
import "./VaccinationSection.css";

// Các tùy chọn cho nhóm máu
const BLOOD_TYPE_OPTIONS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

// Các tùy chọn cho thị lực
const VISION_OPTIONS = [
  { value: "Chưa kiểm tra", label: "Chưa kiểm tra" },
  { value: "Bình thường", label: "Bình thường" },
  { value: "Cận thị nhẹ", label: "Cận thị nhẹ" },
  { value: "Cận thị vừa", label: "Cận thị vừa" },
  { value: "Cận thị nặng", label: "Cận thị nặng" },
  { value: "Viễn thị", label: "Viễn thị" },
  { value: "Loạn thị", label: "Loạn thị" },
  { value: "Khác", label: "Khác" },
];

// Các tùy chọn cho thính lực
const HEARING_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Giảm thính lực nhẹ", label: "Giảm thính lực nhẹ" },
  { value: "Giảm thính lực vừa", label: "Giảm thính lực vừa" },
  { value: "Giảm thính lực nặng", label: "Giảm thính lực nặng" },
  { value: "Khác", label: "Khác" },
];

const HealthDeclaration = () => {
  const { currentUser } = useAuth();

  // Lấy thông tin học sinh từ context
  const {
    students,
    parentInfo,
    isLoading: studentsLoading,
    error: studentsError,
    fetchHealthProfile,
  } = useStudentData();

  // State quản lý trạng thái
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServerError, setIsServerError] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // State hiển thị thông báo thành công
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    healthProfile: {
      id: 0,
      bloodType: "A",
      height: "",
      weight: "",
      allergies: "",
      chronicDiseases: "",
      visionLeft: "Chưa kiểm tra",
      visionRight: "Chưa kiểm tra",
      hearingStatus: "Bình thường",
      dietaryRestrictions: "",
      emergencyContactInfo: "",
      immunizationStatus: "",
      lastPhysicalExamDate: new Date().toISOString().split("T")[0],
      specialNeeds: "",
    },
    vaccinations: [],
  });

  const [formErrors, setFormErrors] = useState({});

  // State cho vaccines
  const [vaccines, setVaccines] = useState([]);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);
  const [vaccinesError, setVaccinesError] = useState(null);
  const [selectedVaccines, setSelectedVaccines] = useState([]);

  // State cho vaccine đã tiêm từ server (không cho phép thay đổi)
  const [vaccinatedFromServer, setVaccinatedFromServer] = useState([]);

  // State cho thông tin vaccine mới chọn
  const [vaccineNotes, setVaccineNotes] = useState({});
  const [vaccineAdministeredAt, setVaccineAdministeredAt] = useState({});

  // State cho modal thông báo vaccine đã tiêm
  const [showVaccineAlreadyTakenModal, setShowVaccineAlreadyTakenModal] =
    useState(false);
  const [selectedVaccineInfo, setSelectedVaccineInfo] = useState(null);

  // Fetch danh sách vaccine từ API
  useEffect(() => {
    const fetchVaccines = async () => {
      setIsLoadingVaccines(true);
      setVaccinesError(null);
      try {
        // Sử dụng endpoint chính xác như yêu cầu
        const response = await axios.get(
          "http://localhost:8080/api/v1/vaccines/getAllVaccine"
        );
        setVaccines(response.data);
      } catch (error) {
        console.error("Không thể tải danh sách vaccine:", error);
        setVaccinesError(
          "Không thể tải danh sách vaccine. Vui lòng thử lại sau."
        );
        setIsServerError(true);
      } finally {
        setIsLoadingVaccines(false);
      }
    };

    fetchVaccines();
  }, []);

  // Khi danh sách học sinh được tải xong, chọn học sinh đầu tiên
  useEffect(() => {
    if (students.length > 0 && formData.healthProfile.id === 0) {
      const firstStudent = students[0];
      setFormData((prevState) => ({
        ...prevState,
        healthProfile: {
          ...prevState.healthProfile,
          id: firstStudent.id,
        },
      }));

      // Load hồ sơ y tế của học sinh này
      fetchStudentHealthProfile(firstStudent.id);
    }
  }, [students]);

  // Fetch thông tin sức khỏe của học sinh
  const fetchStudentHealthProfile = async (studentId) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Lấy thông tin hồ sơ sức khỏe đầy đủ từ API
      const response = await axios.get(
        `http://localhost:8080/api/v1/health-profiles/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data) {
        // Cập nhật form data với thông tin từ API
        setFormData((prevState) => ({
          ...prevState,
          healthProfile: {
            ...prevState.healthProfile,
            ...response.data,
            id: studentId, // Đảm bảo ID học sinh không bị ghi đè
          },
        }));

        // Nếu có thông tin vaccine trong response, cập nhật selected vaccines
        if (
          response.data.vaccinations &&
          response.data.vaccinations.length > 0
        ) {
          const vaccineIds = response.data.vaccinations.map((v) => v.vaccineId);
          setSelectedVaccines(vaccineIds);

          // Lưu vaccine đã tiêm từ server (không cho phép sửa)
          setVaccinatedFromServer(vaccineIds);

          // Cập nhật vaccine notes
          const notes = {};
          const administeredAts = {};
          response.data.vaccinations.forEach((v) => {
            if (v.parentNotes) {
              notes[v.vaccineId] = v.parentNotes;
            }
            if (v.administeredAt) {
              administeredAts[v.vaccineId] = v.administeredAt;
            }
          });
          setVaccineNotes(notes);
          setVaccineAdministeredAt(administeredAts);

          // Cập nhật form data vaccinations
          setFormData((prevState) => ({
            ...prevState,
            vaccinations: response.data.vaccinations,
          }));
        } else {
          // Reset nếu không có vaccine nào đã tiêm
          setVaccinatedFromServer([]);
        }
      }
    } catch (error) {
      console.error("Không thể tải thông tin sức khỏe:", error);
      setFetchError(
        "Không thể tải thông tin sức khỏe. Dữ liệu sẽ được tạo mới."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      healthProfile: {
        ...prevState.healthProfile,
        [name]: value,
      },
    }));

    // Real-time validation cho một số trường
    if (["height", "weight", "emergencyContactInfo"].includes(name)) {
      handleRealTimeValidation(name, value);
    } else {
      // Xóa lỗi của trường này khi người dùng nhập lại
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  // Xử lý khi chọn học sinh
  const handleStudentChange = (e) => {
    const studentId = parseInt(e.target.value);
    if (!studentId) return;

    setFormData((prevState) => ({
      ...prevState,
      healthProfile: {
        ...prevState.healthProfile,
        id: studentId,
      },
    }));

    // Reset selected vaccines and notes when changing student
    setSelectedVaccines([]);
    setVaccineNotes({});
    setVaccineAdministeredAt({});
    setVaccinatedFromServer([]); // Reset vaccine đã tiêm từ server

    // Tải thông tin sức khỏe của học sinh được chọn
    fetchStudentHealthProfile(studentId);
  };

  // Xử lý khi chọn/bỏ chọn vaccine
  const handleVaccineChange = (vaccineId) => {
    // Tìm thông tin vaccine để hiển thị tên
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    const vaccineName = vaccine ? vaccine.name : `Vaccine ID: ${vaccineId}`;

    // Kiểm tra xem vaccine này đã tiêm từ server chưa (không cho phép thay đổi)
    if (vaccinatedFromServer.includes(vaccineId)) {
      console.log("Vaccine already taken, showing modal for:", vaccine); // Debug log

      // Hiển thị modal thông báo chi tiết (chỉ khi có vaccine info)
      if (vaccine) {
        showVaccineAlreadyTakenNotification(vaccine);
        console.log("Modal should be shown for:", vaccine.name); // Debug log
      } else {
        console.log("No vaccine info found for ID:", vaccineId); // Debug log
      }

      // Hiển thị toast warning với thông tin chi tiết
      toast.warning(
        `🚫 ${vaccineName} đã được tiêm trước đó và không thể thay đổi!`,
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "vaccine-already-taken-toast",
        }
      );

      // Log để debug
      console.log(
        `Attempted to change already vaccinated: ${vaccineName} (ID: ${vaccineId})`
      );
      return;
    }

    if (selectedVaccines.includes(vaccineId)) {
      // Bỏ chọn vaccine (chỉ những vaccine mới thêm)
      setSelectedVaccines(selectedVaccines.filter((id) => id !== vaccineId));

      // Cập nhật formData để loại bỏ vaccine này
      setFormData((prevState) => ({
        ...prevState,
        vaccinations: prevState.vaccinations.filter(
          (v) => v.vaccineId !== vaccineId
        ),
      }));

      // Xóa notes của vaccine này
      const updatedNotes = { ...vaccineNotes };
      delete updatedNotes[vaccineId];
      setVaccineNotes(updatedNotes);

      // Xóa administeredAt của vaccine này
      const updatedAdministeredAt = { ...vaccineAdministeredAt };
      delete updatedAdministeredAt[vaccineId];
      setVaccineAdministeredAt(updatedAdministeredAt);
    } else {
      // Thêm vaccine vào danh sách đã chọn
      setSelectedVaccines([...selectedVaccines, vaccineId]);

      // Cập nhật formData để thêm vaccine mới
      setFormData((prevState) => ({
        ...prevState,
        vaccinations: [
          ...prevState.vaccinations,
          {
            vaccineId: vaccineId,
            vaccinationDate: new Date().toISOString(),
            administeredAt: "Trường học", // Mặc định
            notes: "",
            parentNotes: "",
          },
        ],
      }));

      // Đặt địa điểm tiêm mặc định
      setVaccineAdministeredAt((prev) => ({
        ...prev,
        [vaccineId]: "Trường học",
      }));
    }
  };

  // Xử lý khi thay đổi ghi chú của vaccine
  const handleVaccineNoteChange = (vaccineId, e) => {
    const { value } = e.target;

    // Cập nhật state ghi chú
    setVaccineNotes({
      ...vaccineNotes,
      [vaccineId]: value,
    });

    // Cập nhật formData
    setFormData((prevState) => ({
      ...prevState,
      vaccinations: prevState.vaccinations.map((v) => {
        if (v.vaccineId === vaccineId) {
          return {
            ...v,
            parentNotes: value,
          };
        }
        return v;
      }),
    }));
  };

  // Xử lý khi thay đổi địa điểm tiêm vaccine
  const handleVaccineAdministeredAtChange = (vaccineId, e) => {
    const { value } = e.target;

    // Cập nhật state địa điểm tiêm
    setVaccineAdministeredAt({
      ...vaccineAdministeredAt,
      [vaccineId]: value,
    });

    // Cập nhật formData
    setFormData((prevState) => ({
      ...prevState,
      vaccinations: prevState.vaccinations.map((v) => {
        if (v.vaccineId === vaccineId) {
          return {
            ...v,
            administeredAt: value,
          };
        }
        return v;
      }),
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const { healthProfile } = formData;

    console.log("Validating form data:", healthProfile); // Debug log

    // Validate student ID - bắt buộc
    if (!healthProfile.id || healthProfile.id === 0) {
      errors.studentId = "Vui lòng chọn học sinh";
    }

    // Validate blood type - bắt buộc
    if (!healthProfile.bloodType || healthProfile.bloodType === "") {
      errors.bloodType = "Vui lòng chọn nhóm máu";
    }

    // Validate height - nếu có thì phải hợp lệ
    if (healthProfile.height && healthProfile.height !== "") {
      const height = parseFloat(healthProfile.height);
      if (isNaN(height)) {
        errors.height = "Chiều cao phải là số";
      } else if (height < 30) {
        errors.height = "Chiều cao quá thấp (tối thiểu 30cm)";
      } else if (height > 300) {
        errors.height = "Chiều cao quá cao (tối đa 300cm)";
      }
    }

    // Validate weight - nếu có thì phải hợp lệ
    if (healthProfile.weight && healthProfile.weight !== "") {
      const weight = parseFloat(healthProfile.weight);
      if (isNaN(weight)) {
        errors.weight = "Cân nặng phải là số";
      } else if (weight < 5) {
        errors.weight = "Cân nặng quá nhẹ (tối thiểu 5kg)";
      } else if (weight > 500) {
        errors.weight = "Cân nặng quá nặng (tối đa 500kg)";
      }
    }

    // Validate vision - bắt buộc
    if (!healthProfile.visionLeft || healthProfile.visionLeft === "") {
      errors.visionLeft = "Vui lòng chọn tình trạng thị lực mắt trái";
    }
    if (!healthProfile.visionRight || healthProfile.visionRight === "") {
      errors.visionRight = "Vui lòng chọn tình trạng thị lực mắt phải";
    }

    // Validate hearing - bắt buộc
    if (!healthProfile.hearingStatus || healthProfile.hearingStatus === "") {
      errors.hearingStatus = "Vui lòng chọn tình trạng thính lực";
    }

    // Validate lastPhysicalExamDate - bắt buộc
    if (
      !healthProfile.lastPhysicalExamDate ||
      healthProfile.lastPhysicalExamDate.trim() === ""
    ) {
      errors.lastPhysicalExamDate =
        "Vui lòng chọn ngày kiểm tra sức khỏe gần nhất";
    } else {
      // Kiểm tra ngày không được trong tương lai
      const examDate = new Date(healthProfile.lastPhysicalExamDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today

      if (examDate > today) {
        errors.lastPhysicalExamDate =
          "Ngày kiểm tra không được trong tương lai";
      }

      // Kiểm tra ngày không được quá xa trong quá khứ (5 năm)
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      if (examDate < fiveYearsAgo) {
        errors.lastPhysicalExamDate =
          "Ngày kiểm tra không được quá 5 năm trước";
      }
    }

    // Validate emergency contact - bắt buộc
    if (
      !healthProfile.emergencyContactInfo ||
      healthProfile.emergencyContactInfo.trim() === ""
    ) {
      errors.emergencyContactInfo = "Vui lòng nhập thông tin liên lạc khẩn cấp";
    } else if (healthProfile.emergencyContactInfo.trim().length < 10) {
      errors.emergencyContactInfo =
        "Thông tin liên lạc khẩn cấp quá ngắn (tối thiểu 10 ký tự)";
    } else {
      // Kiểm tra có chứa số điện thoại hợp lệ
      const contactInfo = healthProfile.emergencyContactInfo;
      const hasValidPhone = isValidPhoneNumber(contactInfo);

      if (!hasValidPhone) {
        // Tìm kiếm số điện thoại trong text
        const phoneNumbers = contactInfo.match(/[\d\+\-\s()]+/g);
        const hasAnyPhonePattern =
          phoneNumbers &&
          phoneNumbers.some((num) => num.replace(/\D/g, "").length >= 10);

        if (!hasAnyPhonePattern) {
          errors.emergencyContactInfo =
            "Thông tin liên lạc cần bao gồm số điện thoại hợp lệ (10-11 số)";
        }
      }
    }

    // Validate allergies length
    if (healthProfile.allergies && healthProfile.allergies.length > 500) {
      errors.allergies = "Thông tin dị ứng quá dài (tối đa 500 ký tự)";
    }

    // Validate chronic diseases length
    if (
      healthProfile.chronicDiseases &&
      healthProfile.chronicDiseases.length > 500
    ) {
      errors.chronicDiseases =
        "Thông tin bệnh mãn tính quá dài (tối đa 500 ký tự)";
    }

    // Validate dietary restrictions length
    if (
      healthProfile.dietaryRestrictions &&
      healthProfile.dietaryRestrictions.length > 500
    ) {
      errors.dietaryRestrictions =
        "Thông tin hạn chế ăn uống quá dài (tối đa 500 ký tự)";
    }

    // Validate special needs length
    if (healthProfile.specialNeeds && healthProfile.specialNeeds.length > 500) {
      errors.specialNeeds =
        "Thông tin nhu cầu đặc biệt quá dài (tối đa 500 ký tự)";
    }

    console.log("Validation errors:", errors); // Debug log
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submit triggered"); // Debug log
    console.log("Current form data:", formData); // Debug log

    if (!validateForm()) {
      console.log("Form validation failed"); // Debug log

      // Hiển thị thông báo lỗi chi tiết
      const errorCount = Object.keys(formErrors).length;
      const firstError = Object.values(formErrors)[0];

      // Hiển thị toast với thông tin cụ thể hơn
      toast.error(
        `Có ${errorCount} lỗi cần sửa. Vui lòng kiểm tra form và sửa các lỗi được đánh dấu.`,
        {
          position: "top-center",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Scroll đến field đầu tiên có lỗi
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement =
        document.getElementById(firstErrorField) ||
        document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Thêm delay để scroll hoàn thành trước khi focus
        setTimeout(() => {
          errorElement.focus();
          // Thêm highlight effect
          errorElement.classList.add("field-highlight");
          setTimeout(() => {
            errorElement.classList.remove("field-highlight");
          }, 2000);
        }, 300);
      }

      return;
    }

    console.log("Form validation passed, submitting..."); // Debug log
    setIsSubmitting(true);

    try {
      // Chuyển đổi dữ liệu theo format API mới
      const submissionData = {
        healthProfile: {
          ...formData.healthProfile,
          height:
            formData.healthProfile.height &&
            formData.healthProfile.height !== ""
              ? parseFloat(formData.healthProfile.height)
              : 0, // Gửi 0 thay vì 300 nếu trống
          weight:
            formData.healthProfile.weight &&
            formData.healthProfile.weight !== ""
              ? parseFloat(formData.healthProfile.weight)
              : 0, // Gửi 0 thay vì 500 nếu trống
          checkupStatus: "COMPLETED", // Thêm checkupStatus khi submit
        },
        vaccinations: formData.vaccinations.map((vaccination) => ({
          vaccineId: vaccination.vaccineId,
          vaccinationDate: vaccination.vaccinationDate,
          administeredAt: vaccination.administeredAt || "Trường học",
          notes: vaccination.notes || "",
          parentNotes: vaccination.parentNotes || "",
        })),
      };

      console.log("Dữ liệu gửi đi:", submissionData);

      // Sử dụng API endpoint chính xác theo yêu cầu
      const response = await axios.post(
        "http://localhost:8080/api/v1/health-profiles/full",
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("API response:", response);

      // Hiển thị thông báo thành công
      setShowSuccessMessage(true);
      toast.success("Cập nhật hồ sơ sức khỏe thành công!");

      // Ẩn thông báo sau 5 giây
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      // Reset selected vaccines
      setSelectedVaccines([]);
      setVaccineNotes({});
      setVaccineAdministeredAt({});
      setFormData((prevState) => ({
        ...prevState,
        vaccinations: [],
      }));
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      console.error("Error details:", error.response?.data); // Debug log
      setIsServerError(true);

      // Kiểm tra nếu lỗi 400 có liên quan đến vaccine đã tiêm
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "";

        // Nếu lỗi liên quan đến vaccine đã tiêm
        if (
          errorMessage.toLowerCase().includes("vaccine") ||
          errorMessage.toLowerCase().includes("tiêm") ||
          errorMessage.toLowerCase().includes("vaccination")
        ) {
          toast.error(
            "❌ Không thể cập nhật do có vaccine đã được tiêm trước đó trong danh sách. Hệ thống không cho phép thay đổi thông tin vaccine đã tiêm!",
            {
              position: "top-center",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );

          // Tìm và hiển thị thông tin về vaccine đã tiêm
          const vaccinatedVaccines = formData.vaccinations.filter((v) =>
            vaccinatedFromServer.includes(v.vaccineId)
          );

          if (vaccinatedVaccines.length > 0) {
            const vaccineNames = vaccinatedVaccines
              .map((v) => {
                const vaccine = vaccines.find((vac) => vac.id === v.vaccineId);
                return vaccine ? vaccine.name : `ID: ${v.vaccineId}`;
              })
              .join(", ");

            toast.info(
              `📋 Vaccine đã tiêm: ${vaccineNames}. Vui lòng bỏ chọn các vaccine này để có thể cập nhật thành công.`,
              {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          }

          return; // Dừng xử lý, không hiển thị lỗi chung
        }
      }

      // Hiển thị lỗi chi tiết hơn với better error handling
      let errorMessage =
        "Không thể cập nhật hồ sơ sức khỏe. Vui lòng thử lại sau!";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.statusText) {
        errorMessage = error.response.statusText;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm hiển thị modal thông báo vaccine đã tiêm
  const showVaccineAlreadyTakenNotification = (vaccine) => {
    console.log("=== showVaccineAlreadyTakenNotification called ==="); // Debug log
    console.log("Vaccine data:", vaccine); // Debug log

    // Force update state immediately
    setSelectedVaccineInfo(vaccine);
    setShowVaccineAlreadyTakenModal(true);

    console.log("Modal state updated - should show modal now"); // Debug log

    // Tự động ẩn modal sau 20 giây
    setTimeout(() => {
      console.log("Auto-hiding modal after 20 seconds"); // Debug log
      setShowVaccineAlreadyTakenModal(false);
    }, 20000);
  };

  // Render modal thông báo vaccine đã tiêm - sử dụng Portal
  const renderVaccineAlreadyTakenModal = () => {
    console.log("renderVaccineAlreadyTakenModal called"); // Debug log
    console.log("showVaccineAlreadyTakenModal:", showVaccineAlreadyTakenModal); // Debug log
    console.log("selectedVaccineInfo:", selectedVaccineInfo); // Debug log

    if (!showVaccineAlreadyTakenModal || !selectedVaccineInfo) {
      console.log("Modal not shown - missing state or info"); // Debug log
      return null;
    }

    console.log("Creating modal portal for vaccine:", selectedVaccineInfo.name); // Debug log

    const modalContent = (
      <div
        className="vaccine-already-taken-modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={() => {
          console.log("Modal overlay clicked - closing modal"); // Debug log
          setShowVaccineAlreadyTakenModal(false);
        }}
      >
        <div
          className="vaccine-already-taken-modal"
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            position: "relative",
            animation: "slideUp 0.3s ease-out",
            border: "3px solid #ff6b6b",
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log("Modal content clicked - not closing"); // Debug log
          }}
        >
          <div
            className="modal-header"
            style={{ textAlign: "center", marginBottom: "20px" }}
          >
            <div
              className="modal-icon"
              style={{ fontSize: "48px", marginBottom: "10px" }}
            >
              🚫
            </div>
            <h3 style={{ color: "#ff6b6b", margin: "0", fontSize: "24px" }}>
              Vaccine Đã Được Tiêm
            </h3>
            <button
              className="modal-close-btn"
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                background: "none",
                border: "none",
                fontSize: "30px",
                cursor: "pointer",
                color: "#999",
              }}
              onClick={() => {
                console.log("Close button clicked"); // Debug log
                setShowVaccineAlreadyTakenModal(false);
              }}
            >
              ×
            </button>
          </div>

          <div className="modal-content">
            <div
              className="vaccine-info-display"
              style={{ marginBottom: "20px" }}
            >
              <h4
                style={{
                  color: "#333",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                {selectedVaccineInfo.name}
              </h4>
              <p
                className="vaccine-description"
                style={{ color: "#666", marginBottom: "15px" }}
              >
                {selectedVaccineInfo.description}
              </p>

              <div
                className="vaccine-details-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="vaccine-detail-item"
                  style={{
                    padding: "10px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    className="label"
                    style={{ fontWeight: "bold", color: "#333" }}
                  >
                    Số liều:
                  </span>
                  <span
                    className="value"
                    style={{ marginLeft: "5px", color: "#666" }}
                  >
                    {selectedVaccineInfo.totalDoses}
                  </span>
                </div>
                <div
                  className="vaccine-detail-item"
                  style={{
                    padding: "10px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    className="label"
                    style={{ fontWeight: "bold", color: "#333" }}
                  >
                    Khoảng cách:
                  </span>
                  <span
                    className="value"
                    style={{ marginLeft: "5px", color: "#666" }}
                  >
                    {selectedVaccineInfo.intervalDays} ngày
                  </span>
                </div>
                <div
                  className="vaccine-detail-item"
                  style={{
                    padding: "10px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                    gridColumn: "1 / -1",
                  }}
                >
                  <span
                    className="label"
                    style={{ fontWeight: "bold", color: "#333" }}
                  >
                    Độ tuổi:
                  </span>
                  <span
                    className="value"
                    style={{ marginLeft: "5px", color: "#666" }}
                  >
                    {selectedVaccineInfo.minAgeMonths}-
                    {selectedVaccineInfo.maxAgeMonths} tháng
                  </span>
                </div>
              </div>
            </div>

            <div
              className="notification-message"
              style={{
                background: "#fff3cd",
                border: "1px solid #ffeaa7",
                borderRadius: "8px",
                padding: "15px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <div className="warning-icon" style={{ fontSize: "24px" }}>
                ⚠️
              </div>
              <div className="message-text">
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontWeight: "bold",
                    color: "#856404",
                  }}
                >
                  Vaccine này đã được tiêm cho học sinh!
                </p>
                <p style={{ margin: "0 0 10px 0", color: "#856404" }}>
                  Thông tin tiêm chủng đã được ghi nhận trong hệ thống và không
                  thể thay đổi.
                </p>
                <p style={{ margin: "0", color: "#856404" }}>
                  Nếu có thắc mắc, vui lòng liên hệ với y tế trường.
                </p>
              </div>
            </div>
          </div>

          <div
            className="modal-footer"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <button
              className="btn-understood"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                minWidth: "120px",
              }}
              onClick={() => {
                console.log("Understood button clicked"); // Debug log
                setShowVaccineAlreadyTakenModal(false);
              }}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    );

    // Sử dụng createPortal để render modal ngoài component tree
    return createPortal(modalContent, document.body);
  };

  // Render thông báo thành công
  const renderSuccessMessage = () => {
    if (!showSuccessMessage) return null;

    return (
      <div className="success-message">
        <div className="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="11" fill="#4CAF50" />
            <path
              fill="#FFFFFF"
              d="M9.75 15.46l-3.15-3.15a.996.996 0 00-1.41 0 .996.996 0 000 1.41l3.86 3.86c.39.39 1.02.39 1.41 0l8.54-8.54a.996.996 0 000-1.41.996.996 0 00-1.41 0l-7.84 7.83z"
            />
          </svg>
        </div>
        <h3>Cập nhật hồ sơ sức khỏe thành công!</h3>
        <p>Thông tin sức khỏe và tiêm chủng của học sinh đã được cập nhật</p>
      </div>
    );
  };

  // Render thông báo lỗi server
  const renderServerError = () => {
    if (!isServerError) return null;

    return (
      <div className="server-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h4>Kết nối máy chủ không ổn định</h4>
          <p>
            Hệ thống đang gặp vấn đề kết nối đến máy chủ. Dữ liệu có thể không
            được lưu trữ đầy đủ.
          </p>
        </div>
      </div>
    );
  };

  // Render danh sách vaccine để chọn
  const renderVaccineSelection = () => {
    if (isLoadingVaccines) {
      return (
        <div className="loading-spinner">Đang tải danh sách vaccine...</div>
      );
    }

    if (vaccinesError) {
      return <div className="error-message">{vaccinesError}</div>;
    }

    return (
      <div className="vaccine-selection-section">
        <h3>Thông tin tiêm chủng</h3>
        <p className="help-text">
          Chọn các loại vaccine mà học sinh đã tiêm. Phụ huynh có thể bỏ trống
          hoặc chọn vaccine đã tiêm. Thông tin này giúp nhà trường theo dõi tình
          trạng tiêm chủng của học sinh.
          <br />
          <strong>Lưu ý:</strong> Những vaccine đã được ghi nhận trong hệ thống
          (có dấu ✓ Đã tiêm) không thể thay đổi và chỉ có thể xem thông tin.
        </p>

        <div className="vaccines-grid">
          {vaccines.map((vaccine) => {
            const isVaccinatedFromServer = vaccinatedFromServer.includes(
              vaccine.id
            );
            const isSelected = selectedVaccines.includes(vaccine.id);

            return (
              <div
                key={vaccine.id}
                className={`vaccine-item ${isSelected ? "selected" : ""} ${
                  isVaccinatedFromServer ? "vaccinated-from-server" : ""
                }`}
              >
                <div className="vaccine-header">
                  <input
                    type="checkbox"
                    id={`vaccine-${vaccine.id}`}
                    checked={isSelected}
                    onChange={() => handleVaccineChange(vaccine.id)}
                    disabled={isVaccinatedFromServer}
                  />
                  <label htmlFor={`vaccine-${vaccine.id}`}>
                    {vaccine.name}
                    {isVaccinatedFromServer && (
                      <span className="vaccinated-badge">✓ Đã tiêm</span>
                    )}
                  </label>
                </div>

                <div className="vaccine-description">{vaccine.description}</div>

                <div className="vaccine-info">
                  <span>Số liều: {vaccine.totalDoses}</span>
                  <span>Khoảng cách: {vaccine.intervalDays} ngày</span>
                  <span>
                    Độ tuổi: {vaccine.minAgeMonths}-{vaccine.maxAgeMonths} tháng
                  </span>
                  <span
                    className={`vaccine-status ${
                      vaccine.isActive ? "active" : "inactive"
                    }`}
                  >
                    {vaccine.isActive ? "Đang sử dụng" : "Ngừng sử dụng"}
                  </span>
                </div>

                {isSelected && (
                  <div className="vaccine-details">
                    <div
                      className="vaccine-administered-at"
                      style={{ marginBottom: "15px" }}
                    >
                      <label htmlFor={`administered-at-${vaccine.id}`}>
                        Địa điểm tiêm: <span className="required">*</span>
                      </label>
                      <select
                        id={`administered-at-${vaccine.id}`}
                        value={
                          vaccineAdministeredAt[vaccine.id] || "Trường học"
                        }
                        onChange={(e) =>
                          handleVaccineAdministeredAtChange(vaccine.id, e)
                        }
                        disabled={isVaccinatedFromServer}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                      >
                        <option value="Trường học">Trường học</option>
                        <option value="Bệnh viện">Bệnh viện</option>
                        <option value="Trạm y tế">Trạm y tế</option>
                        <option value="Phòng khám tư">Phòng khám tư</option>
                        <option value="Trung tâm y tế">Trung tâm y tế</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="vaccine-notes">
                      <label htmlFor={`notes-${vaccine.id}`}>
                        Ghi chú của phụ huynh:
                      </label>
                      <textarea
                        id={`notes-${vaccine.id}`}
                        placeholder={
                          isVaccinatedFromServer
                            ? "Vaccine đã tiêm - chỉ có thể xem thông tin"
                            : "Thông tin bổ sung về tiêm chủng: ngày tiêm cụ thể, phản ứng (nếu có), bác sĩ tiêm..."
                        }
                        value={vaccineNotes[vaccine.id] || ""}
                        onChange={(e) => handleVaccineNoteChange(vaccine.id, e)}
                        disabled={isVaccinatedFromServer}
                        style={{
                          width: "100%",
                          minHeight: "80px",
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "14px",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {vaccines.length === 0 && !isLoadingVaccines && (
          <div className="no-vaccines-message">
            <p>Chưa có vaccine nào trong hệ thống.</p>
          </div>
        )}
      </div>
    );
  };

  // Render validation summary
  const renderValidationSummary = () => {
    if (Object.keys(formErrors).length === 0) return null;

    return (
      <div className="validation-summary error-message">
        <h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Có {Object.keys(formErrors).length} lỗi cần sửa:
        </h3>
        <ul>
          {Object.entries(formErrors).map(([fieldName, errorMessage]) => {
            const fieldLabels = {
              studentId: "Học sinh",
              bloodType: "Nhóm máu",
              height: "Chiều cao",
              weight: "Cân nặng",
              visionLeft: "Thị lực mắt trái",
              visionRight: "Thị lực mắt phải",
              hearingStatus: "Tình trạng thính lực",
              lastPhysicalExamDate: "Ngày kiểm tra sức khỏe gần nhất",
              emergencyContactInfo: "Thông tin liên lạc khẩn cấp",
              allergies: "Dị ứng",
              chronicDiseases: "Bệnh mãn tính",
              dietaryRestrictions: "Hạn chế ăn uống",
              specialNeeds: "Nhu cầu đặc biệt",
            };

            return (
              <li key={fieldName}>
                <strong>{fieldLabels[fieldName] || fieldName}:</strong>{" "}
                {errorMessage}
                <button
                  type="button"
                  className="error-goto-button"
                  onClick={() => {
                    const element =
                      document.getElementById(fieldName) ||
                      document.querySelector(`[name="${fieldName}"]`);
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      element.focus();
                    }
                  }}
                >
                  Đi tới
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Hàm tính character count với cảnh báo
  const getCharacterCountInfo = (text, maxLength) => {
    const currentLength = text ? text.length : 0;
    const remaining = maxLength - currentLength;
    const isNearLimit = remaining <= maxLength * 0.1; // Cảnh báo khi còn 10%

    return {
      currentLength,
      remaining,
      isNearLimit,
      isOverLimit: remaining < 0,
    };
  };

  // Render character counter
  const renderCharacterCounter = (text, maxLength, fieldName) => {
    const info = getCharacterCountInfo(text, maxLength);

    return (
      <div
        className={`char-count ${info.isNearLimit ? "warning" : ""} ${
          info.isOverLimit ? "error" : ""
        }`}
      >
        {info.currentLength}/{maxLength} ký tự
        {info.isNearLimit && !info.isOverLimit && (
          <span className="char-warning"> - Sắp đạt giới hạn!</span>
        )}
        {info.isOverLimit && (
          <span className="char-error"> - Vượt quá giới hạn!</span>
        )}
      </div>
    );
  };

  // Hàm helper để validate email (nếu có trong emergency contact)
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Hàm helper để validate phone number (Việt Nam)
  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // Hàm hiển thị tooltip cho validation
  const renderFieldTooltip = (fieldName) => {
    const tooltips = {
      height: "Chiều cao được tính bằng cm, từ 30cm đến 300cm",
      weight: "Cân nặng được tính bằng kg, từ 5kg đến 500kg",
      emergencyContactInfo:
        "Cần ít nhất 10 ký tự. Nên bao gồm số điện thoại và tên người liên hệ",
      lastPhysicalExamDate:
        "Ngày kiểm tra sức khỏe không được trong tương lai và không quá 5 năm",
      allergies: "Mô tả chi tiết các loại dị ứng mà học sinh có (nếu có)",
      chronicDiseases: "Liệt kê các bệnh mãn tính mà học sinh đang mắc phải",
      dietaryRestrictions:
        "Những hạn chế về ăn uống do tôn giáo, sức khỏe hoặc lý do khác",
      specialNeeds:
        "Các nhu cầu đặc biệt trong việc chăm sóc, học tập của học sinh",
    };

    if (!tooltips[fieldName]) return null;

    return (
      <span className="field-tooltip" title={tooltips[fieldName]}>
        ℹ️
      </span>
    );
  };

  // Real-time validation cho các trường specific
  const handleRealTimeValidation = (fieldName, value) => {
    const errors = { ...formErrors };

    switch (fieldName) {
      case "height":
        if (value && value !== "") {
          const height = parseFloat(value);
          if (isNaN(height)) {
            errors.height = "Chiều cao phải là số";
          } else if (height < 30) {
            errors.height = "Chiều cao quá thấp (tối thiểu 30cm)";
          } else if (height > 300) {
            errors.height = "Chiều cao quá cao (tối đa 300cm)";
          } else {
            delete errors.height;
          }
        } else {
          delete errors.height;
        }
        break;

      case "weight":
        if (value && value !== "") {
          const weight = parseFloat(value);
          if (isNaN(weight)) {
            errors.weight = "Cân nặng phải là số";
          } else if (weight < 5) {
            errors.weight = "Cân nặng quá nhẹ (tối thiểu 5kg)";
          } else if (weight > 500) {
            errors.weight = "Cân nặng quá nặng (tối đa 500kg)";
          } else {
            delete errors.weight;
          }
        } else {
          delete errors.weight;
        }
        break;

      case "emergencyContactInfo":
        if (value && value.trim() !== "") {
          if (value.trim().length < 10) {
            errors.emergencyContactInfo =
              "Thông tin liên lạc khẩn cấp quá ngắn (tối thiểu 10 ký tự)";
          } else {
            delete errors.emergencyContactInfo;
          }
        } else {
          errors.emergencyContactInfo =
            "Vui lòng nhập thông tin liên lạc khẩn cấp";
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
  };

  // Tính toán progress của form
  const calculateFormProgress = () => {
    const { healthProfile } = formData;
    const requiredFields = [
      "bloodType",
      "visionLeft",
      "visionRight",
      "hearingStatus",
      "lastPhysicalExamDate",
      "emergencyContactInfo",
    ];

    const optionalFields = [
      "height",
      "weight",
      "allergies",
      "chronicDiseases",
      "dietaryRestrictions",
      "specialNeeds",
    ];

    let completedRequired = 0;
    let completedOptional = 0;

    requiredFields.forEach((field) => {
      if (
        healthProfile[field] &&
        healthProfile[field].toString().trim() !== ""
      ) {
        completedRequired++;
      }
    });

    optionalFields.forEach((field) => {
      if (
        healthProfile[field] &&
        healthProfile[field].toString().trim() !== ""
      ) {
        completedOptional++;
      }
    });

    const requiredProgress = (completedRequired / requiredFields.length) * 80; // 80% for required
    const optionalProgress = (completedOptional / optionalFields.length) * 20; // 20% for optional

    return Math.round(requiredProgress + optionalProgress);
  };

  // Render progress indicator
  const renderFormProgress = () => {
    const progress = calculateFormProgress();
    const isComplete = progress === 100;

    return (
      <div className="form-progress-container">
        <div className="form-progress-header">
          <span className="progress-label">Tiến độ hoàn thành form</span>
          <span
            className={`progress-percentage ${isComplete ? "complete" : ""}`}
          >
            {progress}%
          </span>
        </div>
        <div className="form-progress">
          <div
            className="form-progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {progress < 100 && (
          <div className="progress-hint">
            Vui lòng điền đầy đủ thông tin bắt buộc (có dấu{" "}
            <span className="required">*</span>)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="health-declaration-container">
      <ToastContainer position="top-right" autoClose={5000} />

      {renderServerError()}
      {renderSuccessMessage()}
      {renderValidationSummary()}
      {renderVaccineAlreadyTakenModal()}

      <div className="page-header">
        <h1>Khai báo sức khỏe học sinh</h1>
        <p>
          Cập nhật thông tin sức khỏe và tiêm chủng của học sinh để nhà trường
          có thể chăm sóc tốt nhất. Phụ huynh có thể bỏ trống phần vaccine hoặc
          chọn những vaccine đã tiêm.
        </p>
      </div>

      {/* Form khai báo sức khỏe */}
      <form onSubmit={handleSubmit} className="health-declaration-form">
        {/* Form Progress */}
        {renderFormProgress()}

        {/* Validation Summary */}
        {renderValidationSummary()}
        {/* Student selector */}
        <div className="form-section">
          <h3>Thông tin học sinh</h3>

          <div className="student-selector">
            <label htmlFor="studentId">
              Chọn học sinh: <span className="required">*</span>
              {formErrors.studentId && (
                <span className="error-text">{formErrors.studentId}</span>
              )}
            </label>
            <select
              id="studentId"
              value={formData.healthProfile.id}
              onChange={handleStudentChange}
              disabled={isSubmitting || studentsLoading}
              className={formErrors.studentId ? "error" : ""}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} - Lớp {student.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Health Profile Information */}
        <div className="form-section">
          <h3>Thông tin sức khỏe cơ bản</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodType">
                Nhóm máu: <span className="required">*</span>
                {formErrors.bloodType && (
                  <span className="error-text">{formErrors.bloodType}</span>
                )}
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.healthProfile.bloodType}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={formErrors.bloodType ? "error" : ""}
              >
                {BLOOD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="height">
                Chiều cao (cm): {renderFieldTooltip("height")}
                {formErrors.height && (
                  <span className="error-text">{formErrors.height}</span>
                )}
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.healthProfile.height}
                onChange={handleInputChange}
                min="30"
                max="300"
                step="0.1"
                disabled={isSubmitting}
                placeholder="Ví dụ: 150"
                className={formErrors.height ? "error" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">
                Cân nặng (kg): {renderFieldTooltip("weight")}
                {formErrors.weight && (
                  <span className="error-text">{formErrors.weight}</span>
                )}
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.healthProfile.weight}
                onChange={handleInputChange}
                min="5"
                max="500"
                step="0.1"
                disabled={isSubmitting}
                placeholder="Ví dụ: 45"
                className={formErrors.weight ? "error" : ""}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="visionLeft">
                Thị lực mắt trái: <span className="required">*</span>
                {formErrors.visionLeft && (
                  <span className="error-text">{formErrors.visionLeft}</span>
                )}
              </label>
              <select
                id="visionLeft"
                name="visionLeft"
                value={formData.healthProfile.visionLeft}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={formErrors.visionLeft ? "error" : ""}
              >
                {VISION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="visionRight">
                Thị lực mắt phải: <span className="required">*</span>
                {formErrors.visionRight && (
                  <span className="error-text">{formErrors.visionRight}</span>
                )}
              </label>
              <select
                id="visionRight"
                name="visionRight"
                value={formData.healthProfile.visionRight}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={formErrors.visionRight ? "error" : ""}
              >
                {VISION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hearingStatus">
                Tình trạng thính lực: <span className="required">*</span>
                {formErrors.hearingStatus && (
                  <span className="error-text">{formErrors.hearingStatus}</span>
                )}
              </label>
              <select
                id="hearingStatus"
                name="hearingStatus"
                value={formData.healthProfile.hearingStatus}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={formErrors.hearingStatus ? "error" : ""}
              >
                {HEARING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Thông tin y tế bổ sung</h3>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="allergies">
                Dị ứng (nếu có):
                {formErrors.allergies && (
                  <span className="error-text">{formErrors.allergies}</span>
                )}
              </label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.healthProfile.allergies}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Liệt kê các dị ứng của học sinh (tối đa 500 ký tự)"
                maxLength="500"
                className={formErrors.allergies ? "error" : ""}
              ></textarea>
              {renderCharacterCounter(
                formData.healthProfile.allergies,
                500,
                "allergies"
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="chronicDiseases">
                Bệnh mãn tính (nếu có):
                {formErrors.chronicDiseases && (
                  <span className="error-text">
                    {formErrors.chronicDiseases}
                  </span>
                )}
              </label>
              <textarea
                id="chronicDiseases"
                name="chronicDiseases"
                value={formData.healthProfile.chronicDiseases}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Thông tin về các bệnh mãn tính (tối đa 500 ký tự)"
                maxLength="500"
                className={formErrors.chronicDiseases ? "error" : ""}
              ></textarea>
              {renderCharacterCounter(
                formData.healthProfile.chronicDiseases,
                500,
                "chronicDiseases"
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="dietaryRestrictions">
                Hạn chế về ăn uống:
                {formErrors.dietaryRestrictions && (
                  <span className="error-text">
                    {formErrors.dietaryRestrictions}
                  </span>
                )}
              </label>
              <textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formData.healthProfile.dietaryRestrictions}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Thông tin về các hạn chế trong chế độ ăn uống của học sinh (tối đa 500 ký tự)"
                maxLength="500"
                className={formErrors.dietaryRestrictions ? "error" : ""}
              ></textarea>
              {renderCharacterCounter(
                formData.healthProfile.dietaryRestrictions,
                500,
                "dietaryRestrictions"
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="emergencyContactInfo">
                Thông tin liên lạc khẩn cấp: <span className="required">*</span>{" "}
                {renderFieldTooltip("emergencyContactInfo")}
                {formErrors.emergencyContactInfo && (
                  <span className="error-text">
                    {formErrors.emergencyContactInfo}
                  </span>
                )}
              </label>
              <textarea
                id="emergencyContactInfo"
                name="emergencyContactInfo"
                value={formData.healthProfile.emergencyContactInfo}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Số điện thoại và thông tin liên lạc trong trường hợp khẩn cấp (bắt buộc, tối thiểu 10 ký tự)"
                className={formErrors.emergencyContactInfo ? "error" : ""}
              ></textarea>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lastPhysicalExamDate">
                Ngày kiểm tra sức khỏe gần nhất:{" "}
                <span className="required">*</span>{" "}
                {renderFieldTooltip("lastPhysicalExamDate")}
                {formErrors.lastPhysicalExamDate && (
                  <span className="error-text">
                    {formErrors.lastPhysicalExamDate}
                  </span>
                )}
              </label>
              <input
                type="date"
                id="lastPhysicalExamDate"
                name="lastPhysicalExamDate"
                value={formData.healthProfile.lastPhysicalExamDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
                max={new Date().toISOString().split("T")[0]}
                className={formErrors.lastPhysicalExamDate ? "error" : ""}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="specialNeeds">
                Nhu cầu đặc biệt (nếu có):
                {formErrors.specialNeeds && (
                  <span className="error-text">{formErrors.specialNeeds}</span>
                )}
              </label>
              <textarea
                id="specialNeeds"
                name="specialNeeds"
                value={formData.healthProfile.specialNeeds}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Thông tin về các nhu cầu đặc biệt của học sinh (tối đa 500 ký tự)"
                maxLength="500"
                className={formErrors.specialNeeds ? "error" : ""}
              ></textarea>
              <small className="char-count">
                {formData.healthProfile.specialNeeds?.length || 0}/500 ký tự
              </small>
            </div>
          </div>
        </div>

        {/* Vaccine selection section */}
        {renderVaccineSelection()}

        {/* Submit button */}
        <div className="form-actions">
          {/* Debug button - chỉ hiển thị khi đang develop */}
          {process.env.NODE_ENV === "development" && (
            <>
              <button
                type="button"
                onClick={() => {
                  console.log("=== DEBUG FORM DATA ===");
                  console.log("Form Data:", formData);
                  console.log("Selected Vaccines:", selectedVaccines);
                  console.log("Vaccine Notes:", vaccineNotes);
                  console.log(
                    "Vaccine Administered At:",
                    vaccineAdministeredAt
                  );
                  console.log("Vaccinated From Server:", vaccinatedFromServer);
                  console.log("Form Errors:", formErrors);
                  console.log("Is Submitting:", isSubmitting);
                  console.log("Auth Token:", localStorage.getItem("authToken"));
                }}
                style={{
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ccc",
                  padding: "8px 16px",
                  marginRight: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🐛 Debug Data
              </button>

              <button
                type="button"
                onClick={() => {
                  console.log("=== TESTING MODAL ===");
                  const testVaccine = {
                    id: 999,
                    name: "Test Vaccine Modal",
                    description: "Đây là test để kiểm tra modal hiển thị",
                    totalDoses: 2,
                    intervalDays: 30,
                    minAgeMonths: 6,
                    maxAgeMonths: 60,
                  };
                  showVaccineAlreadyTakenNotification(testVaccine);
                }}
                style={{
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  marginRight: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🧪 Test Modal
              </button>
            </>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang gửi dữ liệu..."
              : "Cập nhật khai báo sức khỏe"}
          </button>
        </div>

        {/* Progress bar */}
        {renderFormProgress()}
      </form>
    </div>
  );
};

export default HealthDeclaration;
