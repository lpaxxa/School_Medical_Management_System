import React, { useState } from "react";

const APITester = () => {
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testDeleteAPI = async () => {
    setLoading(true);
    setTestResult("Testing...");
    
    try {
      // Test với ID 5 như bạn đã cung cấp
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/health-articles/5`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setTestResult(`✅ API DELETE Success! Status: ${response.status}`);
      } else {
        const errorText = await response.text();
        setTestResult(`❌ API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAPI = async () => {
    setLoading(true);
    setTestResult("Testing GET...");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/health-articles`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ GET API Success! Found ${data.length || 0} articles`);
      } else {
        setTestResult(`❌ GET API Error: ${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ GET Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: `20px`,
      border: "1px solid #ccc", 
      borderRadius: "8px", 
      margin: "20px",
      backgroundColor: "#f9f9f9"
    }}>
      <h3>API Tester</h3>
      <div style={{ marginBottom: "10px" }}>
        <button 
          onClick={testGetAPI} 
          disabled={loading}
          style={{ 
            marginRight: "10px", 
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Test GET API
        </button>
        <button 
          onClick={testDeleteAPI} 
          disabled={loading}
          style={{ 
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Test DELETE API (ID: 5)
        </button>
      </div>
      <div style={{ 
        padding: "10px", 
        backgroundColor: "white", 
        border: "1px solid #ddd",
        borderRadius: "4px",
        minHeight: "50px",
        fontFamily: "monospace"
      }}>
        {testResult || "Click a button to test API"}
      </div>
    </div>
  );
};

export default APITester;
