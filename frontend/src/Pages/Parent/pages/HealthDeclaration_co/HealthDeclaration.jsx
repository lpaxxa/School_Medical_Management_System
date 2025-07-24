import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import api from "../../../../services/api";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./HealthDeclarationModern.css";

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
  { value: "6/6", label: "6/6 (Bình thường)" },
  { value: "20/20", label: "20/20 (Bình thường)" },
  { value: "6/9", label: "6/9 (Cận thị nhẹ)" },
  { value: "20/30", label: "20/30 (Cận thị nhẹ)" },
  { value: "6/12", label: "6/12 (Cận thị vừa)" },
  { value: "20/40", label: "20/40 (Cận thị vừa)" },
  { value: "6/18", label: "6/18 (Cận thị nặng)" },
  { value: "20/60", label: "20/60 (Cận thị nặng)" },
  { value: "6/24", label: "6/24 (Kém hơn)" },
  { value: "20/80", label: "20/80 (Kém hơn)" },
  { value: "6/60", label: "6/60 (Kém nhiều)" },
  { value: "20/200", label: "20/200 (Kém nhiều)" },
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

  // Helper function để xử lý dữ liệu từ API
  const processFormData = (data) => {
    const processedData = { ...data };

    // Các trường "Thông tin y tế bổ sung" - luôn để trống cho người dùng tự nhập
    const additionalHealthFields = [
      "allergies",
      "chronicDiseases",
      "dietaryRestrictions",
      "specialNeeds",
      "emergencyContactInfo",
    ];

    // Các giá trị cần được coi là "rỗng" và chuyển thành chuỗi trống (chỉ áp dụng cho phần bổ sung)
    const emptyValues = [
      "Không có",
      "Chưa có",
      "Không",
      "None",
      "N/A",
      "null",
      "undefined",
      "Chưa cập nhật",
      "Trống",
    ];

    // Xử lý các trường "Thông tin y tế bổ sung" - luôn để trống để người dùng tự nhập
    additionalHealthFields.forEach((field) => {
      // Luôn để trống các trường bổ sung để người dùng tự nhập
      processedData[field] = "";
    });

    // Các trường "Thông tin sức khỏe cơ bản" - giữ nguyên dữ liệu từ API làm text mẫu
    const basicHealthFields = [
      "height",
      "weight",
      "bloodType",
      "visionLeft",
      "visionRight",
      "hearingStatus",
      "lastPhysicalExamDate",
    ];

    // Giữ nguyên các trường cơ bản từ API - KHÔNG xóa dữ liệu
    // Chỉ xử lý khi dữ liệu thực sự rỗng hoặc null
    basicHealthFields.forEach((field) => {
      if (processedData[field] === null || processedData[field] === undefined) {
        processedData[field] = "";
      }
      // Giữ nguyên tất cả dữ liệu khác từ API, kể cả "Không có", "Chưa có"...
      // vì đây là thông tin thực tế từ hồ sơ y tế
    });

    return processedData;
  };

  // State quản lý trạng thái
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServerError, setIsServerError] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // State hiển thị thông báo thành công
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // State lưu trữ ID số từ API (dùng cho submit)
  const [studentNumericId, setStudentNumericId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    healthProfile: {
      id: "", // Sử dụng string rỗng vì studentId từ context là string (HS001, HS002, etc.)
      bloodType: "A",
      height: "",
      weight: "",
      allergies: "",
      chronicDiseases: "",
      visionLeft: "Chưa kiểm tra",
      visionRight: "Chưa kiểm tra",
      hearingStatus: "",
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

  // State cho vaccine đã tiêm đủ liều (không cho phép chọn thêm)
  const [fullyVaccinatedVaccines, setFullyVaccinatedVaccines] = useState([]);

  // State cho thông tin vaccine mới chọn
  const [vaccineNotes, setVaccineNotes] = useState({});
  const [vaccineAdministeredAt, setVaccineAdministeredAt] = useState({});

  // State cho modal thông báo vaccine đã tiêm
  const [showVaccineAlreadyTakenModal, setShowVaccineAlreadyTakenModal] =
    useState(false);
  const [selectedVaccineInfo, setSelectedVaccineInfo] = useState(null);

  // Ref để theo dõi nếu component đã unmount
  const isMounted = useRef(true);
  // Ref để theo dõi nếu đã load dữ liệu ban đầu
  const initialDataLoaded = useRef(false);

  // Hiển thị thông báo thành công
  const showSuccessToast = (message) => {
    if (!isMounted.current) return;

    const toastOptions = {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: true,
    };

    try {
      toast.success(message, toastOptions);
    } catch (error) {
      // Silent error handling
    }
  };

  // Hiển thị thông báo lỗi
  const showErrorToast = (message) => {
    if (!isMounted.current) return;

    const toastOptions = {
      position: "top-center",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: true,
    };

    try {
      toast.error(message, toastOptions);
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  };

  // Hiển thị thông báo thông tin
  const showInfoToast = (message) => {
    if (!isMounted.current) return;

    const toastOptions = {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: true,
    };

    try {
      toast.info(message, toastOptions);
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  };

  // Hiển thị thông báo cảnh báo
  const showWarningToast = (message) => {
    if (!isMounted.current) return;

    const toastOptions = {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      closeButton: true,
    };

    try {
      toast.warning(message, toastOptions);
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  };

  // Theo dõi khi component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      initialDataLoaded.current = false;
    };
  }, []);

  // Fetch danh sách vaccine từ API
  useEffect(() => {
    const fetchVaccines = async () => {
      if (!isMounted.current) return;

      setIsLoadingVaccines(true);
      setVaccinesError(null);
      try {
        // Sử dụng endpoint chính xác như yêu cầu
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/vaccines/getAllVaccine`
        );
        if (isMounted.current) {
          setVaccines(response.data);
        }
      } catch (error) {
        if (!isMounted.current) return;

        // Better error handling for vaccine fetching
        if (error.response?.status === 500) {
          setVaccinesError(
            "Hệ thống backend đang gặp sự cố. Không thể tải danh sách vaccine."
          );
        } else if (error.response?.status === 401) {
          setVaccinesError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "NETWORK_ERROR"
        ) {
          setVaccinesError(
            "Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          setVaccinesError(
            "Không thể tải danh sách vaccine. Vui lòng thử lại sau."
          );
        }
        setIsServerError(true);
      } finally {
        if (isMounted.current) {
          setIsLoadingVaccines(false);
        }
      }
    };

    fetchVaccines();
  }, []);

  // Memoize fetchStudentHealthProfile function to avoid recreating it on each render
  const fetchStudentHealthProfile = useCallback(
    async (studentId) => {
      if (!isMounted.current) return;

      setIsLoading(true);
      setFetchError(null);
      try {
        // Lấy thông tin hồ sơ sức khỏe đầy đủ từ API
        // studentId đã có định dạng đúng từ context (HS001, HS002, etc.)
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/health-profiles/getStudentProfileByID/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!isMounted.current) return;

        if (response.data && response.data.healthProfile) {
          const healthProfileData = response.data.healthProfile;

          // Lưu ID số từ API để sử dụng khi submit
          setStudentNumericId(healthProfileData.id);

          // Lọc và xử lý dữ liệu từ API
          const processedData = processFormData(healthProfileData);

          // Cập nhật form data với thông tin đã được xử lý
          setFormData((prevState) => ({
            ...prevState,
            healthProfile: {
              ...prevState.healthProfile,
              ...processedData,
              id: studentId, // Đảm bảo ID học sinh không bị ghi đè
            },
          }));

          // Nếu có thông tin vaccine trong response, cập nhật selected vaccines
          if (
            response.data.vaccinations &&
            response.data.vaccinations.length > 0
          ) {
            // Tạo danh sách tên vaccine đã tiêm
            const vaccinatedNames = response.data.vaccinations.map(
              (v) => v.vaccineName
            );

            // Phân loại vaccine: đã tiêm vs đã tiêm đủ liều
            const vaccinatedIds = [];
            const fullyVaccinatedIds = [];

            // Lưu thông tin vaccine đã tiêm theo tên
            const vaccinatedNameMap = {};
            response.data.vaccinations.forEach((v) => {
              vaccinatedNameMap[v.vaccineName] = true;
            });

            // Tìm ID của vaccine dựa trên tên vaccine
            if (vaccines.length > 0) {
              vaccines.forEach((vaccine) => {
                if (vaccinatedNameMap[vaccine.name]) {
                  // Nếu tên vaccine có trong danh sách đã tiêm
                  vaccinatedIds.push(vaccine.id);
                }
              });
            }

            // Cập nhật states
            setSelectedVaccines([...vaccinatedIds, ...fullyVaccinatedIds]);
            setVaccinatedFromServer(vaccinatedIds);
            setFullyVaccinatedVaccines(fullyVaccinatedIds);

            // Cập nhật vaccine notes
            const notes = {};
            const administeredAts = {};
            response.data.vaccinations.forEach((v) => {
              // Tìm vaccine ID dựa trên tên
              const matchingVaccine = vaccines.find(
                (vaccine) => vaccine.name === v.vaccineName
              );
              if (matchingVaccine) {
                if (v.parentNotes) {
                  notes[matchingVaccine.id] = v.parentNotes;
                }
                if (v.administeredAt) {
                  administeredAts[matchingVaccine.id] = v.administeredAt;
                }
              }
            });
            setVaccineNotes(notes);
            setVaccineAdministeredAt(administeredAts);

            // Cập nhật form data vaccinations với định dạng mới
            const formVaccinations = [];
            response.data.vaccinations.forEach((v) => {
              // Tìm vaccine ID dựa trên tên
              const matchingVaccine = vaccines.find(
                (vaccine) => vaccine.name === v.vaccineName
              );
              if (matchingVaccine) {
                formVaccinations.push({
                  vaccineId: matchingVaccine.id,
                  vaccinationDate: v.vaccinationDate
                    ? new Date(v.vaccinationDate).toISOString()
                    : new Date().toISOString(),
                  administeredAt: v.administeredAt || "string",
                  notes: v.notes || "string",
                  parentNotes: v.parentNotes || "string",
                });
              }
            });

            setFormData((prevState) => ({
              ...prevState,
              vaccinations: formVaccinations,
            }));
          } else {
            // Reset nếu không có vaccine nào đã tiêm
            setVaccinatedFromServer([]);
            setFullyVaccinatedVaccines([]);
          }
        }

        // Mark that initial data has been loaded
        initialDataLoaded.current = true;
      } catch (error) {
        if (!isMounted.current) return;

        // Better error handling for different scenarios
        if (error.response?.status === 500) {
          setFetchError(
            "Hệ thống backend đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ admin."
          );
        } else if (error.response?.status === 404) {
          setFetchError(
            "Không tìm thấy thông tin học sinh. Dữ liệu sẽ được tạo mới."
          );
        } else if (error.response?.status === 401) {
          setFetchError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else if (
          error.code === "ECONNREFUSED" ||
          error.code === "NETWORK_ERROR"
        ) {
          setFetchError(
            "Không thể kết nối với server. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          setFetchError(
            "Không thể tải thông tin sức khỏe. Dữ liệu sẽ được tạo mới."
          );
        }

        // Reset states when error occurs
        setVaccinatedFromServer([]);
        setFullyVaccinatedVaccines([]);
        setStudentNumericId(null);

        // Mark that initial data has been loaded even if there was an error
        initialDataLoaded.current = true;
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [vaccines]
  );

  // Khi danh sách học sinh được tải xong, chọn học sinh đầu tiên
  useEffect(() => {
    if (
      students.length > 0 &&
      (formData.healthProfile.id === "" || formData.healthProfile.id === 0)
    ) {
      const firstStudent = students[0];
      const studentId = firstStudent.studentId || firstStudent.id;

      // Reset form về trạng thái ban đầu với student ID đầu tiên
      setFormData((prevState) => ({
        ...prevState,
        healthProfile: {
          id: studentId,
          bloodType: "A",
          height: "",
          weight: "",
          visionLeft: "Chưa kiểm tra",
          visionRight: "Chưa kiểm tra",
          hearingStatus: "",
          lastPhysicalExamDate: new Date().toISOString().split("T")[0],
          immunizationStatus: "",
          // Các trường bổ sung luôn để trống để người dùng tự nhập
          allergies: "",
          chronicDiseases: "",
          dietaryRestrictions: "",
          specialNeeds: "",
          emergencyContactInfo: "",
        },
      }));

      // Load hồ sơ y tế của học sinh này
      fetchStudentHealthProfile(studentId);
    }
  }, [students, fetchStudentHealthProfile]);

  // Add a useEffect to ensure data is loaded when vaccines are available
  useEffect(() => {
    if (
      vaccines.length > 0 &&
      students.length > 0 &&
      formData.healthProfile.id &&
      !initialDataLoaded.current
    ) {
      console.log("Triggering data load after vaccines are available");
      fetchStudentHealthProfile(formData.healthProfile.id);
    }
  }, [
    vaccines,
    students,
    formData.healthProfile.id,
    fetchStudentHealthProfile,
  ]);

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
    const studentId = e.target.value;
    if (!studentId) return;

    // Reset form về trạng thái ban đầu với student ID mới
    // Chỉ reset các trường "Thông tin y tế bổ sung" về trống
    setFormData((prevState) => ({
      ...prevState,
      healthProfile: {
        id: studentId,
        bloodType: "A",
        height: "",
        weight: "",
        visionLeft: "Chưa kiểm tra",
        visionRight: "Chưa kiểm tra",
        hearingStatus: "",
        lastPhysicalExamDate: new Date().toISOString().split("T")[0],
        immunizationStatus: "",
        // Các trường bổ sung luôn để trống để người dùng tự nhập
        allergies: "",
        chronicDiseases: "",
        dietaryRestrictions: "",
        specialNeeds: "",
        emergencyContactInfo: "",
      },
    }));

    // Reset selected vaccines and notes when changing student
    setSelectedVaccines([]);
    setVaccineNotes({});
    setVaccineAdministeredAt({});
    setVaccinatedFromServer([]); // Reset vaccine đã tiêm từ server
    setFullyVaccinatedVaccines([]); // Reset vaccine đã tiêm đủ liều
    setStudentNumericId(null); // Reset numeric ID

    // Tải thông tin sức khỏe của học sinh được chọn
    fetchStudentHealthProfile(studentId);
  };

  // Xử lý khi chọn/bỏ chọn vaccine
  const handleVaccineChange = async (vaccineId) => {
    // Tìm thông tin vaccine để hiển thị tên
    const vaccine = vaccines.find((v) => v.id === vaccineId);
    const vaccineName = vaccine ? vaccine.name : `Vaccine ID: ${vaccineId}`;

    // Kiểm tra xem vaccine này đã tiêm từ server chưa (không cho phép thay đổi)
    if (vaccinatedFromServer.includes(vaccineId)) {
      console.log("Vaccine already taken, showing modal for:", vaccine); // Debug log

      // Hiển thị modal thông báo chi tiết (chỉ khi có vaccine info)
      if (vaccine) {
        setSelectedVaccineInfo(vaccine);
        setShowVaccineAlreadyTakenModal(true);
        console.log("Modal should be shown for:", vaccine.name); // Debug log
      } else {
        console.log("No vaccine info found for ID:", vaccineId); // Debug log
      }

      // Hiển thị toast warning với thông tin chi tiết
      showWarningToast(
        `🚫 ${vaccineName} đã được tiêm trước đó và không thể thay đổi!`
      );

      // Log để debug
      console.log(
        `Attempted to change already vaccinated: ${vaccineName} (ID: ${vaccineId})`
      );
      return;
    }

    // Kiểm tra xem vaccine này đã tiêm đủ liều chưa (không cho phép thay đổi)
    if (fullyVaccinatedVaccines.includes(vaccineId)) {
      console.log(
        "Vaccine fully vaccinated, showing notification for:",
        vaccine
      ); // Debug log

      // Hiển thị modal thông báo chi tiết (chỉ khi có vaccine info)
      if (vaccine) {
        setSelectedVaccineInfo(vaccine);
        setShowVaccineAlreadyTakenModal(true);
        console.log("Modal should be shown for:", vaccine.name); // Debug log
      }

      // Hiển thị toast warning với thông tin chi tiết
      showWarningToast(
        `🚫 ${vaccineName} đã tiêm đủ liều theo quy định và không thể thay đổi!`
      );

      // Log để debug
      console.log(
        `Attempted to change fully vaccinated: ${vaccineName} (ID: ${vaccineId})`
      );
      return;
    }

    try {
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

        // Hiển thị thông báo bỏ chọn
        showInfoToast(`📋 Đã bỏ chọn vaccine: ${vaccineName}`);
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
              administeredAt: "Trường học", // Mặc định "Trường học"
              notes: "",
              parentNotes: "", // Khởi tạo ghi chú trống
            },
          ],
        }));

        // Đặt địa điểm tiêm mặc định
        setVaccineAdministeredAt((prev) => ({
          ...prev,
          [vaccineId]: "Trường học",
        }));

        // Khởi tạo ghi chú trống cho vaccine mới
        setVaccineNotes((prev) => ({
          ...prev,
          [vaccineId]: "",
        }));

        // Hiển thị thông báo thành công ngay lập tức
        showSuccessToast(`✅ Đã chọn vaccine: ${vaccineName}`);

        // TODO: Gọi API thông báo chọn vaccine (tạm thời comment out để tránh lỗi 400)
        // Sẽ được xử lý trong phần submit form chính
        if (studentNumericId) {
          console.log(
            `Vaccine ${vaccineName} selected for student ${studentNumericId}. Notification will be sent during form submission.`
          );
          // try {
          //   const notificationData = {
          //     studentId: studentNumericId, // Sử dụng ID số
          //     vaccineId: vaccineId,
          //     recipientType: "PARENT", // Hoặc theo yêu cầu hệ thống
          //     response: "ACCEPTED", // Thêm response mặc định
          //     responseDate: new Date().toISOString(), // Thêm ngày phản hồi
          //   };

          //   console.log(
          //     "Sending vaccine selection notification:",
          //     notificationData
          //   );

          //   await axios.post(
          //     `${
          //       import.meta.env.VITE_BACKEND_URL
          //     }/api/v1/notification-recipients`,
          //     notificationData,
          //     {
          //       headers: {
          //         "Content-Type": "application/json",
          //         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          //       },
          //     }
          //   );

          //   console.log(
          //     `Successfully notified vaccine selection: ${vaccineName}`
          //   );
          // } catch (error) {
          //   console.error(
          //     "Error sending vaccine selection notification:",
          //     error
          //   );
          //   // Chỉ log lỗi, không hiển thị thông báo cho user vì đây là tính năng phụ
          //   console.warn(
          //     `Notification API failed for vaccine ${vaccineName}, but selection is still valid.`
          //   );
          // }
        } else {
          console.warn(
            "No studentNumericId available, skipping notification API call"
          );
        }
      }
    } catch (error) {
      console.error("Error in vaccine selection:", error);
      showErrorToast(
        `❌ Có lỗi xảy ra khi chọn vaccine ${vaccineName}. Vui lòng thử lại.`
      );
    }
  };

  // Xử lý khi thay đổi ghi chú của vaccine
  const handleVaccineNoteChange = (vaccineId, e) => {
    const { value } = e.target;

    // Cập nhật state ghi chú
    setVaccineNotes((prev) => ({
      ...prev,
      [vaccineId]: value,
    }));

    // Cập nhật formData với ghi chú mới
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

    // Debug log để kiểm tra
    console.log(`Updated vaccine note for ${vaccineId}:`, value);
  };

  // Xử lý khi thay đổi địa điểm tiêm vaccine
  const handleVaccineAdministeredAtChange = (vaccineId, e) => {
    const { value } = e.target;

    // Cập nhật state địa điểm tiêm
    setVaccineAdministeredAt((prev) => ({
      ...prev,
      [vaccineId]: value,
    }));

    // Cập nhật formData với địa điểm tiêm mới
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

    // Debug log để kiểm tra
    console.log(`Updated vaccine location for ${vaccineId}:`, value);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const { healthProfile } = formData;

    console.log("Validating form data:", healthProfile); // Debug log

    // Validate student ID - bắt buộc
    if (
      !healthProfile.id ||
      healthProfile.id === "" ||
      healthProfile.id === 0
    ) {
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
      showErrorToast(
        `Có ${errorCount} lỗi cần sửa. Vui lòng kiểm tra form và sửa các lỗi được đánh dấu.`
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

    // Kiểm tra token đăng nhập
    const token = localStorage.getItem("authToken");
    if (!token) {
      showErrorToast(
        "Bạn cần đăng nhập để khai báo sức khỏe. Vui lòng đăng nhập lại!"
      );
      setIsSubmitting(false);
      return;
    }

    console.log("Form validation passed, submitting..."); // Debug log
    setIsSubmitting(true);

    // Kiểm tra xem có ID số để submit không
    if (!studentNumericId) {
      console.error("Missing numeric ID for submission");
      showErrorToast(
        "Thiếu ID học sinh để gửi dữ liệu. Vui lòng chọn lại học sinh!"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Before submitting, filter out any fully vaccinated or already vaccinated vaccines
      const filteredVaccinations = formData.vaccinations.filter(
        (vaccination) => {
          return (
            !vaccinatedFromServer.includes(vaccination.vaccineId) &&
            !fullyVaccinatedVaccines.includes(vaccination.vaccineId)
          );
        }
      );

      // Chuyển đổi dữ liệu theo format API chính xác từ Swagger
      const submissionData = {
        healthProfile: {
          id: studentNumericId, // ID số từ API
          bloodType: formData.healthProfile.bloodType || "Chưa xác định",
          height:
            formData.healthProfile.height &&
            formData.healthProfile.height !== ""
              ? parseFloat(formData.healthProfile.height)
              : 300, // Gửi 300 (default) nếu trống
          weight:
            formData.healthProfile.weight &&
            formData.healthProfile.weight !== ""
              ? parseFloat(formData.healthProfile.weight)
              : 500, // Gửi 500 (default) nếu trống
          allergies: formData.healthProfile.allergies || "string",
          chronicDiseases: formData.healthProfile.chronicDiseases || "string",
          visionLeft: formData.healthProfile.visionLeft || "Chưa kiểm tra",
          visionRight: formData.healthProfile.visionRight || "Chưa kiểm tra",
          hearingStatus: formData.healthProfile.hearingStatus || "string",
          dietaryRestrictions:
            formData.healthProfile.dietaryRestrictions || "string",
          emergencyContactInfo:
            formData.healthProfile.emergencyContactInfo || "Liên hệ phụ huynh",
          immunizationStatus:
            formData.healthProfile.immunizationStatus || "string",
          lastPhysicalExamDate:
            formData.healthProfile.lastPhysicalExamDate ||
            new Date().toISOString().split("T")[0],
          specialNeeds: formData.healthProfile.specialNeeds || "string",
          checkupStatus: "COMPLETED",
        },
        vaccinations: filteredVaccinations.map((vaccination) => ({
          vaccineId: vaccination.vaccineId,
          vaccinationDate: new Date(vaccination.vaccinationDate).toISOString(),
          administeredAt:
            vaccineAdministeredAt[vaccination.vaccineId] ||
            vaccination.administeredAt ||
            "Trường học",
          notes: vaccination.notes || "string",
          parentNotes:
            vaccineNotes[vaccination.vaccineId] ||
            vaccination.parentNotes ||
            "",
        })),
      };

      console.log("=== SUBMISSION DATA ===");
      console.log("Dữ liệu gửi đi:", JSON.stringify(submissionData, null, 2));
      console.log(`Using numeric ID: ${studentNumericId} for API submission`);
      console.log(
        `Total selected vaccinations: ${formData.vaccinations.length}`
      );
      console.log(
        `Filtered vaccinations count: ${filteredVaccinations.length}`
      );
      console.log(`Vaccinated from server: ${vaccinatedFromServer.length}`);
      console.log(`Fully vaccinated: ${fullyVaccinatedVaccines.length}`);
      console.log("=== VACCINE NOTES DEBUG ===");
      console.log("Current vaccineNotes state:", vaccineNotes);
      console.log(
        "Current vaccineAdministeredAt state:",
        vaccineAdministeredAt
      );
      filteredVaccinations.forEach((vaccination) => {
        console.log(`Vaccine ${vaccination.vaccineId}:`);
        console.log(
          `  - parentNotes from state: "${vaccineNotes[vaccination.vaccineId]}"`
        );
        console.log(
          `  - administeredAt from state: "${
            vaccineAdministeredAt[vaccination.vaccineId]
          }"`
        );
        console.log(
          `  - parentNotes in submission: "${
            vaccineNotes[vaccination.vaccineId] || vaccination.parentNotes || ""
          }"`
        );
      });
      console.log("================================");

      // Gọi API thực tế để cập nhật hồ sơ sức khỏe
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/health-profiles/full`,
          submissionData,
          {
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log("API response:", response);

        // Hiển thị thông báo thành công
        setShowSuccessMessage(true);

        if (isMounted.current) {
          showSuccessToast("Cập nhật hồ sơ sức khỏe thành công!");

          // Ẩn thông báo sau 5 giây
          setTimeout(() => {
            if (isMounted.current) {
              setShowSuccessMessage(false);
            }
          }, 5000);

          // Reset selected vaccines
          setSelectedVaccines([]);
          setVaccineNotes({});
          setVaccineAdministeredAt({});
          setFormData((prevState) => ({
            ...prevState,
            vaccinations: [],
          }));

          // Tự động reload dữ liệu sau khi cập nhật thành công
          setTimeout(() => {
            if (isMounted.current) {
              // Lấy ID học sinh hiện tại
              const currentStudentId = formData.healthProfile.id;
              console.log("Reloading data for student:", currentStudentId);

              // Reload dữ liệu hồ sơ sức khỏe
              fetchStudentHealthProfile(currentStudentId);

              // Hiển thị thông báo reload
              showInfoToast("Đang tải lại dữ liệu mới nhất...");
            }
          }, 1000); // Đợi 1 giây trước khi reload để đảm bảo dữ liệu đã được lưu trên server
        }
      } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
        console.error("Error details:", error.response?.data); // Debug log

        // Kiểm tra nếu lỗi liên quan đến chuyển đổi "full" thành Long
        if (
          error.response?.data?.message?.includes(
            "Failed to convert value of type 'java.lang.String' to required type 'java.lang.Long'; For input string: \"full\""
          )
        ) {
          console.error(
            "Phát hiện lỗi chuyển đổi 'full' thành Long, thử endpoint khác"
          );

          // Thử với endpoint khác
          try {
            const response = await axios.post(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/v1/health-profiles/${studentNumericId}`,
              submissionData,
              {
                headers: {
                  accept: "*/*",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );

            console.log("API response with alternative endpoint:", response);

            // Hiển thị thông báo thành công
            if (isMounted.current) {
              setShowSuccessMessage(true);
              showSuccessToast("Cập nhật hồ sơ sức khỏe thành công!");

              // Ẩn thông báo sau 5 giây
              setTimeout(() => {
                if (isMounted.current) {
                  setShowSuccessMessage(false);
                }
              }, 5000);

              // Reset selected vaccines
              setSelectedVaccines([]);
              setVaccineNotes({});
              setVaccineAdministeredAt({});
              setFormData((prevState) => ({
                ...prevState,
                vaccinations: [],
              }));

              // Tự động reload dữ liệu sau khi cập nhật thành công
              setTimeout(() => {
                if (isMounted.current) {
                  // Lấy ID học sinh hiện tại
                  const currentStudentId = formData.healthProfile.id;
                  console.log("Reloading data for student:", currentStudentId);

                  // Reload dữ liệu hồ sơ sức khỏe
                  fetchStudentHealthProfile(currentStudentId);

                  // Hiển thị thông báo reload
                  showInfoToast("Đang tải lại dữ liệu mới nhất...");
                }
              }, 1000); // Đợi 1 giây trước khi reload
            }

            return; // Thoát khỏi hàm nếu thành công
          } catch (secondError) {
            console.error("Lỗi khi thử endpoint thay thế:", secondError);
          }
        }

        if (isMounted.current) {
          setIsServerError(true);
        }

        // Kiểm tra nếu lỗi 400 có liên quan đến vaccine đã tiêm
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || "";

          // Nếu lỗi liên quan đến vaccine đã tiêm
          if (
            errorMessage.toLowerCase().includes("vaccine") ||
            errorMessage.toLowerCase().includes("tiêm") ||
            errorMessage.toLowerCase().includes("vaccination")
          ) {
            showErrorToast(
              "❌ Không thể cập nhật do có vaccine đã được tiêm trước đó trong danh sách. Hệ thống không cho phép thay đổi thông tin vaccine đã tiêm!"
            );

            // Tìm và hiển thị thông tin về vaccine đã tiêm
            const vaccinatedVaccines = formData.vaccinations.filter((v) =>
              vaccinatedFromServer.includes(v.vaccineId)
            );

            if (vaccinatedVaccines.length > 0) {
              const vaccineNames = vaccinatedVaccines
                .map((v) => {
                  const vaccine = vaccines.find(
                    (vac) => vac.id === v.vaccineId
                  );
                  return vaccine ? vaccine.name : `ID: ${v.vaccineId}`;
                })
                .join(", ");

              showInfoToast(
                `📋 Vaccine đã tiêm: ${vaccineNames}. Vui lòng bỏ chọn các vaccine này để có thể cập nhật thành công.`
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

        showErrorToast(errorMessage);
      } finally {
        if (isMounted.current) {
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      if (isMounted.current) {
        setIsServerError(true);
        showErrorToast(
          "Có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại sau!"
        );
        setIsSubmitting(false);
      }
    }
  };
  // Thêm hàm để reload dữ liệu của học sinh hiện tại
  const reloadData = async () => {
    if (!isMounted.current) return;

    // Lấy ID học sinh hiện tại
    const currentStudentId = formData.healthProfile.id;
    if (!currentStudentId) {
      console.warn("No student ID available for reload");
      showWarningToast("⚠️ Chưa chọn học sinh để làm mới dữ liệu");
      return;
    }

    console.log("🔄 Manually reloading data for student:", currentStudentId);

    // Hiển thị thông báo đang tải
    try {
      showInfoToast("🔄 Đang tải lại thông tin mới nhất của học sinh...");
    } catch (error) {
      console.error("Error showing toast:", error);
    }

    // Set loading state
    setIsLoading(true);
    setFetchError(null);
    setIsServerError(false);

    // IMPORTANT: Reset tất cả states liên quan đến vaccine và form
    setSelectedVaccines([]);
    setVaccineNotes({});
    setVaccineAdministeredAt({});
    setVaccinatedFromServer([]);
    setFullyVaccinatedVaccines([]);

    // Reset validation errors
    setFormErrors({});

    // Reset form data vaccinations
    setFormData((prevState) => ({
      ...prevState,
      vaccinations: [],
    }));

    try {
      // Gọi trực tiếp API để tải lại dữ liệu
      console.log("🔄 Direct API call for reload data");

      // Gọi hàm fetchStudentHealthProfile để tải lại dữ liệu
      await fetchStudentHealthProfile(currentStudentId);

      // Đảm bảo initialDataLoaded được set lại
      initialDataLoaded.current = true;

      // Hiển thị thông báo thành công
      if (isMounted.current) {
        showSuccessToast("✅ Đã tải lại thông tin mới nhất của học sinh!");
        console.log("🎉 Reload completed successfully");
      }
    } catch (error) {
      console.error("❌ Error reloading student data:", error);
      if (isMounted.current) {
        showErrorToast("❌ Có lỗi khi tải lại dữ liệu. Vui lòng thử lại!");
        initialDataLoaded.current = false;
      }
    }
  };

  // Hiển thị thông báo vaccine đã tiêm
  const showVaccineAlreadyTakenNotification = (vaccine) => {
    // Lưu thông tin vaccine để hiển thị trong modal
    setSelectedVaccineInfo(vaccine);

    // Hiển thị modal
    setShowVaccineAlreadyTakenModal(true);

    console.log("Modal should be shown for:", vaccine.name); // Debug log
  };

  // Render modal thông báo vaccine đã tiêm
  const renderVaccineAlreadyTakenModal = () => {
    if (!showVaccineAlreadyTakenModal || !selectedVaccineInfo) return null;

    return createPortal(
      <div className="hdm-modal-overlay">
        <div className="hdm-modal-content">
          <div className="hdm-modal-header">
            <h3>Thông tin vaccine đã tiêm</h3>
            <button
              className="hdm-modal-close"
              onClick={() => setShowVaccineAlreadyTakenModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="hdm-modal-body">
            <div className="vaccine-info-container">
              <div className="vaccine-info-header">
                <h4>{selectedVaccineInfo.name}</h4>
                <span className="vaccinated-badge">✓ Đã tiêm</span>
              </div>

              <div className="vaccine-info-details">
                <p>
                  <strong>Mô tả:</strong>{" "}
                  {selectedVaccineInfo.description || "Không có mô tả"}
                </p>
                <p>
                  <strong>Số liều cần thiết:</strong>{" "}
                  {selectedVaccineInfo.totalDoses || 1} liều
                </p>
                {selectedVaccineInfo.intervalDays && (
                  <p>
                    <strong>Khoảng cách giữa các liều:</strong>{" "}
                    {selectedVaccineInfo.intervalDays} ngày
                  </p>
                )}
                <p>
                  <strong>Độ tuổi phù hợp:</strong>{" "}
                  {selectedVaccineInfo.minAgeMonths
                    ? `${selectedVaccineInfo.minAgeMonths} tháng`
                    : "0 tháng"}{" "}
                  đến{" "}
                  {selectedVaccineInfo.maxAgeMonths
                    ? `${selectedVaccineInfo.maxAgeMonths} tháng`
                    : "không giới hạn"}
                </p>
              </div>

              <div className="vaccine-info-message">
                <p className="vaccine-warning">
                  <i className="warning-icon">⚠️</i> Vaccine này đã được ghi
                  nhận trong hồ sơ y tế của học sinh và không thể thay đổi.
                </p>
                <p>
                  Nếu bạn cần cập nhật thông tin về vaccine này, vui lòng liên
                  hệ với nhà trường hoặc y tá trường học.
                </p>
              </div>
            </div>
          </div>
          <div className="hdm-modal-footer">
            <button
              className="hdm-button primary"
              onClick={() => setShowVaccineAlreadyTakenModal(false)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
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
      <div className="server-error-alert">
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
        <div className="hdm-loading">
          <div className="hdm-spinner"></div>
          Đang tải danh sách vaccine...
        </div>
      );
    }

    if (vaccinesError) {
      return (
        <div className="server-error-alert">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <p>{vaccinesError}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="vaccines-section">
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
            const isFullyVaccinated = fullyVaccinatedVaccines.includes(
              vaccine.id
            );
            const isSelected = selectedVaccines.includes(vaccine.id);
            const isDisabled = isVaccinatedFromServer || isFullyVaccinated;

            return (
              <div
                key={vaccine.id}
                className={`vaccine-card ${isSelected ? "selected" : ""} ${
                  isVaccinatedFromServer ? "vaccinated-from-server" : ""
                } ${isFullyVaccinated ? "fully-vaccinated" : ""}`}
              >
                {/* Card Header - Tên vaccine và checkbox */}
                <div className="vaccine-card-header">
                  <div className="vaccine-checkbox-container">
                    <input
                      type="checkbox"
                      id={`vaccine-${vaccine.id}`}
                      checked={isSelected}
                      onChange={() => handleVaccineChange(vaccine.id)}
                      disabled={isDisabled}
                      className="vaccine-checkbox"
                      title={
                        isVaccinatedFromServer
                          ? "Vaccine này đã được tiêm và không thể thay đổi"
                          : isFullyVaccinated
                          ? "Vaccine này đã tiêm đủ liều và không thể thay đổi"
                          : "Chọn vaccine này"
                      }
                    />
                    <label
                      htmlFor={`vaccine-${vaccine.id}`}
                      className="checkbox-label"
                    >
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <div className="vaccine-name-container">
                    <h4 className="vaccine-name">{vaccine.name}</h4>
                    {isVaccinatedFromServer && (
                      <span
                        className="vaccinated-badge"
                        title="Vaccine này đã được tiêm và được ghi nhận trong hệ thống"
                      >
                        ✓ Đã tiêm
                      </span>
                    )}
                    {isFullyVaccinated && !isVaccinatedFromServer && (
                      <span
                        className="fully-vaccinated-badge"
                        title="Vaccine này đã tiêm đủ liều theo quy định"
                      >
                        ✓ Đã tiêm đủ
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded content khi được chọn */}
                {isSelected && (
                  <div className="vaccine-card-expanded">
                    {(isVaccinatedFromServer || isFullyVaccinated) && (
                      <div className="vaccine-already-taken-notice">
                        <p>
                          <i className="info-icon">ℹ️</i>
                          {isFullyVaccinated
                            ? "Vaccine này đã tiêm đủ liều và không thể thay đổi thông tin."
                            : "Vaccine này đã được tiêm và không thể thay đổi thông tin."}
                        </p>
                      </div>
                    )}
                    <div className="vaccine-form-section">
                      <div className="form-group">
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
                          disabled={isDisabled}
                          className="location-select"
                        >
                          <option value="Trường học">Trường học</option>
                          <option value="Bệnh viện">Bệnh viện</option>
                          <option value="Trạm y tế">Trạm y tế</option>
                          <option value="Phòng khám tư">Phòng khám tư</option>
                          <option value="Trung tâm y tế">Trung tâm y tế</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor={`notes-${vaccine.id}`}>
                          Ghi chú của phụ huynh:
                        </label>
                        <textarea
                          id={`notes-${vaccine.id}`}
                          placeholder=""
                          value={vaccineNotes[vaccine.id] || ""}
                          onChange={(e) =>
                            handleVaccineNoteChange(vaccine.id, e)
                          }
                          disabled={isDisabled}
                          className="notes-textarea"
                          rows="3"
                        />
                      </div>
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
      <div className="validation-summary">
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
      <span className="hdm-tooltip" data-tooltip={tooltips[fieldName]}>
        ?
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

  // Loading state với thông báo chi tiết
  if (isLoading || studentsLoading) {
    return (
      <div className="parent-content-wrapper">
        <div className="health-declaration-container">
          <div className="hdm-loading">
            <div className="hdm-spinner"></div>
            <h3>Đang tải thông tin học sinh...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state với thông báo lỗi thân thiện
  if (fetchError || studentsError) {
    return (
      <div className="parent-content-wrapper">
        <div className="health-declaration-container">
          <div className="server-error-alert">
            <div className="warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="warning-content">
              <h4>Có lỗi xảy ra</h4>
              <p>{fetchError || studentsError}</p>
              <button onClick={reloadData} className="hdm-button primary">
                <i className="fas fa-redo"></i> Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Server error state
  if (isServerError) {
    return renderServerError();
  }

  // No students state
  if (!students || students.length === 0) {
    return (
      <div className="parent-content-wrapper">
        <div className="health-declaration-container">
          <div className="server-error-alert">
            <div className="warning-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="warning-content">
              <h4>Không tìm thấy học sinh</h4>
              <p>Tài khoản của bạn chưa được liên kết với học sinh nào.</p>
              <p>Vui lòng liên hệ nhà trường để được hỗ trợ.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <div className="parent-content-wrapper">
      <div className="health-declaration-container">
        {/* Header */}
        <div className="headerofhealthdeclaration">
          <div className="headerofhealthdeclaration__content">
            <div className="headerofhealthdeclaration__text">
              <h1>Khai báo sức khỏe</h1>
              <p>Cập nhật thông tin sức khỏe cho học sinh</p>
            </div>
            <div className="headerofhealthdeclaration__actions">
              <button
                type="button"
                onClick={reloadData}
                className="headerofhealthdeclaration__reload-button"
                disabled={isLoading || isSubmitting}
                title="Tải lại thông tin mới nhất của học sinh hiện tại"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                {isLoading ? "Đang tải..." : "Tải lại"}
              </button>
            </div>
          </div>
        </div>

        {/* Form khai báo sức khỏe */}
        <form onSubmit={handleSubmit} className="health-declaration-form">
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
                className={`selectstudentfix ${
                  formErrors.studentId ? "error" : ""
                }`}
              >
                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.studentId || student.id}
                  >
                    {student.fullName} - Lớp {student.className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Health Profile Information */}
          <div className="form-section">
            <h3>Thông tin sức khỏe cơ bản</h3>
            <p className="help-text">
              Thông tin này sẽ được tự động tải từ hồ sơ y tế hiện có của học
              sinh. Phụ huynh có thể xem và chỉnh sửa thông tin nếu cần cập
              nhật.
            </p>

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
                  placeholder=""
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
                  placeholder=""
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
                    <span className="error-text">
                      {formErrors.hearingStatus}
                    </span>
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

          {/* Additional Health Information */}
          <div className="form-section">
            <h3>Thông tin y tế bổ sung</h3>
            <p className="help-text">
              Phụ huynh vui lòng nhập thêm các thông tin y tế quan trọng khác để
              nhà trường có thể chăm sóc và hỗ trợ học sinh tốt nhất. Các trường
              này không bắt buộc nhưng rất hữu ích cho việc theo dõi sức khỏe
              của học sinh.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="allergies">
                  Dị ứng:
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
                  placeholder="Nhập thông tin về các loại dị ứng của học sinh (nếu có)..."
                  className={formErrors.allergies ? "error" : ""}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="chronicDiseases">
                  Bệnh mãn tính:
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
                  placeholder="Nhập thông tin về các bệnh mãn tính của học sinh (nếu có)..."
                  className={formErrors.chronicDiseases ? "error" : ""}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dietaryRestrictions">
                  Hạn chế ăn uống:
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
                  placeholder="Nhập thông tin về các hạn chế ăn uống của học sinh (nếu có)..."
                  className={formErrors.dietaryRestrictions ? "error" : ""}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialNeeds">
                  Nhu cầu đặc biệt:
                  {formErrors.specialNeeds && (
                    <span className="error-text">
                      {formErrors.specialNeeds}
                    </span>
                  )}
                </label>
                <textarea
                  id="specialNeeds"
                  name="specialNeeds"
                  value={formData.healthProfile.specialNeeds}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Nhập thông tin về các nhu cầu đặc biệt của học sinh (nếu có)..."
                  className={formErrors.specialNeeds ? "error" : ""}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContactInfo">
                  Thông tin liên lạc khẩn cấp:{" "}
                  <span className="required">*</span>
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
                  placeholder="Nhập tên và số điện thoại người liên hệ khẩn cấp (VD: Bà Nguyễn Thị A - 0987654321)..."
                  className={formErrors.emergencyContactInfo ? "error" : ""}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastPhysicalExamDate">
                  Ngày kiểm tra sức khỏe gần nhất:{" "}
                  <span className="required">*</span>
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
                  className={formErrors.lastPhysicalExamDate ? "error" : ""}
                />
              </div>
            </div>
          </div>

          {/* Vaccine selection section */}
          {renderVaccineSelection()}

          {/* Submit button */}
          <div className="form-actions">
            {/* Debug button - chỉ hiển thị khi đang develop */}

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
        </form>
      </div>

      {/* Sử dụng ToastContainer đơn giản nhất để tránh lỗi */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="colored"
        limit={3}
      />
    </div>
  );
};

export default HealthDeclaration;
