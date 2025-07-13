import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import NurseLayout from "../Pages/Nurse/layout/NurseLayout";
import Consultation from "../Pages/Nurse/pages/Consultation_co/ConsultationMain";
import StudentRecordsPage from "../Pages/Nurse/pages/StudentRecords_co";
import HealthCheckupsPage from "../Pages/Nurse/pages/HealthCheckups_co";
import InventoryPage from "../Pages/Nurse/pages/Inventory_co";
import MedicalEventsPage from "../Pages/Nurse/pages/MedicalEvents_co";
import VaccinationPage from "../Pages/Nurse/pages/Vaccination_co/VaccinationMain";
// Import BlogManagement from index.jsx which includes BlogProvider
import BlogManagement from "../Pages/Nurse/pages/Blog_co/index.jsx";
import ReceiveMedicine from "../Pages/Nurse/pages/ReceiveMedicine_co";

// NurseLayout đã được import từ file riêng

const NurseRoutes = () => {
  return [
    <Route
      key="nurse-dashboard"
      path="/nurse/*"
      element={
        <ProtectedRoute allowedRoles={["nurse"]}>
          <NurseLayout>
            <Routes>
              <Route index element={<VaccinationPage />} />
              <Route path="consultations" element={<Consultation />} />
              <Route path="student-records" element={<StudentRecordsPage />} />              <Route path="health-checkups" element={<HealthCheckupsPage />} />
              <Route path="inventory" element={<InventoryPage />} />              <Route path="medical-events" element={<MedicalEventsPage />} />
              <Route path="vaccination" element={<VaccinationPage />} />              <Route 
                path="blog-management/*" 
                element={<BlogManagement />} 
              />
              <Route path="receive-medicine" element={<ReceiveMedicine />} />
            </Routes>
          </NurseLayout>
        </ProtectedRoute>
      }
    />,
  ];
};

export default NurseRoutes;
