// APINurse Services Index
export { default as blogService } from './blogService';
export { default as consultationService } from './consultationService';
export { default as healthCheckupService } from './healthCheckupService';
export { default as inventoryService } from './inventoryService';
export { default as medicalEventService } from './medicalEventService';
export { default as receiveMedicineService } from './receiveMedicineService';
export { default as studentRecordService } from './studentRecordService';
export { default as userService } from './userService';
export { default as vaccinationService } from './vaccinationService';
export { default as vaccinationPlanService } from './vaccinationPlanService';
export { default as reportService } from './reportService';
export { default as healthCampaignService } from './healthCampaignService';

// Default export với tất cả services
const services = {
  blogService: () => import('./blogService'),
  consultationService: () => import('./consultationService'),
  healthCheckupService: () => import('./healthCheckupService'),
  inventoryService: () => import('./inventoryService'),
  medicalEventService: () => import('./medicalEventService'),
  receiveMedicineService: () => import('./receiveMedicineService'),
  studentRecordService: () => import('./studentRecordService'),
  userService: () => import('./userService'),
  vaccinationService: () => import('./vaccinationService'),
  vaccinationPlanService: () => import('./vaccinationPlanService'),
  reportService: () => import('./reportService'),
  healthCampaignService: () => import('./healthCampaignService'),
};

export default services; 