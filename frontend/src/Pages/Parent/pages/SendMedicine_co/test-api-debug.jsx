import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const TestAPIDebug = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { API_ENDPOINTS } = useAuth();

  const testAPI = async () => {
    setLoading(true);
    setResult("Đang test API...\n");

    try {
      const token = localStorage.getItem("authToken");
      const requestId = 12; // Test với ID mẫu

      // Test API 1
      try {
        const endpoint1 =
          API_ENDPOINTS.medicationAdministrations.getByMedicationInstructionId(
            requestId
          );
        const response1 = await axios.get(endpoint1, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setResult((prev) => prev + `✓ API 1 thành công: ${endpoint1}\n`);
        setResult(
          (prev) =>
            prev + `Response: ${JSON.stringify(response1.data, null, 2)}\n\n`
        );
      } catch (error1) {
        setResult((prev) => prev + `✗ API 1 lỗi: ${error1.message}\n`);
        setResult(
          (prev) =>
            prev +
            `Error details: ${JSON.stringify(
              error1.response?.data,
              null,
              2
            )}\n\n`
        );
      }

      // Test API 2
      try {
        const endpoint2 =
          API_ENDPOINTS.medicationAdministrations.getById(requestId);
        const response2 = await axios.get(endpoint2, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setResult((prev) => prev + `✓ API 2 thành công: ${endpoint2}\n`);
        setResult(
          (prev) =>
            prev + `Response: ${JSON.stringify(response2.data, null, 2)}\n\n`
        );
      } catch (error2) {
        setResult((prev) => prev + `✗ API 2 lỗi: ${error2.message}\n`);
        setResult(
          (prev) =>
            prev +
            `Error details: ${JSON.stringify(
              error2.response?.data,
              null,
              2
            )}\n\n`
        );
      }

      // Test API 3
      try {
        const endpoint3 = API_ENDPOINTS.medicationAdministrations.getAll;
        const response3 = await axios.get(endpoint3, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setResult((prev) => prev + `✓ API 3 thành công: ${endpoint3}\n`);
        setResult(
          (prev) =>
            prev + `Response: ${JSON.stringify(response3.data, null, 2)}\n\n`
        );
      } catch (error3) {
        setResult((prev) => prev + `✗ API 3 lỗi: ${error3.message}\n`);
        setResult(
          (prev) =>
            prev +
            `Error details: ${JSON.stringify(
              error3.response?.data,
              null,
              2
            )}\n\n`
        );
      }
    } catch (error) {
      setResult((prev) => prev + `Lỗi chung: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthContext = () => {
    setResult(`Auth Context Debug:\n`);
    setResult(
      (prev) =>
        prev + `API_ENDPOINTS: ${JSON.stringify(API_ENDPOINTS, null, 2)}\n`
    );
    setResult(
      (prev) =>
        prev +
        `Token: ${
          localStorage.getItem("authToken") ? "Có token" : "Không có token"
        }\n`
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        width: "400px",
        background: "white",
        border: "1px solid #ccc",
        padding: "20px",
        zIndex: 9999,
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <h3>API Debug Tool</h3>
      <button onClick={testAPI} disabled={loading}>
        {loading ? "Đang test..." : "Test API"}
      </button>
      <button onClick={checkAuthContext} style={{ marginLeft: "10px" }}>
        Check Auth
      </button>
      <pre
        style={{
          background: "#f5f5f5",
          padding: "10px",
          fontSize: "12px",
          marginTop: "10px",
          whiteSpace: "pre-wrap",
        }}
      >
        {result}
      </pre>
    </div>
  );
};

export default TestAPIDebug;
