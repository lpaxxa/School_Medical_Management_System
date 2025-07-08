// Test script để kiểm tra API và data transformation
import healthCheckupConsentService from "../../../../services/healthCheckupConsentService";
import { useStudentData } from "../../../../context/StudentDataContext";

const testAPI = async (parentId = null) => {
  try {
    // Sử dụng parentId được truyền vào hoặc default là 1 cho test
    const actualParentId = parentId || 1;
    
    console.log(`🚀 Testing API: http://localhost:8080/api/v1/parent-consents/parent/${actualParentId}/all-children`);
    console.log(`📍 Using Parent ID: ${actualParentId}`);
    
    const response = await healthCheckupConsentService.getAllConsents(actualParentId);
    console.log("✅ API Response:", response);
    
    // Transform data như trong component
    const transformedData = [];
    if (response?.childrenNotifications) {
      response.childrenNotifications.forEach((child) => {
        child.notifications.forEach((notification) => {
          transformedData.push({
            id: notification.consentId,
            healthCampaignId: notification.healthCampaignId,
            campaignTitle: notification.campaignTitle,
            campaignDescription: notification.campaignDescription,
            campaignStartDate: notification.campaignStartDate,
            campaignEndDate: notification.campaignEndDate,
            campaignStatus: notification.campaignStatus,
            consentStatus: notification.consentStatus,
            studentId: child.studentId,
            studentName: child.studentName,
            studentClass: child.studentClass,
            studentAge: child.studentAge,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
          });
        });
      });
    }
    
    console.log("🔄 Transformed Data:", transformedData);
    console.log("📊 Total notifications:", transformedData.length);
    
    return transformedData;
  } catch (error) {
    console.error("❌ API Error:", error);
    return null;
  }
};

export default testAPI;
