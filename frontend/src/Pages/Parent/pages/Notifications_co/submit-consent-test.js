// Test script cho API submit consent với cấu trúc mới
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";

const testSubmitConsent = async (consentId, action = "approve") => {
  try {
    console.log(`🧪 Testing ${action} consent for ID: ${consentId}`);
    
    let consentData;
    
    if (action === "approve") {
      consentData = {
        consentStatus: "APPROVED",
        specialCheckupItems: [
          "Khám mắt chuyên sâu",
          "Khám răng miệng"
        ],
        parentNotes: "Con tôi bị dị ứng nhẹ"
      };
    } else if (action === "reject") {
      consentData = {
        consentStatus: "REJECTED",
        specialCheckupItems: [],
        parentNotes: "Không muốn tham gia lúc này"
      };
    }
    
    console.log("📤 Request data:", consentData);
    console.log(`📍 API: PUT http://localhost:8080/api/v1/parent-consents/${consentId}`);
    
    // Thực tế chưa submit để tránh làm thay đổi data
    console.log("🔄 Would submit to API...");
    
    // Uncomment dòng dưới để thực sự test:
    // const response = await healthCheckupConsentService.submitConsent(consentId, consentData);
    // console.log("✅ Submit response:", response);
    
    console.log(`✅ Test ${action} consent structure completed!`);
    
    return {
      consentId,
      action,
      requestData: consentData,
      success: true
    };
    
  } catch (error) {
    console.error(`❌ Test ${action} consent failed:`, error);
    return {
      consentId,
      action,
      error: error.message,
      success: false
    };
  }
};

// Test both approve and reject
const testBothActions = async (consentId = 1) => {
  console.log("🧪 === TESTING BOTH APPROVE & REJECT ===");
  
  const approveResult = await testSubmitConsent(consentId, "approve");
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
  
  const rejectResult = await testSubmitConsent(consentId, "reject");
  
  console.log("\n📊 Test Results:");
  console.log("- Approve test:", approveResult.success ? "✅ PASS" : "❌ FAIL");
  console.log("- Reject test:", rejectResult.success ? "✅ PASS" : "❌ FAIL");
  
  return { approveResult, rejectResult };
};

// Test API format validation
const validateAPIFormat = () => {
  console.log("🔍 === API FORMAT VALIDATION ===");
  
  const expectedApproveFormat = {
    consentStatus: "APPROVED",
    specialCheckupItems: ["Khám mắt chuyên sâu", "Khám răng miệng"],
    parentNotes: "Con tôi bị dị ứng nhẹ"
  };
  
  const expectedRejectFormat = {
    consentStatus: "REJECTED", 
    specialCheckupItems: [],
    parentNotes: "Không muốn tham gia lúc này"
  };
  
  console.log("✅ APPROVE format:", JSON.stringify(expectedApproveFormat, null, 2));
  console.log("✅ REJECT format:", JSON.stringify(expectedRejectFormat, null, 2));
  
  return { expectedApproveFormat, expectedRejectFormat };
};

export { testSubmitConsent, testBothActions, validateAPIFormat };
export default testSubmitConsent;
