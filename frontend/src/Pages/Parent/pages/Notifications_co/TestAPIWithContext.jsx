// Test component để demo việc sử dụng parentId từ StudentDataContext
import React, { useState } from "react";
import { useStudentData } from "../../../../context/StudentDataContext";
import testAPI from "./api-test";
import { testConsentDetails } from "./full-flow-test";
import { validateAPIFormat } from "./submit-consent-test";

const TestAPIWithContext = () => {
  const { parentInfo, students } = useStudentData();
  const [lastTestResult, setLastTestResult] = useState(null);

  // Helper function giống như trong Notifications component
  const getParentId = () => {
    console.log("🔍 TestComponent - Getting parentId...");
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

  const handleTestAPI = async () => {
    const parentId = getParentId();

    if (!parentId) {
      console.warn("❌ No parent ID available for testing");
      alert("Không tìm thấy ID phụ huynh để test API");
      return;
    }

    console.log(`🚀 Testing API with Parent ID: ${parentId}`);
    const result = await testAPI(parentId);

    if (result && result.length > 0) {
      setLastTestResult(result);
      console.log("✅ Test completed successfully");
      alert(
        `Test API thành công với Parent ID: ${parentId}\nSố thông báo: ${result.length}`
      );
    } else {
      console.error("❌ Test failed");
      alert("Test API thất bại");
    }
  };

  const handleTestConsentDetails = async (consentId) => {
    console.log(`🧪 Testing consent details for ID: ${consentId}`);
    const result = await testConsentDetails(consentId);

    if (result) {
      alert(
        `Test chi tiết consent thành công!\nStudent: ${result.studentName}\nStatus: ${result.consentStatus}`
      );
    } else {
      alert("Test chi tiết consent thất bại");
    }
  };

  const handleTestAPIFormat = () => {
    console.log("🔍 Testing API format validation...");
    const result = validateAPIFormat();
    alert("API format validation completed! Check console for details.");
  };

  return (
    <div
      style={{
        margin: "10px",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h4>🧪 API Test với Parent ID từ Context</h4>
      <div style={{ marginBottom: "10px" }}>
        <strong>Parent ID hiện tại:</strong> {getParentId() || "Chưa có"}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Parent Info:</strong>{" "}
        {parentInfo
          ? `${parentInfo.fullName} (ID: ${parentInfo.id})`
          : "Chưa load"}
      </div>
      <div style={{ marginBottom: "15px" }}>
        <strong>Students:</strong>{" "}
        {students.length > 0 ? `${students.length} học sinh` : "Chưa load"}
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleTestAPI}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={!getParentId()}
        >
          🧪 Test API Danh sách
        </button>

        <button
          onClick={() => handleTestConsentDetails(1)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📄 Test Chi tiết (ID:1)
        </button>

        <button
          onClick={() => handleTestConsentDetails(2)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📄 Test Chi tiết (ID:2)
        </button>

        <button
          onClick={handleTestAPIFormat}
          style={{
            padding: "8px 16px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔍 Test API Format
        </button>
      </div>

      {lastTestResult && lastTestResult.length > 0 && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#e8f5e8",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <strong>🎯 Kết quả test cuối:</strong>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            {lastTestResult.slice(0, 3).map((item, index) => (
              <li key={index} style={{ margin: "2px 0" }}>
                ID: {item.id} - {item.studentName} ({item.consentStatus})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestAPIWithContext;
