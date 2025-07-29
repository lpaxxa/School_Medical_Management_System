// Export tất cả services cho Parent
export { default as medicalService } from './medicalService';
export { default as medicationRequestService } from './medicationRequestService';
export { default as communityService } from './communityService';
export { default as healthCheckupConsentService } from './healthCheckupConsentService';
export { default as notificationService } from './notificationService';
export { default as healthGuideService } from './healthGuideService';

// Parent services - riêng biệt với Admin và Nurse services
// Tuân thủ nguyên tắc "mỗi role làm riêng"
