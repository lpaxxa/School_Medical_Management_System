import React, { useState, useEffect } from "react";
import medicationRequestService from "../../../../services/medicationRequestService";
import { useAuth } from "../../../../context/AuthContext";
import "./styles/demo.css";

const MedicationRequestDemo = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedTab, setSelectedTab] = useState("fetch");
  const { API_ENDPOINTS } = useAuth();

  // Example form data structure for creating a new request
  const [newRequest, setNewRequest] = useState({
    studentId: "",
    medicineName: "Vitamin C",
    dosage: "1 viên mỗi sáng",
    frequency: "1",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 1 week later
    timeToTake: ["08:00"],
    notes: "Uống sau ăn sáng",
    prescriptionImage: null,
  });

  // Fetch medication history on component mount
  useEffect(() => {
    fetchMedicationHistory();
  }, []);

  // Function to fetch medication history
  const fetchMedicationHistory = async () => {
    setLoading(true);
    setMessage("Đang lấy lịch sử yêu cầu thuốc...");

    try {
      const medicationHistory =
        await medicationRequestService.fetchMedicationHistory();
      setHistory(medicationHistory || []);
      setMessage(`Đã tải ${medicationHistory?.length || 0} yêu cầu thuốc.`);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
      setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to submit a new request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Đang gửi yêu cầu thuốc mới...");

    try {
      const response = await medicationRequestService.submitMedicationRequest(
        newRequest
      );
      setMessage("Gửi yêu cầu thành công!");
      fetchMedicationHistory();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to update a request
  const handleUpdateRequest = async () => {
    if (!selectedRequest) {
      setMessage("Vui lòng chọn một yêu cầu để cập nhật.");
      return;
    }

    setLoading(true);
    setMessage(`Đang cập nhật yêu cầu ID: ${selectedRequest.id}...`);

    try {
      // Keep all existing properties from the selected request
      const updatedRequest = {
        ...selectedRequest,
        // Update the medication information
        // Use the exact field names from the history API
        medicationName:
          selectedRequest.medicationName || selectedRequest.medicineName,
        dosageInstructions:
          selectedRequest.dosageInstructions || selectedRequest.dosage,
        frequencyPerDay:
          selectedRequest.frequencyPerDay || selectedRequest.frequency,
        specialInstructions:
          (selectedRequest.specialInstructions || selectedRequest.notes || "") +
          " - Đã cập nhật",

        // Add note to indicate update
        notes: (selectedRequest.notes || "") + " - Đã cập nhật",
      };

      // Add (đã cập nhật) to medication name
      if (updatedRequest.medicationName) {
        updatedRequest.medicationName += " (đã cập nhật)";
      }

      // Convert timeOfDay string to proper format if needed
      if (
        typeof updatedRequest.timeOfDay === "string" &&
        !Array.isArray(updatedRequest.timeToTake)
      ) {
        try {
          // Try to parse the JSON string to get the array
          const timeArray = JSON.parse(updatedRequest.timeOfDay);
          updatedRequest.timeToTake = Array.isArray(timeArray)
            ? timeArray
            : [timeArray];
        } catch (e) {
          // If parsing fails, try to extract from string format ["08:00", "13:00"]
          const matches = updatedRequest.timeOfDay.match(/"([^"]*)"/g);
          if (matches) {
            updatedRequest.timeToTake = matches.map((m) => m.replace(/"/g, ""));
          } else {
            updatedRequest.timeToTake = []; // Default empty array if parsing fails
          }
        }
      }

      console.log("Sending update with data:", updatedRequest);

      await medicationRequestService.updateMedicationRequest(
        selectedRequest.id,
        updatedRequest
      );

      setMessage("Cập nhật yêu cầu thành công!");
      fetchMedicationHistory();
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu:", error);
      setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel a request
  const handleCancelRequest = async () => {
    if (!selectedRequest) {
      setMessage("Vui lòng chọn một yêu cầu để hủy.");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn hủy yêu cầu ID: ${selectedRequest.id} không?`
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage(`Đang hủy yêu cầu ID: ${selectedRequest.id}...`);

    try {
      await medicationRequestService.cancelMedicationRequest(
        selectedRequest.id
      );
      setMessage("Hủy yêu cầu thành công!");
      fetchMedicationHistory();
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu:", error);
      setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to view administration details
  const handleViewDetails = async () => {
    if (!selectedRequest) {
      setMessage("Vui lòng chọn một yêu cầu để xem chi tiết.");
      return;
    }

    setLoading(true);
    setMessage(
      `Đang lấy thông tin chi tiết cho yêu cầu ID: ${selectedRequest.id}...`
    );

    try {
      const details =
        await medicationRequestService.getMedicationAdministrationDetails(
          selectedRequest.id,
          API_ENDPOINTS
        );

      setMessage("Chi tiết yêu cầu: " + JSON.stringify(details, null, 2));
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết:", error);
      setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewRequest({
        ...newRequest,
        prescriptionImage: e.target.files[0],
      });
    }
  };

  // Handle input change for new request
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest({
      ...newRequest,
      [name]: value,
    });
  };

  // Function to select a request
  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setMessage(`Đã chọn yêu cầu ID: ${request.id}`);
  };

  return (
    <div className="medication-request-demo">
      <h1>Demo Yêu Cầu Thuốc</h1>
      <p>Ví dụ sử dụng medicationRequestService.js</p>

      <div className="demo-tabs">
        <button
          className={selectedTab === "fetch" ? "active" : ""}
          onClick={() => setSelectedTab("fetch")}
        >
          Xem Lịch Sử
        </button>
        <button
          className={selectedTab === "submit" ? "active" : ""}
          onClick={() => setSelectedTab("submit")}
        >
          Gửi Yêu Cầu
        </button>
        <button
          className={selectedTab === "update" ? "active" : ""}
          onClick={() => setSelectedTab("update")}
        >
          Cập Nhật/Hủy
        </button>
        <button
          className={selectedTab === "details" ? "active" : ""}
          onClick={() => setSelectedTab("details")}
        >
          Xem Chi Tiết
        </button>
      </div>

      <div className="demo-section">
        {/* Fetch History Section */}
        {selectedTab === "fetch" && (
          <div className="fetch-section">
            <h2>Lịch Sử Yêu Cầu Thuốc</h2>
            <button onClick={fetchMedicationHistory} disabled={loading}>
              {loading ? "Đang tải..." : "Tải Lại Lịch Sử"}
            </button>

            <div className="history-list">
              {history.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Học sinh</th>
                      <th>Thuốc</th>
                      <th>Ngày bắt đầu</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((request) => (
                      <tr
                        key={request.id}
                        className={
                          selectedRequest?.id === request.id
                            ? "selected-row"
                            : ""
                        }
                      >
                        <td>{request.id}</td>
                        <td>{request.studentName}</td>
                        <td>
                          {request.medicationName || request.medicineName}
                        </td>
                        <td>
                          {new Date(request.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td>
                          <span
                            className={`status status-${request.status?.toLowerCase()}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleSelectRequest(request)}>
                            Chọn
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có yêu cầu thuốc nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Section */}
        {selectedTab === "submit" && (
          <div className="submit-section">
            <h2>Gửi Yêu Cầu Thuốc Mới</h2>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label htmlFor="studentId">ID Học sinh:</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={newRequest.studentId}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="medicineName">Tên thuốc:</label>
                <input
                  type="text"
                  id="medicineName"
                  name="medicineName"
                  value={newRequest.medicineName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dosage">Liều lượng:</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={newRequest.dosage}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Tần suất (lần/ngày):</label>
                <input
                  type="number"
                  id="frequency"
                  name="frequency"
                  value={newRequest.frequency}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={newRequest.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Ngày kết thúc:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={newRequest.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="timeToTake">Thời điểm uống thuốc:</label>
                <input
                  type="text"
                  id="timeToTake"
                  name="timeToTake"
                  placeholder="Nhập giờ định dạng HH:MM, VD: 08:00"
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      timeToTake: e.target.value
                        .split(",")
                        .map((time) => time.trim()),
                    })
                  }
                  required
                />
                <small>
                  Phân cách nhiều thời điểm bằng dấu phẩy, VD: 08:00, 13:00,
                  19:00
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú:</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newRequest.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prescriptionImage">Hình ảnh đơn thuốc:</label>
                <input
                  type="file"
                  id="prescriptionImage"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi Yêu Cầu"}
              </button>
            </form>
          </div>
        )}

        {/* Update/Cancel Section */}
        {selectedTab === "update" && (
          <div className="update-section">
            <h2>Cập Nhật hoặc Hủy Yêu Cầu</h2>

            {selectedRequest ? (
              <div className="selected-request-info">
                <h3>Thông tin yêu cầu đã chọn</h3>
                <p>
                  <strong>ID:</strong> {selectedRequest.id}
                </p>
                <p>
                  <strong>Học sinh:</strong> {selectedRequest.studentName}
                </p>
                <p>
                  <strong>Thuốc:</strong>{" "}
                  {selectedRequest.medicationName ||
                    selectedRequest.medicineName}
                </p>
                <p>
                  <strong>Trạng thái:</strong> {selectedRequest.status}
                </p>

                <div className="action-buttons">
                  <button
                    onClick={handleUpdateRequest}
                    disabled={
                      loading || selectedRequest.status !== "PENDING_APPROVAL"
                    }
                  >
                    {loading ? "Đang xử lý..." : "Cập Nhật Yêu Cầu"}
                  </button>

                  <button
                    onClick={handleCancelRequest}
                    disabled={
                      loading || selectedRequest.status !== "PENDING_APPROVAL"
                    }
                    className="btn-danger"
                  >
                    {loading ? "Đang xử lý..." : "Hủy Yêu Cầu"}
                  </button>
                </div>

                <p className="note">
                  Lưu ý: Chỉ có thể cập nhật hoặc hủy yêu cầu đang ở trạng thái
                  "PENDING_APPROVAL" (Chờ duyệt)
                </p>
              </div>
            ) : (
              <p>
                Vui lòng chọn một yêu cầu từ tab "Xem Lịch Sử" để cập nhật hoặc
                hủy.
              </p>
            )}
          </div>
        )}

        {/* Details Section */}
        {selectedTab === "details" && (
          <div className="details-section">
            <h2>Xem Chi Tiết Việc Dùng Thuốc</h2>

            {selectedRequest ? (
              <div className="selected-request-info">
                <h3>Thông tin yêu cầu đã chọn</h3>
                <p>
                  <strong>ID:</strong> {selectedRequest.id}
                </p>
                <p>
                  <strong>Học sinh:</strong> {selectedRequest.studentName}
                </p>
                <p>
                  <strong>Thuốc:</strong>{" "}
                  {selectedRequest.medicationName ||
                    selectedRequest.medicineName}
                </p>

                <button onClick={handleViewDetails} disabled={loading}>
                  {loading ? "Đang tải..." : "Xem Chi Tiết Dùng Thuốc"}
                </button>
              </div>
            ) : (
              <p>
                Vui lòng chọn một yêu cầu từ tab "Xem Lịch Sử" để xem chi tiết.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Message display */}
      <div className="message-area">
        <h3>Thông báo</h3>
        <pre>{message}</pre>
      </div>

      {/* JSON Schema Reference */}
      <div className="json-schema">
        <h3>Cấu trúc JSON API</h3>

        <div className="schema-item">
          <h4>
            1. Fetch Medication History - GET
            /parent-medication-requests/my-requests
          </h4>
          <pre>
            {`[
  {
    "id": 6,
    "submittedAt": "2024-05-25",
    "healthProfileId": 1,
    "studentName": "Nguyễn Minh Anh",
    "studentClass": "3A1",
    "studentId": "HS001",
    "requestedBy": "Nguyễn Văn An",
    "requestedByAccountId": "ACC006",
    "medicationName": "Vitamin C",
    "dosageInstructions": "1 viên mỗi sáng",
    "startDate": "2024-06-01",
    "endDate": "2024-08-30",
    "frequencyPerDay": 1,
    "timeOfDay": "[\"08:00\"]",
    "specialInstructions": "Uống sau ăn sáng",
    "prescriptionImageUrl": "base64_image",
    "parentProvided": true,
    "status": "APPROVED",
    "rejectionReason": null,
    "approvedBy": "Nguyễn Thị Hoa",
    "responseDate": "2024-05-26T09:00:00"
  }
]`}
          </pre>
        </div>

        <div className="schema-item">
          <h4>
            2. Submit Medication Request - POST
            /parent-medication-requests/submit-request
          </h4>
          <pre>
            {`{
  "studentId": 0,
  "medicineName": "string",
  "dosage": "string",
  "frequency": 0,
  "startDate": "2025-07-10",
  "endDate": "2025-07-10",
  "timeToTake": [
    "string"
  ],
  "notes": "string",
  "prescriptionImageBase64": "string"
}`}
          </pre>
        </div>

        <div className="schema-item">
          <h4>
            3. Update Medication Request - PUT /parent-medication-requests/
            {requestId}
          </h4>
          <pre>
            {`{
  "studentId": 1,
  "medicineName": "Vitamin C",
  "dosage": "2 viên mỗi sáng",
  "frequency": 1,
  "startDate": "2025-07-10",
  "endDate": "2025-07-10",
  "timeToTake": ["07:00", "13:00", "19:00"],
  "notes": "",
  "prescriptionImageBase64": "base64_string"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MedicationRequestDemo;
