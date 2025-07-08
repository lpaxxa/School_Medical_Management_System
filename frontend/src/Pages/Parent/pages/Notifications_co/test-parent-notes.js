// Test hiển thị ghi chú phụ huynh trong modal
const testParentNotes = async () => {
  console.log("🧪 Testing parent notes display in modal...");
  
  // Test với consent đã được đồng ý có ghi chú
  const testCases = [
    {
      consentId: "6728f899eda3b3f37afa5c2f",
      description: "Consent đã đồng ý với ghi chú phụ huynh"
    },
    {
      consentId: "6728f899eda3b3f37afa5c30", 
      description: "Consent đã từ chối với ghi chú phụ huynh"
    },
    {
      consentId: "6728f899eda3b3f37afa5c31",
      description: "Consent chưa phản hồi"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.description}`);
    console.log(`🔍 ConsentId: ${testCase.consentId}`);
    
    try {
      const response = await fetch(`http://localhost:3001/api/v1/parent-consents/${testCase.consentId}/details`);
      const data = await response.json();
      
      console.log("📊 Response:", {
        status: data.consentStatus,
        hasConsent: !!data.consent,
        parentNotes: data.consent?.parentNotes || "Không có ghi chú",
        specialCheckupItems: data.consent?.specialCheckupItems || []
      });
      
      // Kiểm tra logic hiển thị
      if (data.consentStatus === "APPROVED") {
        console.log("✅ APPROVED - Cần hiển thị:");
        console.log("  - Các mục kiểm tra đã chọn:", data.consent?.specialCheckupItems || []);
        console.log("  - Ghi chú phụ huynh:", data.consent?.parentNotes || "Không có");
      } else if (data.consentStatus === "REJECTED") {
        console.log("❌ REJECTED - Cần hiển thị:");
        console.log("  - Thông báo đã từ chối");
        console.log("  - Ghi chú phụ huynh:", data.consent?.parentNotes || "Không có");
      } else {
        console.log("⏳ PENDING - Form để nhập phản hồi");
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.consentId}:`, error.message);
    }
  }
};

// Chạy test
testParentNotes();
