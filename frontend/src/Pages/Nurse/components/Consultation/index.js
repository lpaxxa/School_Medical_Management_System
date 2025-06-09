/**
 * Consultation module exports
 * 
 * This file serves as the main entry point for the Consultation module,
 * exporting all related components for easy import elsewhere in the application.
 * 
 * @module Consultation
 */

import ConsultationDashboard from './ConsultationDashboard/ConsultationDashboard';
import ConsultationDetail from './ConsultationDetail/ConsultationDetail';
import ConsultationList from './ConsultationList/ConsultationList';
import CreateConsultation from './CreateConsultation/CreateConsultation';
import ConsultationManagement from './index.jsx';

// Import the consultation service for direct access
import * as consultationService from '../../../../services/consultationService';

// Named exports for individual components
export {
  ConsultationDashboard,
  ConsultationDetail,
  ConsultationList,
  CreateConsultation,
  consultationService
};

// Default export for the main consultation management component
export default ConsultationManagement;