// Test Component cho API mới
import React, { useState, useEffect } from "react";
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";
import { toast } from "react-toastify";
import { useStudentData } from "../../../../context/StudentDataContext";
import { useAuth } from "../../../../context/AuthContext";

const APITestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");

  // Get context
  const { students, parentInfo } = useStudentData();
  const { currentUser } = useAuth();

  // Helper function để lấy parentId
  const getParentId = () => {
    console.log("🔍 APITestComponent - Getting parentId...");
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
    console.log("⚠️ No parentId found, using fallback: 1");
    return 1; // Default fallback for testing
  };

  // Check backend status on component mount
  useEffect(() => {
    // Chỉ check status một lần khi component mount, không phụ thuộc vào context
    const checkStatusTimeout = setTimeout(() => {
      if (backendStatus === "checking") {
        checkBackendStatus();
      }
    }, 2000); // Tăng delay lên 2 giây

    return () => clearTimeout(checkStatusTimeout);
  }, []); // Không dependencies để tránh infinite loop

  const checkBackendStatus = async () => {
    if (backendStatus === "checking") {
      try {
        const parentId = getParentId();
        console.log(`🔍 Testing API with parentId: ${parentId}`);
        await healthCheckupConsentService.getAllConsents(parentId);
        setBackendStatus("available");
        console.log("✅ Backend status: Available");
      } catch (error) {
        console.warn("⚠️ Backend not available:", error.message);
        setBackendStatus("unavailable");
      }
    }
  };

  const testAPI = async () => {
    setLoading(true);
    try {
      const parentId = getParentId();
      console.log(`🚀 Testing API with parentId: ${parentId}`);

      // Test với parentId từ context
      const result = await healthCheckupConsentService.getAllConsents(parentId);
      setData(result);
      toast.success("API call thành công!");
      console.log("API Response:", result);
      setBackendStatus("available");
    } catch (error) {
      console.warn("API Error:", error);

      // Show demo data when API fails
      const demoData = {
        parentId: getParentId(),
        parentName: "Nguyễn Văn Hùng",
        totalNotifications: 3,
        pendingConsents: 3,
        approvedConsents: 0,
        completedCheckups: 0,
        childrenNotifications: [
          {
            studentId: 1,
            studentName: "Nguyễn Minh An",
            studentClass: "1A1",
            studentAge: 9,
            totalNotifications: 1,
            notifications: [
              {
                consentId: 1,
                healthCampaignId: 14,
                campaignTitle:
                  "Kiểm tra sức khỏe định kỳ học kỳ I năm 2024-2025",
                campaignDescription:
                  "Chiến dịch kiểm tra sức khỏe toàn diện cho tất cả học sinh trong trường",
                campaignStartDate: "2024-12-01",
                campaignEndDate: "2024-12-15",
                campaignStatus: "PREPARING",
                consentStatus: "PENDING",
                consentDate: null,
                specialCheckupItems: [],
                parentNotes: null,
                medicalCheckupId: null,
                checkupStatus: null,
                checkupDate: null,
                followUpNeeded: null,
                resultNotified: null,
                createdAt: "2025-07-06T00:39:19.907235",
                updatedAt: "2025-07-06T00:39:19.907235",
              },
            ],
          },
        ],
      };

      setData(demoData);
      setBackendStatus("unavailable");
      toast.info("Backend không khả dụng, hiển thị dữ liệu demo");
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      console.log("🧪 Testing API directly with parentId = 1...");
      const result = await healthCheckupConsentService.getAllConsents(1);
      setData(result);
      toast.success("Direct API call thành công!");
      setBackendStatus("available");
    } catch (error) {
      console.warn("Direct API Error:", error);
      setBackendStatus("unavailable");
      toast.error("Direct API call thất bại");
    } finally {
      setLoading(false);
    }
  };

  const testSubmitConsent = async () => {
    if (!data) {
      toast.error("Cần load dữ liệu trước");
      return;
    }

    setLoading(true);
    try {
      const consentData = {
        consentGiven: true,
        specialCheckupItems: ["Khám mắt chuyên sâu", "Khám răng miệng"],
        parentNotes: "Con tôi bị dị ứng nhẹ",
      };

      const result = await healthCheckupConsentService.submitConsent(
        1, // Use consentId = 1 for testing
        consentData
      );
      toast.success("Submit consent thành công!");
      console.log("Submit Response:", result);

      // Reload data
      await testAPI();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.warning(
        "Submit thất bại (API không khả dụng), nhưng sẽ hoạt động khi backend sẵn sàng"
      );

      // Simulate success for demo
      setData((prev) => ({
        ...prev,
        childrenNotifications:
          prev.childrenNotifications?.map((child) => ({
            ...child,
            notifications: child.notifications.map((notif) =>
              notif.consentId === 1
                ? { ...notif, consentStatus: "APPROVED" }
                : notif
            ),
          })) || [],
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        margin: "20px",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h3>🧪 API Test Component</h3>

      {/* Context Info */}
      <div
        style={{
          background: "#e3f2fd",
          border: "1px solid #bbdefb",
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "15px",
          fontSize: "14px",
        }}
      >
        <strong>📊 Context Info:</strong>
        <br />
        <strong>Parent ID:</strong> {getParentId()}
        <br />
        <strong>Parent Info:</strong>{" "}
        {parentInfo
          ? `${parentInfo.name} (ID: ${parentInfo.id})`
          : "Loading..."}
        <br />
        <strong>Students:</strong> {students?.length || 0} students loaded
      </div>

      {/* Backend Status */}
      <div
        style={{
          background: backendStatus === "available" ? "#d4edda" : "#fff3cd",
          border: `1px solid ${
            backendStatus === "available" ? "#c3e6cb" : "#ffeaa7"
          }`,
          padding: "10px",
          borderRadius: "4px",
          marginBottom: "15px",
          fontSize: "14px",
        }}
      >
        <strong>🔌 Backend Status: </strong>
        {backendStatus === "checking" && "Đang kiểm tra..."}
        {backendStatus === "available" && "✅ Kết nối thành công"}
        {backendStatus === "unavailable" &&
          "❌ Backend không khả dụng - Chế độ demo"}

        {backendStatus === "unavailable" && (
          <>
            <br />
            <strong>📋 Expected API:</strong>{" "}
            <code>
              GET /api/v1/parent-consents/parent/{getParentId()}/all-children
            </code>
            <br />
            <strong>🏠 Backend URL:</strong> <code>http://localhost:8080</code>
          </>
        )}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={testAPI} disabled={loading}>
          {loading
            ? "Loading..."
            : `Test Get All Consents (Parent ID: ${getParentId()})`}
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={testDirectAPI} disabled={loading}>
          {loading ? "Loading..." : "Test Direct API (Parent ID: 1)"}
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={testSubmitConsent} disabled={loading || !data}>
          {loading ? "Loading..." : "Test Submit Consent"}
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={checkBackendStatus} disabled={loading}>
          {loading ? "Loading..." : "Refresh Backend Status"}
        </button>
      </div>

      {data && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <h4>API Response:</h4>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APITestComponent;
