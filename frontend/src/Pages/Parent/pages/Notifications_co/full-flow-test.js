// Test script để test toàn bộ flow API
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";

const testFullFlow = async () => {
  console.log("🧪 === TESTING FULL API FLOW ===");
  
  try {
    // 1. Test load danh sách thông báo
    console.log("\n📋 1. Testing load notifications list...");
    const parentId = 1;
    const listResponse = await healthCheckupConsentService.getAllConsents(parentId);
    
    console.log("✅ List Response:", {
      parentName: listResponse.parentName,
      totalNotifications: listResponse.totalNotifications,
      childrenCount: listResponse.childrenNotifications?.length,
    });
    
    // Lấy consent ID đầu tiên để test
    const firstChild = listResponse.childrenNotifications?.[0];
    const firstNotification = firstChild?.notifications?.[0];
    const consentId = firstNotification?.consentId;
    
    if (!consentId) {
      console.error("❌ No consent ID found for testing");
      return;
    }
    
    console.log(`📍 Using consent ID: ${consentId} (${firstChild.studentName})`);
    
    // 2. Test load chi tiết consent
    console.log("\n📄 2. Testing load consent details...");
    const detailResponse = await healthCheckupConsentService.getConsentDetails(consentId);
    
    console.log("✅ Detail Response:", {
      campaignTitle: detailResponse.campaignTitle,
      studentName: detailResponse.studentName,
      consentStatus: detailResponse.consentStatus,
      availableItems: detailResponse.availableSpecialCheckupItems?.length,
      selectedItems: detailResponse.selectedSpecialCheckupItems?.length,
    });
    
    // 3. Test submit consent (chỉ log, không thực sự submit)
    console.log("\n📤 3. Testing submit consent (dry run)...");
    const consentData = {
      consentGiven: true,
      specialCheckupItems: ["Khám mắt chuyên sâu", "Xét nghiệm máu"],
      parentNotes: "Test note from API test script",
    };
    
    console.log("🔄 Would submit:", consentData);
    console.log("📍 To endpoint: PUT /parent-consents/" + consentId);
    
    // Uncomment để thực sự submit:
    // const submitResponse = await healthCheckupConsentService.submitConsent(consentId, consentData);
    // console.log("✅ Submit Response:", submitResponse);
    
    console.log("\n🎉 === ALL TESTS PASSED ===");
    
    return {
      listData: listResponse,
      detailData: detailResponse,
      testConsentId: consentId,
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    return null;
  }
};

// Test individual consent details
const testConsentDetails = async (consentId) => {
  try {
    console.log(`🧪 Testing consent details for ID: ${consentId}`);
    const response = await healthCheckupConsentService.getConsentDetails(consentId);
    
    console.log("✅ Success! Data structure:");
    console.log("- Campaign:", response.campaignTitle);
    console.log("- Student:", response.studentName);
    console.log("- Status:", response.consentStatus);
    console.log("- Available items:", response.availableSpecialCheckupItems?.length);
    console.log("- Selected items:", response.selectedSpecialCheckupItems?.length);
    console.log("- Parent notes:", response.consent?.parentNotes || "None");
    
    return response;
  } catch (error) {
    console.error(`❌ Failed to load consent ${consentId}:`, error);
    return null;
  }
};

export { testFullFlow, testConsentDetails };
export default testFullFlow;
