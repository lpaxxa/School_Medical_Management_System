import React, { useState, useEffect } from "react";
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";

const DebugParentNotes = () => {
  const [consentId, setConsentId] = useState("1");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadConsent = async () => {
    if (!consentId.trim()) return;

    setLoading(true);
    try {
      console.log(`🔍 Loading consent ${consentId}...`);
      const result = await healthCheckupConsentService.getConsentDetails(
        consentId
      );
      setData(result);
      console.log("📦 Full data:", result);
      console.log("📝 Parent Notes:", result.consent?.parentNotes);
      console.log("🏥 Special Items:", result.consent?.specialCheckupItems);
      console.log("📊 Status:", result.consentStatus);
    } catch (error) {
      console.error("❌ Error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsent();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #007bff",
        margin: "20px",
        borderRadius: "8px",
      }}
    >
      <h3>🐛 Debug Parent Notes</h3>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Consent ID:
          <input
            type="text"
            value={consentId}
            onChange={(e) => setConsentId(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
        <button
          onClick={loadConsent}
          disabled={loading}
          style={{ marginLeft: "10px", padding: "5px 15px" }}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {data && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "6px",
          }}
        >
          <h4>📊 Raw Data:</h4>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(data, null, 2)}
          </pre>

          <h4>🔍 Parsed Info:</h4>
          <ul>
            <li>
              <strong>Status:</strong> {data.consentStatus}
            </li>
            <li>
              <strong>Has Consent Object:</strong> {data.consent ? "Yes" : "No"}
            </li>
            {data.consent && (
              <>
                <li>
                  <strong>Parent Notes:</strong>{" "}
                  {data.consent.parentNotes || "None"}
                </li>
                <li>
                  <strong>Special Items:</strong>{" "}
                  {data.consent.specialCheckupItems
                    ? data.consent.specialCheckupItems.join(", ")
                    : "None"}
                </li>
              </>
            )}
          </ul>

          <h4>🎨 Modal Preview:</h4>
          {data.consentStatus === "APPROVED" && (
            <div
              style={{
                border: "1px solid #28a745",
                padding: "10px",
                backgroundColor: "#d4edda",
              }}
            >
              <h5 style={{ color: "#155724" }}>✅ APPROVED Status</h5>

              {data.consent?.specialCheckupItems &&
              data.consent.specialCheckupItems.length > 0 ? (
                <div>
                  <strong>Special Items:</strong>
                  <ul>
                    {data.consent.specialCheckupItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Chỉ kiểm tra cơ bản</p>
              )}

              {data.consent?.parentNotes && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                  }}
                >
                  <strong>Parent Notes:</strong> "{data.consent.parentNotes}"
                </div>
              )}
            </div>
          )}

          {data.consentStatus === "REJECTED" && (
            <div
              style={{
                border: "1px solid #dc3545",
                padding: "10px",
                backgroundColor: "#f8d7da",
              }}
            >
              <h5 style={{ color: "#721c24" }}>❌ REJECTED Status</h5>
              <p>Đã từ chối tham gia</p>

              {data.consent?.parentNotes && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                  }}
                >
                  <strong>Parent Notes:</strong> "{data.consent.parentNotes}"
                </div>
              )}
            </div>
          )}

          {data.consentStatus === "PENDING" && (
            <div
              style={{
                border: "1px solid #ffc107",
                padding: "10px",
                backgroundColor: "#fff3cd",
              }}
            >
              <h5 style={{ color: "#856404" }}>⏳ PENDING Status</h5>
              <p>Chờ phản hồi từ phụ huynh</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugParentNotes;
