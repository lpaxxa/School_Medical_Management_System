import React, { useState, useEffect } from "react";
import "./Notifications.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";
import notificationService from "../../../../services/notificationService";
import { toast } from "react-toastify";
import ConsentDetailModal from "./ConsentDetailModal";

const Notifications = () => {
  // State chính
  const [activeTab, setActiveTab] = useState("health-checkup");
  const [loading, setLoading] = useState(false);

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

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    studentId: "", // Lọc theo học sinh
    consentStatus: "", // Lọc theo trạng thái phản hồi
    academicYear: "", // Lọc theo năm học
  });

  // Context hooks
  const { currentUser } = useAuth();
  const { students, parentInfo } = useStudentData();

  // Helper function để lấy parentId
  const getParentId = () => {
    console.log("🔍 Getting parentId...");
    console.log("📊 parentInfo:", parentInfo);
    console.log("👥 students:", students);

    // Nếu đang chạy môi trường development và không tìm thấy parentId, sử dụng id cứng = 1 cho test
    const isDevelopment =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost";

    let foundParentId = null;

    if (parentInfo?.id) {
      console.log(`✅ Found parentId from parentInfo: ${parentInfo.id}`);
      foundParentId = parentInfo.id;
    } else if (students?.length > 0 && students[0].parentId) {
      console.log(`✅ Found parentId from students: ${students[0].parentId}`);
      foundParentId = students[0].parentId;
    } else {
      console.log("⚠️ No parentId found in context data");

      // Sử dụng giá trị cứng cho môi trường phát triển
      if (isDevelopment) {
        console.log(
          "⚠️ Using hardcoded parentId=1 for development environment"
        );
        foundParentId = 1;
      } else {
        console.log("⚠️ No parentId available, returning null");
        foundParentId = null;
      }
    }

    console.log(`🔑 Final parentId used: ${foundParentId}`);
    return foundParentId;
  };

  // Helper functions cho lọc dữ liệu
  const getUniqueStudents = () => {
    const uniqueStudents = [];
    const seenIds = new Set();

    console.log(
      "🎓 Getting unique students from data:",
      consentList.length,
      "consents"
    );

    consentList.forEach((consent) => {
      if (!seenIds.has(consent.studentId)) {
        seenIds.add(consent.studentId);
        const student = {
          id: consent.studentId,
          name: consent.studentName,
          class: consent.studentClass,
        };
        uniqueStudents.push(student);
        console.log("📝 Added student:", student);
      }
    });

    const sortedStudents = uniqueStudents.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    console.log("✅ Final unique students list:", sortedStudents);
    return sortedStudents;
  };

  // Helper function để lấy danh sách năm học từ dữ liệu
  const getUniqueAcademicYears = () => {
    const academicYears = [];
    const seenYears = new Set();

    console.log(
      "📅 Getting unique academic years from data:",
      consentList.length,
      "consents"
    );

    consentList.forEach((consent) => {
      let academicYear;

      // Nếu data có field academicYear thì dùng
      if (consent.academicYear) {
        academicYear = consent.academicYear;
      } else {
        // Nếu không có thì tạo từ campaignStartDate
        const startDate = new Date(consent.campaignStartDate);
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1; // getMonth() trả về 0-11

        // Năm học thường bắt đầu từ tháng 8-9
        if (month >= 8) {
          academicYear = `${year}-${year + 1}`;
        } else {
          academicYear = `${year - 1}-${year}`;
        }
      }

      if (!seenYears.has(academicYear)) {
        seenYears.add(academicYear);
        academicYears.push(academicYear);
        console.log("📝 Added academic year:", academicYear);
      }
    });

    // Sắp xếp theo thứ tự giảm dần (năm mới nhất trước)
    const sortedYears = academicYears.sort((a, b) => {
      const yearA = parseInt(a.split("-")[0]);
      const yearB = parseInt(b.split("-")[0]);
      return yearB - yearA;
    });

    console.log("✅ Final unique academic years list:", sortedYears);
    return sortedYears;
  };

  // Function để lọc dữ liệu theo các điều kiện
  const filterConsentList = () => {
    let filtered = [...consentList];

    // Debug logging
    console.log("🔍 Filtering data...");
    console.log("📊 Original list:", consentList.length, "items");
    console.log("🎯 Current filters:", filters);

    // Lọc theo học sinh
    if (filters.studentId) {
      console.log("👨‍🎓 Filtering by studentId:", filters.studentId);
      console.log(
        "📋 Available studentIds in data:",
        consentList.map((c) => ({
          id: c.studentId,
          name: c.studentName,
          type: typeof c.studentId,
        }))
      );

      filtered = filtered.filter((consent) => {
        // So sánh cả string và number để tránh lỗi type mismatch
        const match = String(consent.studentId) === String(filters.studentId);
        if (match) {
          console.log(
            "✅ Found match:",
            consent.studentName,
            consent.studentId
          );
        }
        return match;
      });

      console.log("🎯 After student filter:", filtered.length, "items");
    }

    // Lọc theo trạng thái phản hồi
    if (filters.consentStatus) {
      console.log("✅ Filtering by consentStatus:", filters.consentStatus);
      filtered = filtered.filter(
        (consent) => consent.consentStatus === filters.consentStatus
      );
      console.log("🎯 After status filter:", filtered.length, "items");
    }

    // Lọc theo năm học
    if (filters.academicYear) {
      console.log("📅 Filtering by academic year:", filters.academicYear);
      filtered = filtered.filter((consent) => {
        let consentAcademicYear;

        // Nếu data có field academicYear thì dùng
        if (consent.academicYear) {
          consentAcademicYear = consent.academicYear;
        } else {
          // Nếu không có thì tạo từ campaignStartDate
          const startDate = new Date(consent.campaignStartDate);
          const year = startDate.getFullYear();
          const month = startDate.getMonth() + 1;

          if (month >= 8) {
            consentAcademicYear = `${year}-${year + 1}`;
          } else {
            consentAcademicYear = `${year - 1}-${year}`;
          }
        }

        return consentAcademicYear === filters.academicYear;
      });
      console.log("🎯 After academic year filter:", filtered.length, "items");
    }

    console.log("🎉 Final filtered result:", filtered.length, "items");
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

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value !== "").length;
  };

  // Load dữ liệu kiểm tra sức khỏe khi component mount hoặc khi có parentId
  useEffect(() => {
    console.log("🔄 useEffect triggered with activeTab:", activeTab);
    console.log("📊 parentInfo:", parentInfo);
    console.log("👥 students:", students);

    if (activeTab === "health-checkup") {
      const parentId = getParentId();
      if (parentId) {
        console.log(`🚀 Parent ID available: ${parentId}, loading data...`);
        loadHealthCheckupList();
      } else {
        console.log("⏳ Waiting for parent ID to be available...");
        // Set a fallback data while waiting
        if (parentInfo === null && students.length === 0) {
          // Still loading contexts
          console.log("📱 Context still loading, wait a bit more...");
        } else {
          // Context loaded but no parentId found
          console.log("⚠️ Context loaded but no parentId found");
          setConsentList([]);
          setFilteredConsentList([]);
        }
      }
    } else if (activeTab === "vaccination") {
      const parentId = getParentId();
      console.log(`💉 Vaccination tab selected, parentId: ${parentId}`);
      if (parentId) {
        console.log(
          `🚀 Parent ID available: ${parentId}, loading vaccination notifications...`
        );
        loadVaccinationNotifications(parentId);
      } else {
        console.log("❌ No parentId for vaccination, setting empty array");
        setVaccinationNotifications([]);
      }
    }
  }, [activeTab, parentInfo, students]); // Dependencies để reload khi có data

  // Cập nhật danh sách đã lọc khi consentList hoặc filters thay đổi
  useEffect(() => {
    const filtered = filterConsentList();
    setFilteredConsentList(filtered);
  }, [consentList, filters]);

  // Load danh sách consent kiểm tra sức khỏe
  const loadHealthCheckupList = async () => {
    setLoading(true);
    try {
      const parentId = getParentId();

      console.log("🔍 Parent ID from context:", parentId);
      console.log("📊 Parent Info:", parentInfo);
      console.log("👥 Students:", students);

      if (!parentId) {
        console.warn("❌ No parent ID found");
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
      console.log(`🚀 Calling API with parentId: ${parentId}`);
      const response = await healthCheckupConsentService.getAllConsents(
        parentId
      );

      // Transform data từ API response thành format cho UI
      const transformedData = [];
      console.log("🔄 Transforming API response:", response);

      if (response?.childrenNotifications) {
        response.childrenNotifications.forEach((child) => {
          console.log("👶 Processing child:", {
            studentId: child.studentId,
            studentName: child.studentName,
            studentClass: child.studentClass,
            type: typeof child.studentId,
          });

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
            console.log("📋 Added consent:", consentItem);
          });
        });
      }

      console.log("✅ Final transformed data:", transformedData);

      setConsentList(transformedData);
      setFilteredConsentList(transformedData); // Set initial filtered data
      console.log(
        "✅ API call successful, loaded",
        transformedData.length,
        "notifications"
      );

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

        console.log("⚠️ No API data, using test data:", testData);
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
      console.error("❌ Error loading health checkup list:", error);
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

      console.log(
        `🔍 Đang gọi API lấy thông báo tiêm chủng với parentId=${parentId}`
      );
      let response;

      try {
        // Thử gọi API thông qua proxy trước
        response = await notificationService.getVaccinationNotifications(
          parentId
        );
        console.log("✅ API proxy hoạt động tốt:", response);

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
        console.log("✅ API trực tiếp hoạt động tốt:", response);

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
        console.log("📋 Vaccination notifications data:", response.data);
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
        console.log("📋 Không có dữ liệu từ API, sử dụng dữ liệu mẫu");
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
      console.error("❌ Error loading vaccination notifications:", error);
      console.error("Chi tiết lỗi:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
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
      console.log(
        `🔍 Đang gọi API chi tiết thông báo tiêm chủng với notificationId=${notificationId}, parentId=${parentId}`
      );
      let response;

      try {
        // Thử gọi API thông qua proxy trước
        response = await notificationService.getVaccinationNotificationDetail(
          notificationId,
          parentId
        );
        console.log("✅ API chi tiết proxy hoạt động tốt:", response);
      } catch (proxyError) {
        console.error("❌ Lỗi khi gọi chi tiết qua proxy:", proxyError);
        console.log("🔄 Thử gọi API chi tiết trực tiếp...");

        // Nếu lỗi, thử gọi trực tiếp
        response =
          await notificationService.direct.getVaccinationNotificationDetail(
            notificationId,
            parentId
          );
        console.log("✅ API chi tiết trực tiếp hoạt động tốt:", response);
      }

      if (response && response.data) {
        console.log("📋 Vaccination notification detail data:", response.data);
        setVaccinationDetail(response.data);
        setShowVaccinationDetail(true);
      } else {
        console.log(
          "❌ Không có dữ liệu chi tiết trả về từ API, sử dụng dữ liệu mẫu"
        );

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
      console.error("❌ Error loading vaccination notification detail:", error);
      console.error("Chi tiết lỗi:", error.message);

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
        console.error("❌ Error responding to vaccination:", error);
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
          <div className="consent-status-badge pending">
            <i className="fas fa-clock"></i>
            Chờ phản hồi
          </div>
        );
      case "APPROVED":
        return (
          <div className="consent-status-badge confirmed">
            <i className="fas fa-check-circle"></i>
            Đồng ý
          </div>
        );
      case "REJECTED":
        return (
          <div className="consent-status-badge rejected">
            <i className="fas fa-times-circle"></i>
            Từ chối
          </div>
        );
      default:
        return (
          <div className="consent-status-badge unknown">
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
      <div className="filter-controls">
        <div className="filter-header">
          <h3>
            <i className="fas fa-filter"></i>
            Bộ lọc
            {activeFilters > 0 && (
              <span className="filter-count">({activeFilters})</span>
            )}
          </h3>
          {activeFilters > 0 && (
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
              title="Xóa tất cả bộ lọc"
            >
              <i className="fas fa-times"></i>
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="filter-row">
          {/* Lọc theo năm học */}
          <div className="filter-group">
            <label>
              <i className="fas fa-calendar-alt"></i>
              Năm học
            </label>
            <select
              value={filters.academicYear}
              onChange={(e) =>
                handleFilterChange("academicYear", e.target.value)
              }
              className="filter-select"
            >
              <option value="">Tất cả năm học</option>
              {uniqueAcademicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo học sinh */}
          <div className="filter-group">
            <label>
              <i className="fas fa-user-graduate"></i>
              Học sinh
            </label>
            <select
              value={filters.studentId}
              onChange={(e) => handleFilterChange("studentId", e.target.value)}
              className="filter-select"
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
          <div className="filter-group">
            <label>
              <i className="fas fa-check-circle"></i>
              Trạng thái phản hồi
            </label>
            <select
              value={filters.consentStatus}
              onChange={(e) =>
                handleFilterChange("consentStatus", e.target.value)
              }
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ phản hồi</option>
              <option value="APPROVED">Đã đồng ý</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Hiển thị số kết quả */}
        <div className="filter-results">
          <span className="result-count">
            <i className="fas fa-list"></i>
            Hiển thị {filteredConsentList.length} / {consentList.length} thông
            báo
          </span>

          {/* Debug button */}
          <button
            className="debug-btn"
            onClick={() => {
              console.log("🐛 DEBUG INFO:");
              console.log("📊 Current filters:", filters);
              console.log("📋 Original data:", consentList);
              console.log("🎯 Filtered data:", filteredConsentList);
              console.log("👥 Unique students:", getUniqueStudents());
              console.log(
                "📅 Unique academic years:",
                getUniqueAcademicYears()
              );
              alert("Debug info printed to console. Check F12 -> Console tab");
            }}
            style={{
              padding: "6px 12px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.8rem",
              cursor: "pointer",
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
    console.log(`🔄 Tab changed to ${tabName}`);
    setActiveTab(tabName);

    // Khi chuyển tab, cần reload dữ liệu tương ứng
    const parentId = getParentId();
    if (parentId) {
      if (tabName === "health-checkup") {
        console.log("🔄 Loading health checkup data after tab change");
        loadHealthCheckupList();
      } else if (tabName === "vaccination") {
        console.log("🔄 Loading vaccination notifications after tab change");
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
      <button
        className={`tab-button ${activeTab === "others" ? "active" : ""}`}
        onClick={() => handleTabClick("others")}
        disabled
      >
        <i className="fas fa-bell"></i>
        Thông báo khác
        <span className="coming-soon">(Sắp có)</span>
      </button>
    </div>
  );

  // Render nội dung kiểm tra sức khỏe định kỳ
  const renderHealthCheckupContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    return (
      <div className="health-checkup-content">
        {/* Hiển thị bộ lọc nếu có dữ liệu */}
        {consentList.length > 0 && renderFilterControls()}

        {/* Hiển thị danh sách hoặc thông báo không có dữ liệu */}
        {consentList.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-info-circle"></i>
            <p>Không có thông báo kiểm tra sức khỏe nào</p>
          </div>
        ) : filteredConsentList.length === 0 ? (
          <div className="no-filtered-data">
            <i className="fas fa-search"></i>
            <p>Không tìm thấy thông báo nào phù hợp với bộ lọc hiện tại</p>
            <button className="reset-filters-btn" onClick={clearAllFilters}>
              <i className="fas fa-refresh"></i>
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="consent-list">
            {filteredConsentList.map((consent) => (
              <div
                key={consent.id}
                className="consent-item"
                onClick={() => handleConsentClick(consent.id)}
              >
                <div className="consent-item-content">
                  <div className="consent-item-title">
                    {consent.campaignTitle}
                  </div>
                  <div className="consent-item-meta">
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
      </div>
    );
  };

  // Render nội dung tab tiêm chủng
  const renderVaccinationContent = () => {
    try {
      console.log("🔄 renderVaccinationContent called");
      console.log("🔍 activeTab:", activeTab);
      console.log("📊 vaccinationNotifications:", vaccinationNotifications);
      console.log("🔄 loadingVaccination:", loadingVaccination);
      console.log("📱 showVaccinationDetail:", showVaccinationDetail);

      // Chọn dữ liệu hiển thị dựa trên trạng thái hiện tại
      const displayData = vaccinationNotifications || [];
      console.log("📊 Display data for vaccination tab:", displayData);

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
        console.log("🔄 Showing loading spinner");
        return (
          <div className="vaccination-content">
            <div className="debug-controls">
              <div className="debug-status">Đang tải dữ liệu...</div>
            </div>
            <LoadingSpinner />
          </div>
        );
      }

      console.log(
        "🎯 Rendering vaccination list, data length:",
        displayData.length
      );

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
                console.log("🔄 Tải lại dữ liệu tiêm chủng...");
                console.log("🔑 Current parentId:", parentId);
                console.log("📊 Current data:", vaccinationNotifications);
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
                console.log("🚀 Force setting sample data...");
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
              {displayData.map((notification, index) => {
                console.log(
                  `🎯 Rendering notification ${index}:`,
                  notification
                );
                return (
                  <div
                    key={notification.id || index}
                    className="vaccination-item"
                    onClick={() => {
                      console.log("🖱️ Clicked notification:", notification.id);
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
      console.error("❌ Error in renderVaccinationContent:", error);
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
  useEffect(() => {
    console.log(
      "👀 vaccinationNotifications state changed:",
      vaccinationNotifications
    );
  }, [vaccinationNotifications]);

  // Effect để tự động tải dữ liệu mẫu nếu không có dữ liệu sau khi API trả về
  useEffect(() => {
    if (
      !loadingVaccination &&
      activeTab === "vaccination" &&
      (!vaccinationNotifications || vaccinationNotifications.length === 0)
    ) {
      console.log(
        "🚫 Không có dữ liệu sau khi API trả về, tự động tải dữ liệu mẫu"
      );

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

        console.log("🔄 Tự động tải dữ liệu mẫu:", sampleData);
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
    console.log("🎯 renderTabContent called with activeTab:", activeTab);
    switch (activeTab) {
      case "health-checkup":
        console.log("🏥 Rendering health-checkup content");
        return renderHealthCheckupContent();
      case "vaccination":
        console.log("💉 Rendering vaccination content");
        return renderVaccinationContent();
      case "others":
        console.log("📝 Rendering others content");
        return (
          <div className="coming-soon-content">
            <i className="fas fa-bell"></i>
            <h3>Thông báo khác</h3>
            <p>Tính năng này sẽ được cập nhật sớm</p>
          </div>
        );
      default:
        console.log("❓ Unknown tab, returning null");
        return null;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-bell"></i>
            Thông báo
          </h1>
          <p>Quản lý các thông báo và yêu cầu từ nhà trường</p>
        </div>
      </div>

      <div className="notifications-content">
        {renderTabButtons()}
        <div className="tab-content">{renderTabContent()}</div>
      </div>

      {/* Modal chi tiết consent */}
      <ConsentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        consentId={selectedConsentId}
        onConsentUpdated={handleConsentUpdated}
      />
    </div>
  );
};

export default Notifications;
