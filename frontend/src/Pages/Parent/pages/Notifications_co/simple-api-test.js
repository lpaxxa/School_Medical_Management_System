// Simple API test script
const testHealthCheckupAPI = async () => {
  try {
    console.log("🧪 Testing API endpoint...");
    
    const response = await fetch("http://localhost:8080/api/v1/parent-consents/parent/1/all-children", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Note: Trong thực tế cần Authorization token
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log("✅ API Response:", data);
    console.log(`📊 Parent: ${data.parentName}`);
    console.log(`📋 Total notifications: ${data.totalNotifications}`);
    console.log(`👥 Children: ${data.childrenNotifications?.length || 0}`);
    
    // Transform test
    const transformedData = [];
    if (data?.childrenNotifications) {
      data.childrenNotifications.forEach((child) => {
        child.notifications.forEach((notification) => {
          transformedData.push({
            id: notification.consentId,
            campaignTitle: notification.campaignTitle,
            studentName: child.studentName,
            studentClass: child.studentClass,
            consentStatus: notification.consentStatus,
          });
        });
      });
    }
    
    console.log("🔄 Transformed data:", transformedData);
    return transformedData;
    
  } catch (error) {
    console.error("❌ API Test failed:", error);
    return null;
  }
};

// Export để có thể sử dụng
export default testHealthCheckupAPI;

// Test ngay khi load (nếu chạy trực tiếp)
if (typeof window !== 'undefined') {
  console.log("Running API test...");
  testHealthCheckupAPI();
}
