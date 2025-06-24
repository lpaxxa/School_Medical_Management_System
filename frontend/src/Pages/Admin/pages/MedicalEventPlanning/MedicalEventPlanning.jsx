import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaSyringe,
  FaHeartbeat,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import "./MedicalEventPlanning.css";

const MedicalEventPlanning = () => {
  // Tab active state
  const [activeTab, setActiveTab] = useState("vaccination");

  // Thông tin chung cho cả 2 loại kế hoạch
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State cho data
  const [vaccinationPlans, setVaccinationPlans] = useState([]);
  const [checkupPlans, setCheckupPlans] = useState([]);

  // State cho form tạo mới
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    targetGroup: "",
    location: "",
    status: "pending",
  });

  // Mock data
  useEffect(() => {
    // Dữ liệu mẫu kế hoạch tiêm chủng
    const mockVaccinationPlans = [
      {
        id: 1,
        title: "Tiêm phòng COVID-19 đợt 3",
        description:
          "Tiêm mũi nhắc lại vaccine COVID-19 cho học sinh toàn trường",
        startDate: "2023-09-15",
        endDate: "2023-09-20",
        targetGroup: "Học sinh lớp 10-12",
        location: "Phòng y tế trường",
        vaccineType: "Pfizer",
        doseCount: "Mũi nhắc lại",
        status: "completed",
        participantsCount: 450,
        createdBy: "Nguyễn Thị Y Tá",
        createdAt: "2023-08-25",
      },
      {
        id: 2,
        title: "Tiêm vaccine cúm mùa",
        description: "Tiêm vaccine phòng cúm mùa cho học sinh khối 11",
        startDate: "2023-10-10",
        endDate: "2023-10-15",
        targetGroup: "Học sinh khối 11",
        location: "Phòng y tế trường",
        vaccineType: "Influvac Tetra",
        doseCount: "1 mũi",
        status: "ongoing",
        participantsCount: 320,
        createdBy: "Trần Văn Quản Lý",
        createdAt: "2023-09-15",
      },
      {
        id: 3,
        title: "Tiêm phòng viêm gan B",
        description: "Chiến dịch tiêm phòng viêm gan B cho học sinh mới",
        startDate: "2023-11-05",
        endDate: "2023-11-10",
        targetGroup: "Học sinh lớp 10",
        location: "Trung tâm y tế quận",
        vaccineType: "Engerix-B",
        doseCount: "Mũi 1/3",
        status: "pending",
        participantsCount: 120,
        createdBy: "Nguyễn Thị Y Tá",
        createdAt: "2023-10-01",
      },
      {
        id: 4,
        title: "Tiêm vaccine HPV",
        description: "Chương trình tiêm vaccine HPV cho học sinh nữ",
        startDate: "2023-12-01",
        endDate: "2023-12-05",
        targetGroup: "Học sinh nữ lớp 10-11",
        location: "Phòng y tế trường",
        vaccineType: "Gardasil",
        doseCount: "Mũi 1/2",
        status: "cancelled",
        participantsCount: 0,
        createdBy: "Trần Văn Quản Lý",
        createdAt: "2023-10-15",
      },
    ];

    // Dữ liệu mẫu kế hoạch khám sức khỏe
    const mockCheckupPlans = [
      {
        id: 1,
        title: "Khám sức khỏe đầu năm học",
        description: "Khám sức khỏe tổng quát cho học sinh toàn trường",
        startDate: "2023-08-20",
        endDate: "2023-08-30",
        targetGroup: "Học sinh toàn trường",
        location: "Phòng thể dục trường",
        checkupType: "Tổng quát",
        specialists: "Bác sĩ đa khoa, Nha sĩ, Nhãn khoa",
        status: "completed",
        participantsCount: 1200,
        createdBy: "Trần Văn Quản Lý",
        createdAt: "2023-07-15",
      },
      {
        id: 2,
        title: "Tầm soát cận thị học đường",
        description: "Khám mắt phát hiện sớm cận thị cho học sinh",
        startDate: "2023-10-15",
        endDate: "2023-10-25",
        targetGroup: "Học sinh lớp 10",
        location: "Phòng y tế trường",
        checkupType: "Chuyên khoa Mắt",
        specialists: "Bác sĩ nhãn khoa",
        status: "ongoing",
        participantsCount: 150,
        createdBy: "Nguyễn Thị Y Tá",
        createdAt: "2023-09-20",
      },
      {
        id: 3,
        title: "Kiểm tra sức khỏe răng miệng",
        description: "Khám và tư vấn chăm sóc răng miệng cho học sinh",
        startDate: "2023-11-10",
        endDate: "2023-11-15",
        targetGroup: "Học sinh khối 11",
        location: "Phòng y tế trường",
        checkupType: "Nha khoa",
        specialists: "Bác sĩ nha khoa",
        status: "pending",
        participantsCount: 320,
        createdBy: "Trần Văn Quản Lý",
        createdAt: "2023-10-10",
      },
      {
        id: 4,
        title: "Khám dinh dưỡng và thể lực",
        description: "Đánh giá tình trạng dinh dưỡng và thể lực học sinh",
        startDate: "2023-12-10",
        endDate: "2023-12-20",
        targetGroup: "Học sinh toàn trường",
        location: "Nhà thi đấu trường",
        checkupType: "Dinh dưỡng học đường",
        specialists: "Chuyên gia dinh dưỡng, Bác sĩ thể dục thể thao",
        status: "pending",
        participantsCount: 1200,
        createdBy: "Nguyễn Thị Y Tá",
        createdAt: "2023-11-01",
      },
    ];

    setVaccinationPlans(mockVaccinationPlans);
    setCheckupPlans(mockCheckupPlans);
  }, []);

  // Lọc kế hoạch theo tab hiện tại
  const getFilteredPlans = () => {
    const plans = activeTab === "vaccination" ? vaccinationPlans : checkupPlans;

    return plans
      .filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((plan) => filterStatus === "all" || plan.status === filterStatus);
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Status badge color helper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "ongoing":
        return "status-ongoing";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  // Vietnamese status label helper
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ thực hiện";
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Xử lý tạo kế hoạch mới
  const handleCreatePlan = (e) => {
    e.preventDefault();

    const newId =
      Math.max(
        ...(activeTab === "vaccination"
          ? vaccinationPlans.map((p) => p.id)
          : checkupPlans.map((p) => p.id)),
        0
      ) + 1;

    const plan = {
      ...newPlan,
      id: newId,
      participantsCount: 0,
      createdBy: "Admin",
      createdAt: new Date().toISOString().slice(0, 10),
      // Thêm trường riêng theo loại kế hoạch
      ...(activeTab === "vaccination"
        ? {
            vaccineType: newPlan.additionalField1,
            doseCount: newPlan.additionalField2,
          }
        : {
            checkupType: newPlan.additionalField1,
            specialists: newPlan.additionalField2,
          }),
    };

    if (activeTab === "vaccination") {
      setVaccinationPlans([...vaccinationPlans, plan]);
    } else {
      setCheckupPlans([...checkupPlans, plan]);
    }

    // Reset form and close modal
    setNewPlan({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      targetGroup: "",
      location: "",
      status: "pending",
      additionalField1: "",
      additionalField2: "",
    });
    setShowCreateModal(false);
  };

  // Handle delete plan
  const handleDeletePlan = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kế hoạch này không?")) {
      if (activeTab === "vaccination") {
        setVaccinationPlans(vaccinationPlans.filter((plan) => plan.id !== id));
      } else {
        setCheckupPlans(checkupPlans.filter((plan) => plan.id !== id));
      }
    }
  };

  // Render UI
  return (
    <div className="medical-planning-page">
      <div className="planning-header">
        <h1>Quản lý kế hoạch y tế</h1>
        <p>Lập kế hoạch tiêm chủng và khám sức khỏe định kỳ cho học sinh</p>
      </div>

      {/* Tab Navigation */}
      <div className="planning-tabs">
        <button
          className={`tab-button ${
            activeTab === "vaccination" ? "active" : ""
          }`}
          onClick={() => setActiveTab("vaccination")}
        >
          <FaSyringe /> Kế hoạch tiêm chủng
        </button>
        <button
          className={`tab-button ${activeTab === "checkup" ? "active" : ""}`}
          onClick={() => setActiveTab("checkup")}
        >
          <FaHeartbeat /> Kế hoạch khám sức khỏe
        </button>
      </div>

      {/* Toolbar actions */}
      <div className="planning-toolbar">
        <div className="search-filter-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm kế hoạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <FaFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ thực hiện</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <button
          className="create-button"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Tạo kế hoạch mới
        </button>
      </div>

      {/* Plans list */}
      <div className="plans-list">
        {getFilteredPlans().length > 0 ? (
          getFilteredPlans().map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-header">
                <h3>{plan.title}</h3>
                <div
                  className={`status-badge ${getStatusBadgeClass(plan.status)}`}
                >
                  {getStatusLabel(plan.status)}
                </div>
              </div>

              <p className="plan-description">{plan.description}</p>

              <div className="plan-details">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>
                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                  </span>
                </div>

                <div className="detail-item">
                  <FaUsers className="detail-icon" />
                  <span>{plan.targetGroup}</span>
                </div>

                <div className="detail-item">
                  <FaUserMd className="detail-icon" />
                  <span>
                    {activeTab === "vaccination"
                      ? `Vaccine: ${plan.vaccineType} (${plan.doseCount})`
                      : `Loại khám: ${plan.checkupType}`}
                  </span>
                </div>
              </div>

              <div className="plan-meta">
                <div className="meta-info">
                  <span className="participants-count">
                    {plan.participantsCount} học sinh tham gia
                  </span>
                  <span className="created-by">
                    Tạo bởi {plan.createdBy} ({formatDate(plan.createdAt)})
                  </span>
                </div>

                <div className="plan-actions">
                  <button className="action-button edit">
                    <FaEdit />
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-plans-message">
            <FaCalendarAlt className="no-plans-icon" />
            <p>Không tìm thấy kế hoạch nào phù hợp với tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Create plan modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {activeTab === "vaccination"
                  ? "Tạo kế hoạch tiêm chủng mới"
                  : "Tạo kế hoạch khám sức khỏe mới"}
              </h2>
              <button
                className="close-button"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePlan}>
              <div className="form-group">
                <label>Tiêu đề kế hoạch</label>
                <input
                  type="text"
                  required
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề kế hoạch"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  required
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  placeholder="Nhập mô tả chi tiết kế hoạch"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={newPlan.startDate}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    value={newPlan.endDate}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Đối tượng tham gia</label>
                <input
                  type="text"
                  required
                  value={newPlan.targetGroup}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, targetGroup: e.target.value })
                  }
                  placeholder="VD: Học sinh khối 10"
                />
              </div>

              <div className="form-group">
                <label>Địa điểm tổ chức</label>
                <input
                  type="text"
                  required
                  value={newPlan.location}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, location: e.target.value })
                  }
                  placeholder="VD: Phòng y tế trường"
                />
              </div>

              {activeTab === "vaccination" ? (
                <>
                  <div className="form-group">
                    <label>Loại vaccine</label>
                    <input
                      type="text"
                      required
                      value={newPlan.additionalField1 || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          additionalField1: e.target.value,
                        })
                      }
                      placeholder="VD: Pfizer, Sinovac..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Số mũi/Liều lượng</label>
                    <input
                      type="text"
                      required
                      value={newPlan.additionalField2 || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          additionalField2: e.target.value,
                        })
                      }
                      placeholder="VD: Mũi 1/2, Nhắc lại"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Loại khám</label>
                    <input
                      type="text"
                      required
                      value={newPlan.additionalField1 || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          additionalField1: e.target.value,
                        })
                      }
                      placeholder="VD: Khám tổng quát, Khám mắt..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Chuyên khoa/Bác sĩ</label>
                    <input
                      type="text"
                      required
                      value={newPlan.additionalField2 || ""}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          additionalField2: e.target.value,
                        })
                      }
                      placeholder="VD: Bác sĩ nha khoa, Nhãn khoa"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={newPlan.status}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, status: e.target.value })
                  }
                >
                  <option value="pending">Chờ thực hiện</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="save-button">
                  Tạo kế hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalEventPlanning;
