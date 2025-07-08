import React, { useState, useEffect } from "react";
import "./Notifications.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../../../../context/AuthContext";
import { useStudentData } from "../../../../context/StudentDataContext";
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";
import { toast } from "react-toastify";
import TestAPIWithContext from "./TestAPIWithContext";
import ConsentDetailModal from "./ConsentDetailModal";
import DebugParentNotes from "./DebugParentNotes";

const Notifications = () => {
  // State chính
  const [activeTab, setActiveTab] = useState("health-checkup");
  const [loading, setLoading] = useState(false);

  // State cho thông báo kiểm tra sức khỏe định kỳ
  const [consentList, setConsentList] = useState([]);
  const [filteredConsentList, setFilteredConsentList] = useState([]);
  const [selectedConsentId, setSelectedConsentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    if (parentInfo?.id) {
      console.log(`✅ Found parentId from parentInfo: ${parentInfo.id}`);
      return parentInfo.id;
    }
    if (students?.length > 0 && students[0].parentId) {
      console.log(`✅ Found parentId from students: ${students[0].parentId}`);
      return students[0].parentId;
    }
    console.log("⚠️ No parentId found, returning null");
    return null;
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

  // Render tab buttons
  const renderTabButtons = () => (
    <div className="notification-tabs">
      <button
        className={`tab-button ${
          activeTab === "health-checkup" ? "active" : ""
        }`}
        onClick={() => setActiveTab("health-checkup")}
      >
        <i className="fas fa-stethoscope"></i>
        Kiểm tra sức khỏe định kỳ
      </button>
      <button
        className={`tab-button ${activeTab === "vaccination" ? "active" : ""}`}
        onClick={() => setActiveTab("vaccination")}
        disabled
      >
        <i className="fas fa-syringe"></i>
        Thông báo tiêm chủng
        <span className="coming-soon">(Sắp có)</span>
      </button>
      <button
        className={`tab-button ${activeTab === "others" ? "active" : ""}`}
        onClick={() => setActiveTab("others")}
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

  // Render nội dung tab hiện tại
  const renderTabContent = () => {
    switch (activeTab) {
      case "health-checkup":
        return renderHealthCheckupContent();
      case "vaccination":
        return (
          <div className="coming-soon-content">
            <i className="fas fa-syringe"></i>
            <h3>Thông báo tiêm chủng</h3>
            <p>Tính năng này sẽ được cập nhật sớm</p>
          </div>
        );
      case "others":
        return (
          <div className="coming-soon-content">
            <i className="fas fa-bell"></i>
            <h3>Thông báo khác</h3>
            <p>Tính năng này sẽ được cập nhật sớm</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="notifications-container">
      {/* API Test Component with Context */}
      <TestAPIWithContext />

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

      {/* Debug component for parent notes */}
      <DebugParentNotes />
    </div>
  );
};

export default Notifications;
