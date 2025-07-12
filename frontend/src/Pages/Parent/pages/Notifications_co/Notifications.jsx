import React, { useState, useEffect } from "react";
import "./Notifications.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";
import notificationService from "../../../../services/notificationService";
import { toast } from "react-toastify";
import ConsentDetailModal from "./ConsentDetailModal";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Notifications = () => {
  // State chính
  const [activeTab, setActiveTab] = useState("health-checkup");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [healthCheckupPage, setHealthCheckupPage] = useState(1);
  const [vaccinationPage, setVaccinationPage] = useState(1);
  const itemsPerPage = 5;

  // State cho thông báo kiểm tra sức khỏe định kỳ
  const [consentList, setConsentList] = useState([]);
  const [filteredConsentList, setFilteredConsentList] = useState([]);
  const [selectedConsentId, setSelectedConsentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State cho thông báo tiêm chủng
  const [vaccinationNotifications, setVaccinationNotifications] = useState([]);
  const [selectedVaccinationId, setSelectedVaccinationId] = useState(null);
  const [vaccinationDetail, setVaccinationDetail] = useState(null);
  const [loadingVaccination, setLoadingVaccination] = useState(false);
  const [showVaccinationDetail, setShowVaccinationDetail] = useState(false);

  // State cho debug hiển thị
  const [apiStatus, setApiStatus] = useState({
    lastCall: null,
    success: false,
    message: "Chưa gọi API",
    method: null,
  });

  // State cho error và loading từ context
  const [error, setError] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    studentId: "", // Lọc theo học sinh
    consentStatus: "", // Lọc theo trạng thái phản hồi
    academicYear: "", // Lọc theo năm học
  });

  // State cho bộ lọc vaccination
  const [vaccinationFilters, setVaccinationFilters] = useState({
    studentId: "", // Lọc theo học sinh
    vaccinationType: "", // Lọc theo loại vaccine
    dateRange: "", // Lọc theo khoảng thời gian
  });

  // Context hooks
  const { currentUser } = useAuth();
  const { students, parentInfo } = useStudentData();

  // Load data khi component mount và khi activeTab thay đổi
  useEffect(() => {
    const loadData = async () => {
      const parentId = getParentId();

      if (parentId) {
        if (activeTab === "vaccination") {
          // loadVaccinationList function doesn't exist, should call loadVaccinationNotifications
          await loadVaccinationNotifications(parentId);
        }
      } else {
        if (studentsLoading || !parentInfo) {
          return;
        } else {
          setError("Không tìm thấy thông tin phụ huynh");
        }
      }
    };

    if (activeTab === "vaccination") {
      setConsentList([]);
    }

    loadData();
  }, [activeTab, parentInfo, students, studentsLoading]);

  // Helper function để lấy parentId từ context
  const getParentId = () => {
    if (parentInfo && parentInfo.id) {
      return parentInfo.id;
    }

    if (students && students.length > 0 && students[0].parentId) {
      return students[0].parentId;
    }

    return null;
  };

  // Lấy danh sách học sinh duy nhất từ consentList
  const getUniqueStudents = () => {
    const uniqueStudents = [];
    const seenStudentIds = new Set();

    consentList.forEach((item) => {
      if (item.studentId && !seenStudentIds.has(item.studentId)) {
        const student = students.find((s) => s.id === item.studentId);
        if (student) {
          uniqueStudents.push(student);
          seenStudentIds.add(item.studentId);
        }
      }
    });

    const sortedStudents = uniqueStudents.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return sortedStudents;
  };

  // Lấy danh sách năm học duy nhất từ consentList
  const getUniqueAcademicYears = () => {
    const uniqueYears = [];
    const seenYears = new Set();

    consentList.forEach((item) => {
      if (item.academicYear && !seenYears.has(item.academicYear)) {
        const academicYear = {
          id: item.academicYear,
          name: item.academicYear,
        };
        uniqueYears.push(academicYear);
        seenYears.add(item.academicYear);
      }
    });

    const sortedYears = uniqueYears.sort((a, b) =>
      b.name.localeCompare(a.name)
    );
    return sortedYears;
  };

  // Lọc dữ liệu theo các bộ lọc
  const getFilteredData = () => {
    let filtered = [...consentList];

    // Lọc theo học sinh
    if (filters.studentId) {
      filtered = filtered.filter((item) => {
        const student = students.find((s) => s.id === item.studentId);
        return (
          student && student.id.toString() === filters.studentId.toString()
        );
      });
    }

    // Lọc theo trạng thái
    if (filters.consentStatus) {
      filtered = filtered.filter(
        (item) => item.consentStatus === filters.consentStatus
      );
    }

    // Lọc theo năm học
    if (filters.academicYear) {
      // Kiểm tra nhiều định dạng của năm học
      filtered = filtered.filter((item) => {
        const itemYear = item.academicYear;
        const filterYear = filters.academicYear;

        // So sánh chính xác
        if (itemYear === filterYear) return true;

        // Xử lý các định dạng khác nhau
        if (
          itemYear &&
          filterYear &&
          itemYear.replace(/\s+/g, "") === filterYear.replace(/\s+/g, "")
        )
          return true;

        return false;
      });
    }

    return filtered;
  };

  // Handlers cho bộ lọc
  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      studentId: "",
      consentStatus: "",
      academicYear: "",
    });
  };

  // Handlers cho bộ lọc vaccination
  const handleVaccinationFilterChange = (filterKey, value) => {
    setVaccinationFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearAllVaccinationFilters = () => {
    setVaccinationFilters({
      studentId: "",
      vaccinationType: "",
      dateRange: "",
    });
  };

  const getActiveVaccinationFilterCount = () => {
    return Object.values(vaccinationFilters).filter((value) => value !== "")
      .length;
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== "").length;
  };

  // Pagination helpers
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  // Pagination handlers for Health Checkup
  const goToHealthCheckupPage = (pageNumber) => {
    setHealthCheckupPage(pageNumber);
  };

  const goToPrevHealthCheckupPage = () => {
    if (healthCheckupPage > 1) {
      setHealthCheckupPage(healthCheckupPage - 1);
    }
  };

  const goToNextHealthCheckupPage = () => {
    const totalPages = getTotalPages(filteredConsentList.length);
    if (healthCheckupPage < totalPages) {
      setHealthCheckupPage(healthCheckupPage + 1);
    }
  };

  // Pagination handlers for Vaccination
  const goToVaccinationPage = (pageNumber) => {
    setVaccinationPage(pageNumber);
  };

  const goToPrevVaccinationPage = () => {
    if (vaccinationPage > 1) {
      setVaccinationPage(vaccinationPage - 1);
    }
  };

  const goToNextVaccinationPage = () => {
    const totalPages = getTotalPages(vaccinationNotifications.length);
    if (vaccinationPage < totalPages) {
      setVaccinationPage(vaccinationPage + 1);
    }
  };

  // Reset pagination when changing tabs or data changes
  useEffect(() => {
    setHealthCheckupPage(1);
  }, [filteredConsentList.length, filters]);

  useEffect(() => {
    setVaccinationPage(1);
  }, [vaccinationNotifications.length, vaccinationFilters]);

  // Lọc dữ liệu vaccination
  const getFilteredVaccinationData = () => {
    let filtered = [...vaccinationNotifications];

    // Lọc theo học sinh
    if (vaccinationFilters.studentId) {
      filtered = filtered.filter((item) => {
        // Giả sử vaccination notification có thông tin student
        return item.studentId === vaccinationFilters.studentId;
      });
    }

    // Lọc theo loại vaccine
    if (vaccinationFilters.vaccinationType) {
      filtered = filtered.filter((item) => {
        return (
          item.title &&
          item.title
            .toLowerCase()
            .includes(vaccinationFilters.vaccinationType.toLowerCase())
        );
      });
    }

    // Lọc theo khoảng thời gian
    if (vaccinationFilters.dateRange) {
      const now = new Date();
      let startDate;

      switch (vaccinationFilters.dateRange) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.receivedDate || item.createdAt);
          return itemDate >= startDate;
        });
      }
    }

    return filtered;
  };

  // Get filtered vaccination data
  const filteredVaccinationData = getFilteredVaccinationData();

  // Get current page data
  const currentHealthCheckupData = getPaginatedData(
    filteredConsentList,
    healthCheckupPage
  );
  const currentVaccinationData = getPaginatedData(
    filteredVaccinationData,
    vaccinationPage
  );

  // Pagination Controls Component
  const PaginationControls = ({
    currentPage,
    totalPages,
    onPrevPage,
    onNextPage,
    onGoToPage,
    dataLength,
  }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }

      return pages;
    };

    return (
      <div className="pn-pagination">
        <div className="pn-pagination-info">
          <span>
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, dataLength)} của {dataLength}{" "}
            mục
          </span>
        </div>
        <div className="pn-pagination-controls">
          <button
            className="pn-pagination-btn"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
            <span>Trước</span>
          </button>

          <div className="pn-pagination-numbers">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                className={`pn-pagination-number ${
                  currentPage === pageNum ? "pn-pagination-number--active" : ""
                }`}
                onClick={() => onGoToPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            className="pn-pagination-btn"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            <span>Sau</span>
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  // Load dữ liệu kiểm tra sức khỏe khi component mount hoặc khi có parentId
  useEffect(() => {
    if (activeTab === "health-checkup") {
      const parentId = getParentId();
      if (parentId) {
        loadHealthCheckupList();
      } else {
        // Set a fallback data while waiting
        if (parentInfo === null && students.length === 0) {
          // Still loading contexts
        } else {
          // Context loaded but no parentId found
          setConsentList([]);
          setFilteredConsentList([]);
        }
      }
    } else if (activeTab === "vaccination") {
      const parentId = getParentId();
      if (parentId) {
        loadVaccinationNotifications(parentId);
      } else {
        // No parentId for vaccination, setting empty array
        setVaccinationNotifications([]);
      }
    }
  }, [activeTab, parentInfo, students]); // Dependencies để reload khi có data

  // Cập nhật danh sách đã lọc khi consentList hoặc filters thay đổi
  useEffect(() => {
    const filtered = getFilteredData();
    setFilteredConsentList(filtered);
  }, [consentList, filters, students]);

  // Load danh sách consent kiểm tra sức khỏe
  const loadHealthCheckupList = async () => {
    setLoading(true);
    try {
      const parentId = getParentId();

      if (!parentId) {
        toast.error(
          "Không tìm thấy thông tin phụ huynh. Vui lòng đăng nhập lại.",
          {
            position: "top-center",
            autoClose: 5000,
          }
        );
        setConsentList([]);
        setLoading(false);
        return;
      }

      // Gọi API thực
      const response = await healthCheckupConsentService.getAllConsents(
        parentId
      );

      // Transform data từ API response thành format cho UI
      const transformedData = [];

      if (response?.childrenNotifications) {
        response.childrenNotifications.forEach((child) => {
          child.notifications.forEach((notification) => {
            const consentItem = {
              id: notification.consentId,
              healthCampaignId: notification.healthCampaignId,
              campaignTitle: notification.campaignTitle,
              campaignDescription: notification.campaignDescription,
              campaignStartDate: notification.campaignStartDate,
              campaignEndDate: notification.campaignEndDate,
              campaignStatus: notification.campaignStatus,
              consentStatus: notification.consentStatus,
              studentId: child.studentId,
              studentName: child.studentName,
              studentClass: child.studentClass,
              studentAge: child.studentAge,
              createdAt: notification.createdAt,
              updatedAt: notification.updatedAt,
            };
            transformedData.push(consentItem);
          });
        });
      }

      setConsentList(transformedData);
      setFilteredConsentList(transformedData); // Set initial filtered data

      if (transformedData.length === 0) {
        // Add test data for development/debugging
        const testData = [
          {
            id: "test-1",
            healthCampaignId: "hc-1",
            campaignTitle: "Kiểm tra sức khỏe định kỳ tháng 11",
            campaignDescription: "Kiểm tra sức khỏe tổng quát cho học sinh",
            campaignStartDate: "2024-11-01",
            campaignEndDate: "2024-11-30",
            campaignStatus: "ACTIVE",
            consentStatus: "PENDING",
            studentId: "student-1",
            studentName: "Nguyễn Minh An",
            studentClass: "1A1",
            studentAge: 7,
            academicYear: "2024-2025",
            createdAt: "2024-11-01T00:00:00Z",
            updatedAt: "2024-11-01T00:00:00Z",
          },
          {
            id: "test-2",
            healthCampaignId: "hc-1",
            campaignTitle: "Kiểm tra sức khỏe định kỳ tháng 11",
            campaignDescription: "Kiểm tra sức khỏe tổng quát cho học sinh",
            campaignStartDate: "2024-11-01",
            campaignEndDate: "2024-11-30",
            campaignStatus: "ACTIVE",
            consentStatus: "APPROVED",
            studentId: "student-2",
            studentName: "Trần Văn Bình",
            studentClass: "2B1",
            studentAge: 8,
            academicYear: "2024-2025",
            createdAt: "2024-11-01T00:00:00Z",
            updatedAt: "2024-11-02T00:00:00Z",
          },
          {
            id: "test-3",
            healthCampaignId: "hc-2",
            campaignTitle: "Kiểm tra sức khỏe cuối năm học 2023",
            campaignDescription: "Kiểm tra sức khỏe cuối năm học",
            campaignStartDate: "2023-05-01",
            campaignEndDate: "2023-05-30",
            campaignStatus: "COMPLETED",
            consentStatus: "APPROVED",
            studentId: "student-1",
            studentName: "Nguyễn Minh An",
            studentClass: "1A1",
            studentAge: 7,
            academicYear: "2022-2023",
            createdAt: "2023-05-01T00:00:00Z",
            updatedAt: "2023-05-02T00:00:00Z",
          },
        ];

        setConsentList(testData);
        setFilteredConsentList(testData);

        toast.info(
          "Hiện tại không có thông báo kiểm tra sức khỏe nào (Đang hiển thị dữ liệu test)",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        setLoading(false);
        return;
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách thông báo: " + error.message, {
        position: "top-center",
        autoClose: 5000,
      });
      setConsentList([]);
      setFilteredConsentList([]);
    } finally {
      setLoading(false);
    }
  };

  // Load vaccination notifications
  const loadVaccinationNotifications = async (parentId) => {
    try {
      setLoadingVaccination(true);
      setApiStatus({
        lastCall: new Date().toLocaleTimeString(),
        success: false,
        message: "Đang gọi API danh sách...",
        method: "proxy",
      });

      let response;

      try {
        // Thử gọi API thông qua proxy trước
        response = await notificationService.getVaccinationNotifications(
          parentId
        );

        setApiStatus({
          lastCall: new Date().toLocaleTimeString(),
          success: true,
          message: `Proxy API thành công: ${
            response.data ? response.data.length : 0
          } kết quả`,
          method: "proxy",
        });
      } catch (proxyError) {
        console.error("❌ Lỗi khi gọi qua proxy:", proxyError);
        console.log("🔄 Thử gọi API trực tiếp...");

        setApiStatus({
          lastCall: new Date().toLocaleTimeString(),
          success: false,
          message: `Proxy API lỗi: ${proxyError.message}. Đang thử direct API...`,
          method: "direct",
        });

        // Nếu lỗi, thử gọi trực tiếp
        response = await notificationService.direct.getVaccinationNotifications(
          parentId
        );

        setApiStatus({
          lastCall: new Date().toLocaleTimeString(),
          success: true,
          message: `Direct API thành công: ${
            response.data ? response.data.length : 0
          } kết quả`,
          method: "direct",
        });
      }

      // Kiểm tra dữ liệu từ API
      if (response && response.data && response.data.length > 0) {
        const notificationsData = [...response.data];

        // Cập nhật state với dữ liệu từ API
        setVaccinationNotifications(notificationsData);

        setApiStatus({
          lastCall: new Date().toLocaleTimeString(),
          success: true,
          message: `Nhận được ${notificationsData.length} thông báo từ API`,
          method: apiStatus.method,
        });
      } else {
        // Không có dữ liệu từ API, sử dụng dữ liệu mẫu
        const sampleData = [
          {
            id: 4,
            title: "Thông báo tiêm vaccine MMR",
            receivedDate: "2025-07-05T22:40:22.25",
          },
          {
            id: 14,
            title: "Thông báo kế hoạch tiêm chủng: abc",
            receivedDate: "2025-07-07T16:55:45.480635",
          },
          {
            id: 15,
            title: "Thông báo kế hoạch tiêm chủng: abc",
            receivedDate: "2025-07-07T16:56:27.042741",
          },
        ];

        // Cập nhật state với dữ liệu mẫu
        setVaccinationNotifications(sampleData);

        setApiStatus({
          lastCall: new Date().toLocaleTimeString(),
          success: false,
          message: "API trả về dữ liệu rỗng - sử dụng dữ liệu mẫu",
          method: apiStatus.method,
        });
      }
    } catch (error) {
      toast.error("Không thể tải danh sách thông báo tiêm chủng");
      // Set empty array to ensure the UI shows "no data" message
      setVaccinationNotifications([]);

      setApiStatus({
        lastCall: new Date().toLocaleTimeString(),
        success: false,
        message: `Lỗi: ${error.message}`,
        method: apiStatus.method,
      });
    } finally {
      setLoadingVaccination(false);
    }
  };

  // Load vaccination notification detail
  const loadVaccinationDetail = async (notificationId, parentId) => {
    try {
      setLoadingVaccination(true);
      let response;

      try {
        // Thử gọi API thông qua proxy trước
        response = await notificationService.getVaccinationNotificationDetail(
          notificationId,
          parentId
        );
      } catch (proxyError) {
        // Thử gọi API chi tiết trực tiếp...

        // Nếu lỗi, thử gọi trực tiếp
        response =
          await notificationService.direct.getVaccinationNotificationDetail(
            notificationId,
            parentId
          );
      }

      if (response && response.data) {
        setVaccinationDetail(response.data);
        setShowVaccinationDetail(true);
      } else {
        // Tạo dữ liệu mẫu cho chi tiết thông báo
        const sampleDetail = {
          id: notificationId,
          title: "Thông báo tiêm chủng đợt tháng 7/2025",
          message:
            "Kính gửi Quý phụ huynh,\n\nNhà trường tổ chức tiêm chủng đợt tiêm vắc xin định kỳ cho học sinh vào ngày 15/7/2025.\n\nThông tin chi tiết:\n- Thời gian: 8h00 - 11h30 ngày 15/7/2025\n- Địa điểm: Phòng y tế trường học\n- Loại vắc xin: MMR (Sởi, Quai bị, Rubella)\n\nVui lòng xác nhận tham gia hoặc từ chối bằng cách nhấn vào nút bên dưới.",
          senderName: "Y tá trường học",
          createdAt: "2025-07-07T09:00:00",
          isRequest: true,
          type: "VACCINATION",
        };

        setVaccinationDetail(sampleDetail);
        setShowVaccinationDetail(true);

        toast.info("Hiển thị dữ liệu mẫu chi tiết thông báo tiêm chủng", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      // Tạo dữ liệu mẫu khi có lỗi
      const sampleDetail = {
        id: notificationId,
        title: "Thông báo tiêm chủng đợt tháng 7/2025",
        message:
          "Kính gửi Quý phụ huynh,\n\nNhà trường tổ chức tiêm chủng đợt tiêm vắc xin định kỳ cho học sinh vào ngày 15/7/2025.\n\nThông tin chi tiết:\n- Thời gian: 8h00 - 11h30 ngày 15/7/2025\n- Địa điểm: Phòng y tế trường học\n- Loại vắc xin: MMR (Sởi, Quai bị, Rubella)\n\nVui lòng xác nhận tham gia hoặc từ chối bằng cách nhấn vào nút bên dưới.",
        senderName: "Y tá trường học",
        createdAt: "2025-07-07T09:00:00",
        isRequest: true,
        type: "VACCINATION",
      };

      setVaccinationDetail(sampleDetail);
      setShowVaccinationDetail(true);

      toast.warning("Đang hiển thị dữ liệu mẫu do không thể kết nối máy chủ", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingVaccination(false);
    }
  };

  // Handler for vaccination notification click
  const handleVaccinationClick = (notificationId) => {
    const parentId = getParentId();
    if (parentId) {
      setSelectedVaccinationId(notificationId);
      loadVaccinationDetail(notificationId, parentId);
    }
  };

  // Handler to close vaccination detail
  const handleCloseVaccinationDetail = () => {
    setShowVaccinationDetail(false);
    setVaccinationDetail(null);
  };

  // Handler for vaccination notification response
  const handleVaccinationResponse = async (response) => {
    const parentId = getParentId();
    if (parentId && selectedVaccinationId) {
      try {
        setLoadingVaccination(true);
        await notificationService.respondToNotification(
          selectedVaccinationId,
          parentId,
          response
        );
        toast.success(
          response === "ACCEPTED"
            ? "Đã xác nhận tham gia"
            : "Đã từ chối tham gia"
        );

        // Reload detail with updated response
        await loadVaccinationDetail(selectedVaccinationId, parentId);

        // Reload the list after response
        await loadVaccinationNotifications(parentId);
      } catch (error) {
        toast.error("Không thể gửi phản hồi");
      } finally {
        setLoadingVaccination(false);
      }
    }
  };

  // Xử lý click vào một consent item
  const handleConsentClick = (consentId) => {
    setSelectedConsentId(consentId);
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConsentId(null);
  };

  // Callback khi consent được cập nhật
  const handleConsentUpdated = () => {
    // Simulate updating the consent status in the list
    const updatedList = consentList.map((consent) =>
      consent.id === selectedConsentId
        ? { ...consent, consentStatus: "APPROVED" }
        : consent
    );
    setConsentList(updatedList);

    // Cập nhật filteredConsentList sẽ được tự động xử lý bởi useEffect
    toast.info("Danh sách đã được cập nhật");
  };

  // Render status badge cho consentStatus mới
  const renderStatusBadge = (consentStatus) => {
    switch (consentStatus) {
      case "PENDING":
        return (
          <div className="pn-status-badge pn-status-badge--pending">
            <i className="fas fa-clock"></i>
            Chờ phản hồi
          </div>
        );
      case "APPROVED":
        return (
          <div className="pn-status-badge pn-status-badge--confirmed">
            <i className="fas fa-check-circle"></i>
            Đồng ý
          </div>
        );
      case "REJECTED":
        return (
          <div className="pn-status-badge pn-status-badge--rejected">
            <i className="fas fa-times-circle"></i>
            Từ chối
          </div>
        );
      default:
        return (
          <div className="pn-status-badge pn-status-badge--pending">
            <i className="fas fa-question-circle"></i>
            Chưa rõ
          </div>
        );
    }
  };

  // Render bộ lọc cho kiểm tra sức khỏe
  const renderFilterControls = () => {
    const uniqueStudents = getUniqueStudents();
    const uniqueAcademicYears = getUniqueAcademicYears();
    const activeFilters = getActiveFilterCount();

    return (
      <div className="pn-filters">
        <div className="pn-filters-header">
          <h3 className="pn-filters-title">
            <i className="fas fa-filter"></i>
            Bộ lọc
            {activeFilters > 0 && (
              <span className="pn-filter-count">({activeFilters})</span>
            )}
          </h3>
          {activeFilters > 0 && (
            <button
              className="pn-clear-filters"
              onClick={clearAllFilters}
              title="Xóa tất cả bộ lọc"
            >
              <i className="fas fa-times"></i>
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="pn-filters-row">
          {/* Lọc theo năm học */}
          <div className="pn-filter-group">
            <label className="pn-filter-label">
              <i className="fas fa-calendar-alt"></i>
              Năm học
            </label>
            <select
              value={filters.academicYear}
              onChange={(e) =>
                handleFilterChange("academicYear", e.target.value)
              }
              className="pn-filter-select"
            >
              <option value="">Tất cả năm học</option>
              {uniqueAcademicYears.map((year) => (
                <option key={year.id} value={year.name}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo học sinh */}
          <div className="pn-filter-group">
            <label className="pn-filter-label">
              <i className="fas fa-user-graduate"></i>
              Học sinh
            </label>
            <select
              value={filters.studentId}
              onChange={(e) => handleFilterChange("studentId", e.target.value)}
              className="pn-filter-select"
            >
              <option value="">Tất cả học sinh</option>
              {uniqueStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.class})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo trạng thái phản hồi */}
          <div className="pn-filter-group">
            <label className="pn-filter-label">
              <i className="fas fa-check-circle"></i>
              Trạng thái phản hồi
            </label>
            <select
              value={filters.consentStatus}
              onChange={(e) =>
                handleFilterChange("consentStatus", e.target.value)
              }
              className="pn-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ phản hồi</option>
              <option value="APPROVED">Đã đồng ý</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Hiển thị số kết quả */}
        <div className="pn-filters-results">
          <span className="pn-result-count">
            <i className="fas fa-list"></i>
            Hiển thị {filteredConsentList.length} / {consentList.length} thông
            báo
          </span>

          {/* Debug button */}
          <button
            className="pn-debug-btn"
            onClick={() => {
              alert("Debug info printed to console. Check F12 -> Console tab");
            }}
          >
            🐛 Debug
          </button>
        </div>
      </div>
    );
  };

  // Render bộ lọc cho vaccination
  const renderVaccinationFilterControls = () => {
    const uniqueStudents = getUniqueStudents();
    const activeFilters = getActiveVaccinationFilterCount();

    // Lấy các loại vaccine từ dữ liệu
    const getUniqueVaccineTypes = () => {
      const types = new Set();
      vaccinationNotifications.forEach((notification) => {
        if (notification.title) {
          // Extract vaccine type from title
          if (notification.title.includes("MMR")) types.add("MMR");
          if (notification.title.includes("COVID")) types.add("COVID-19");
          if (notification.title.includes("Cúm")) types.add("Cúm mùa");
          if (notification.title.includes("Thủy đậu")) types.add("Thủy đậu");
          if (notification.title.includes("DPT")) types.add("DPT");
          if (notification.title.includes("Viêm gan B"))
            types.add("Viêm gan B");
          if (notification.title.includes("Bại liệt")) types.add("Bại liệt");
        }
      });
      return Array.from(types);
    };

    const uniqueVaccineTypes = getUniqueVaccineTypes();

    return (
      <div className="pn-filters">
        <div className="pn-filters-header">
          <h3 className="pn-filters-title">
            <i className="fas fa-filter"></i>
            Bộ lọc
            {activeFilters > 0 && (
              <span className="pn-filter-count">({activeFilters})</span>
            )}
          </h3>
          {activeFilters > 0 && (
            <button
              className="pn-clear-filters"
              onClick={clearAllVaccinationFilters}
              title="Xóa tất cả bộ lọc"
            >
              <i className="fas fa-times"></i>
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="pn-filters-row">
          {/* Lọc theo học sinh */}
          <div className="pn-filter-group">
            <label className="pn-filter-label">
              <i className="fas fa-user-graduate"></i>
              Học sinh
            </label>
            <select
              value={vaccinationFilters.studentId}
              onChange={(e) =>
                handleVaccinationFilterChange("studentId", e.target.value)
              }
              className="pn-filter-select"
            >
              <option value="">Tất cả học sinh</option>
              {uniqueStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.class})
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo loại vaccine */}
          <div className="pn-filter-group">
            <label className="pn-filter-label">
              <i className="fas fa-syringe"></i>
              Loại vaccine
            </label>
            <select
              value={vaccinationFilters.vaccinationType}
              onChange={(e) =>
                handleVaccinationFilterChange("vaccinationType", e.target.value)
              }
              className="pn-filter-select"
            >
              <option value="">Tất cả loại vaccine</option>
              {uniqueVaccineTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo thời gian */}
          <div className="pn-filter-group">
            <label className="pn-filter-label">
              <i className="fas fa-calendar-alt"></i>
              Thời gian
            </label>
            <select
              value={vaccinationFilters.dateRange}
              onChange={(e) =>
                handleVaccinationFilterChange("dateRange", e.target.value)
              }
              className="pn-filter-select"
            >
              <option value="">Tất cả thời gian</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="quarter">90 ngày qua</option>
            </select>
          </div>
        </div>

        {/* Hiển thị số kết quả */}
        <div className="pn-filters-results">
          <span className="pn-result-count">
            <i className="fas fa-list"></i>
            Hiển thị {filteredVaccinationData.length} /{" "}
            {vaccinationNotifications.length} thông báo
          </span>

          {/* Debug button */}
          <button
            className="pn-debug-btn"
            onClick={() => {
              console.log("Vaccination Filters:", vaccinationFilters);
              console.log("Filtered Data:", filteredVaccinationData);
              alert("Debug info printed to console. Check F12 -> Console tab");
            }}
          >
            🐛 Debug
          </button>
        </div>
      </div>
    );
  };

  // Handler cho việc chọn tab
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);

    // Khi chuyển tab, cần reload dữ liệu tương ứng
    const parentId = getParentId();
    if (parentId) {
      if (tabName === "health-checkup") {
        loadHealthCheckupList();
      } else if (tabName === "vaccination") {
        loadVaccinationNotifications(parentId);
      }
    }
  };

  // Render tab buttons
  const renderTabButtons = () => (
    <div className="notification-tabs">
      <button
        className={`tab-button ${
          activeTab === "health-checkup" ? "active" : ""
        }`}
        onClick={() => handleTabClick("health-checkup")}
      >
        <i className="fas fa-stethoscope"></i>
        Kiểm tra sức khỏe định kỳ
      </button>
      <button
        className={`tab-button ${activeTab === "vaccination" ? "active" : ""}`}
        onClick={() => handleTabClick("vaccination")}
      >
        <i className="fas fa-syringe"></i>
        Thông báo tiêm chủng
      </button>
    </div>
  );

  // Render nội dung kiểm tra sức khỏe định kỳ
  const renderHealthCheckupContent = () => {
    if (loading) {
      return (
        <div className="pn-loading">
          <div className="pn-spinner"></div>
        </div>
      );
    }

    return (
      <div className="pn-health-content">
        {/* Hiển thị bộ lọc nếu có dữ liệu */}
        {consentList.length > 0 && renderFilterControls()}

        {/* Hiển thị danh sách hoặc thông báo không có dữ liệu */}
        {consentList.length === 0 ? (
          <div className="pn-no-data">
            <i className="fas fa-info-circle pn-no-data-icon"></i>
            <p className="pn-no-data-text">
              Không có thông báo kiểm tra sức khỏe nào
            </p>
          </div>
        ) : filteredConsentList.length === 0 ? (
          <div className="pn-no-data">
            <i className="fas fa-search pn-no-data-icon"></i>
            <p className="pn-no-data-text">
              Không tìm thấy thông báo nào phù hợp với bộ lọc hiện tại
            </p>
            <button className="pn-clear-filters" onClick={clearAllFilters}>
              <i className="fas fa-refresh"></i>
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="pn-consent-list">
            {currentHealthCheckupData.map((consent) => (
              <div
                key={consent.id}
                className="pn-consent-item"
                onClick={() => handleConsentClick(consent.id)}
              >
                <div className="pn-consent-content">
                  <div className="pn-consent-title">
                    {consent.campaignTitle}
                  </div>
                  <div className="pn-consent-meta">
                    Học sinh: {consent.studentName} ({consent.studentClass}){" "}
                    <br />
                    Thời gian:{" "}
                    {new Date(consent.campaignStartDate).toLocaleDateString(
                      "vi-VN"
                    )}{" "}
                    -{" "}
                    {new Date(consent.campaignEndDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
                {renderStatusBadge(consent.consentStatus)}
              </div>
            ))}
          </div>
        )}
        <PaginationControls
          currentPage={healthCheckupPage}
          totalPages={getTotalPages(filteredConsentList.length)}
          onPrevPage={goToPrevHealthCheckupPage}
          onNextPage={goToNextHealthCheckupPage}
          onGoToPage={goToHealthCheckupPage}
          dataLength={filteredConsentList.length}
        />
      </div>
    );
  };

  // Render nội dung tab tiêm chủng
  const renderVaccinationContent = () => {
    try {
      // Chọn dữ liệu hiển thị dựa trên trạng thái hiện tại
      const displayData = vaccinationNotifications || [];

      // Nếu đang hiển thị chi tiết một thông báo
      if (showVaccinationDetail) {
        return (
          <div className="vaccination-detail">
            {loadingVaccination ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="detail-header">
                  <button
                    className="back-btn"
                    onClick={handleCloseVaccinationDetail}
                  >
                    <i className="fas fa-arrow-left"></i> Quay lại
                  </button>
                  <h2>{vaccinationDetail?.title}</h2>
                </div>
                <div className="detail-info">
                  <div className="info-item">
                    <span className="label">Người gửi:</span>
                    <span className="value">
                      {vaccinationDetail?.senderName || "Không có thông tin"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Ngày nhận:</span>
                    <span className="value">
                      {vaccinationDetail?.createdAt
                        ? new Date(vaccinationDetail.createdAt).toLocaleString(
                            "vi-VN"
                          )
                        : "Không có thông tin"}
                    </span>
                  </div>
                </div>
                <div className="detail-message">
                  {vaccinationDetail?.message || "Không có nội dung"}
                </div>
                {renderVaccinationResponseButtons()}
              </>
            )}
          </div>
        );
      }

      // Hiển thị danh sách thông báo
      if (loadingVaccination) {
        return (
          <div className="vaccination-content">
            <div className="debug-controls">
              <div className="debug-status">Đang tải dữ liệu...</div>
            </div>
            <LoadingSpinner />
          </div>
        );
      }

      // Hiển thị danh sách thông báo (hoặc thông báo không có dữ liệu)
      return (
        <div
          className="vaccination-content"
          style={{
            display: "block",
            width: "100%",
            minHeight: "400px",
            backgroundColor: "#f8fafc",
            padding: "20px",
            position: "relative",
            visibility: "visible",
          }}
        >
          <div className="debug-controls">
            <div
              className={`api-status ${
                apiStatus.success ? "success" : "error"
              }`}
              style={{
                padding: "8px 12px",
                background: apiStatus.success ? "#10b981" : "#ef4444",
                color: "white",
                borderRadius: "4px",
                fontSize: "0.8rem",
                marginRight: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                API: {apiStatus.method || "N/A"} - {apiStatus.message}
              </div>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                {apiStatus.lastCall
                  ? `Lần gọi cuối: ${apiStatus.lastCall}`
                  : "Chưa gọi API"}
              </div>
            </div>

            <button
              className="debug-btn"
              onClick={() => {
                const parentId = getParentId();
                if (parentId) {
                  loadVaccinationNotifications(parentId);
                } else {
                  toast.error(
                    "Không thể tải dữ liệu: Không tìm thấy ID phụ huynh"
                  );
                }
              }}
              style={{
                padding: "6px 12px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              🔄 Tải lại dữ liệu
            </button>

            <button
              className="debug-btn"
              onClick={() => {
                const sampleData = [
                  {
                    id: 101,
                    title: "Thông báo tiêm vaccine MMR - TEST",
                    receivedDate: "2025-07-08T10:00:00",
                  },
                  {
                    id: 102,
                    title: "Thông báo tiêm chủng COVID-19 - TEST",
                    receivedDate: "2025-07-08T11:00:00",
                  },
                  {
                    id: 103,
                    title: "Thông báo kế hoạch tiêm chủng định kỳ - TEST",
                    receivedDate: "2025-07-08T12:00:00",
                  },
                ];
                setVaccinationNotifications(sampleData);
                toast.success("Đã thiết lập dữ liệu mẫu!", {
                  position: "top-right",
                  autoClose: 2000,
                });
              }}
              style={{
                padding: "6px 12px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
                marginLeft: "8px",
                marginBottom: "10px",
              }}
            >
              📝 Dữ liệu mẫu
            </button>
          </div>

          <div
            style={{
              background: "#f3f4f6",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
              fontSize: "0.8rem",
            }}
          >
            <strong>Debug Info:</strong>
            <br />- Data length: {displayData.length}
            <br />- Loading: {loadingVaccination ? "Yes" : "No"}
            <br />- Show detail: {showVaccinationDetail ? "Yes" : "No"}
            <br />- Active tab: {activeTab}
            <br />- Data: {JSON.stringify(displayData, null, 2).slice(0, 200)}
            ...
          </div>

          {displayData.length === 0 ? (
            <div
              className="no-data"
              style={{
                textAlign: "center",
                padding: "40px 20px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <i
                className="fas fa-info-circle"
                style={{
                  fontSize: "2rem",
                  color: "#6b7280",
                  marginBottom: "10px",
                }}
              ></i>
              <p style={{ margin: "0", color: "#374151", fontSize: "1rem" }}>
                Không có thông báo tiêm chủng nào
              </p>
              <p
                style={{
                  margin: "10px 0 0 0",
                  color: "#6b7280",
                  fontSize: "0.875rem",
                }}
              >
                Nhấn nút "Dữ liệu mẫu" để xem demo
              </p>
            </div>
          ) : (
            <div
              className="vaccination-list"
              style={{
                display: "block",
                width: "100%",
                visibility: "visible",
                opacity: 1,
                zIndex: 1,
                position: "relative",
              }}
            >
              {currentVaccinationData.map((notification, index) => {
                return (
                  <div
                    key={notification.id || index}
                    className="vaccination-item"
                    onClick={() => {
                      handleVaccinationClick(notification.id);
                    }}
                    style={{
                      display: "block",
                      padding: "15px",
                      margin: "10px 0",
                      border: "2px solid #3b82f6",
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      minHeight: "60px",
                      width: "100%",
                      boxSizing: "border-box",
                      position: "relative",
                      zIndex: 2,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#dbeafe";
                      e.target.style.borderColor = "#1d4ed8";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#3b82f6";
                    }}
                  >
                    <div
                      className="vaccination-item-content"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          className="vaccination-item-title"
                          style={{
                            fontWeight: "600",
                            fontSize: "1rem",
                            color: "#374151",
                            marginBottom: "5px",
                          }}
                        >
                          {notification.title || "Không có tiêu đề"}
                        </div>
                        <div
                          className="vaccination-item-date"
                          style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                          }}
                        >
                          Ngày nhận:{" "}
                          {notification.receivedDate || notification.createdAt
                            ? new Date(
                                notification.receivedDate ||
                                  notification.createdAt
                              ).toLocaleDateString("vi-VN")
                            : "Không có thông tin"}
                        </div>
                      </div>
                      <div
                        className="vaccination-item-icon"
                        style={{ color: "#9ca3af" }}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    } catch (error) {
      return (
        <div
          className="vaccination-content"
          style={{
            padding: "20px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ color: "#dc2626" }}>Lỗi hiển thị</h3>
          <p>Có lỗi xảy ra khi hiển thị thông báo tiêm chủng.</p>
          <p>Chi tiết lỗi: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
  };

  // Render vaccination notification response buttons
  const renderVaccinationResponseButtons = () => {
    // If the user has already responded, show the response instead of buttons
    if (vaccinationDetail?.response) {
      return (
        <div className="vaccination-response-info">
          <div
            className={`response-badge ${vaccinationDetail.response.toLowerCase()}`}
          >
            {vaccinationDetail.response === "ACCEPTED"
              ? "Đã xác nhận tham gia"
              : "Đã từ chối tham gia"}
          </div>
          <div className="response-time">
            Phản hồi lúc:{" "}
            {new Date(vaccinationDetail.responseAt).toLocaleString("vi-VN")}
          </div>
        </div>
      );
    }

    // If no response yet and it's a request requiring response, show buttons
    if (vaccinationDetail?.isRequest) {
      return (
        <div className="vaccination-response-buttons">
          <button
            className="accept-btn"
            onClick={() => handleVaccinationResponse("ACCEPTED")}
            disabled={loadingVaccination}
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            <i className="fas fa-check"></i>
            Xác nhận tham gia
          </button>
          <button
            className="reject-btn"
            onClick={() => handleVaccinationResponse("REJECTED")}
            disabled={loadingVaccination}
            style={{
              padding: "12px 24px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-times"></i>
            Từ chối tham gia
          </button>
        </div>
      );
    }

    // If it's not a request requiring response, don't show buttons
    return null;
  };

  // Effect để debug và kiểm tra state khi thay đổi
  useEffect(() => {}, [vaccinationNotifications]);

  // Effect để tự động tải dữ liệu mẫu nếu không có dữ liệu sau khi API trả về
  useEffect(() => {
    if (
      !loadingVaccination &&
      activeTab === "vaccination" &&
      (!vaccinationNotifications || vaccinationNotifications.length === 0)
    ) {
      // Đợi một chút để đảm bảo UI đã render trạng thái không có dữ liệu
      const timeoutId = setTimeout(() => {
        const sampleData = [
          {
            id: 4,
            title: "Thông báo tiêm vaccine MMR",
            receivedDate: "2025-07-05T22:40:22.25",
          },
          {
            id: 14,
            title: "Thông báo kế hoạch tiêm chủng: abc",
            receivedDate: "2025-07-07T16:55:45.480635",
          },
          {
            id: 15,
            title: "Thông báo kế hoạch tiêm chủng: abc",
            receivedDate: "2025-07-07T16:56:27.042741",
          },
        ];

        setVaccinationNotifications(sampleData);

        setApiStatus({
          lastCall: new Date().toLocaleTimeString(),
          success: true,
          message: "Đã tự động tải dữ liệu mẫu sau khi API thất bại",
          method: "sample",
        });
      }, 2000); // đợi 2 giây

      return () => clearTimeout(timeoutId);
    }
  }, [loadingVaccination, activeTab, vaccinationNotifications]);

  // Render nội dung tab hiện tại
  const renderTabContent = () => {
    if (activeTab === "health-checkup") {
      return renderHealthCheckupContent();
    } else if (activeTab === "vaccination") {
      return (
        <div className="pn-vaccination-content">
          {/* Hiển thị bộ lọc nếu có dữ liệu */}
          {vaccinationNotifications.length > 0 &&
            renderVaccinationFilterControls()}

          {/* Debug controls (nếu cần) */}
          {loading && (
            <div className="pn-loading">
              <div className="pn-spinner"></div>
            </div>
          )}

          {vaccinationNotifications.length === 0 ? (
            <div className="pn-no-data">
              <i className="fas fa-inbox pn-no-data-icon"></i>
              <p className="pn-no-data-text">Không có thông báo tiêm chủng</p>
            </div>
          ) : filteredVaccinationData.length === 0 ? (
            <div className="pn-no-data">
              <i className="fas fa-search pn-no-data-icon"></i>
              <p className="pn-no-data-text">
                Không tìm thấy thông báo nào phù hợp với bộ lọc hiện tại
              </p>
              <button
                className="pn-clear-filters"
                onClick={clearAllVaccinationFilters}
              >
                <i className="fas fa-refresh"></i>
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="pn-vaccination-list">
              {currentVaccinationData.map((notification, index) => {
                return (
                  <div
                    key={notification.id || index}
                    className="pn-vaccination-item"
                    onClick={() => {
                      handleVaccinationClick(notification.id);
                    }}
                  >
                    <div className="pn-vaccination-content-inner">
                      <div className="pn-vaccination-info">
                        <h4 className="pn-vaccination-title">
                          {notification.title || "Thông báo tiêm chủng"}
                        </h4>
                        <p className="pn-vaccination-date">
                          Ngày nhận:{" "}
                          {notification.receivedDate
                            ? new Date(
                                notification.receivedDate
                              ).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="pn-vaccination-arrow">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <PaginationControls
            currentPage={vaccinationPage}
            totalPages={getTotalPages(filteredVaccinationData.length)}
            onPrevPage={goToPrevVaccinationPage}
            onNextPage={goToNextVaccinationPage}
            onGoToPage={goToVaccinationPage}
            dataLength={filteredVaccinationData.length}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="parent-content-wrapper">
      <div className="pn-root">
        <div className="pn-container">
          {/* Header */}
          <div className="pn-header">
            <div className="pn-header-title">
              <h1 className="pn-title">
                <i className="fas fa-bell pn-title-icon"></i>
                Thông báo
              </h1>
              <p className="pn-subtitle">
                Quản lý các thông báo và yêu cầu từ nhà trường
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="pn-tabs">
            <button
              className={`pn-tab ${
                activeTab === "health-checkup" ? "pn-tab--active" : ""
              }`}
              onClick={() => handleTabClick("health-checkup")}
            >
              <i className="fas fa-stethoscope pn-tab-icon"></i>
              Kiểm tra sức khỏe định kỳ
            </button>
            <button
              className={`pn-tab ${
                activeTab === "vaccination" ? "pn-tab--active" : ""
              }`}
              onClick={() => handleTabClick("vaccination")}
            >
              <i className="fas fa-syringe pn-tab-icon"></i>
              Thông báo tiêm chủng
            </button>
          </div>

          {/* Content */}
          <div className="pn-content">
            <div className="pn-tab-content">{renderTabContent()}</div>
          </div>

          {/* Modal chi tiết consent */}
          <ConsentDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            consentId={selectedConsentId}
            onConsentUpdated={handleConsentUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
