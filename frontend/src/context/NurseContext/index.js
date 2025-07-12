// Export all contexts from the Nurse module
import React from 'react';
import { InventoryContext, InventoryProvider, useInventory } from './InventoryContext';
import { MedicalEventsContext, MedicalEventsProvider, useMedicalEvents } from './MedicalEventsContext';
import { HealthCheckupContext, HealthCheckupProvider } from './HealthCheckupContext';
import { MedicineApprovalContext, MedicineApprovalProvider, useMedicineApproval } from './MedicineApprovalContext';
import { BlogContext, BlogProvider, useBlog } from './BlogContext';

// Create a custom hook for the health checkup context
export const useHealthCheckup = () => {
  const context = React.useContext(HealthCheckupContext);
  if (context === undefined) {
    throw new Error('useHealthCheckup must be used within a HealthCheckupProvider');
  }
  return context;
};

export {
  // Inventory context exports
  InventoryContext,
  InventoryProvider,
  useInventory,
  
  // Medical Events context exports
  MedicalEventsContext,
  MedicalEventsProvider,
  useMedicalEvents,
  
  // Health Checkup context exports
  HealthCheckupContext,
  HealthCheckupProvider,
  
  // Medicine Approval context exports
  MedicineApprovalContext,
  MedicineApprovalProvider,
  useMedicineApproval,

  // Blog context exports
  BlogContext,
  BlogProvider,
  useBlog,
};
