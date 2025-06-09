import React from "react";
import { Route, Routes } from "react-router-dom";
import {
  Dashboard,
  Consultation,
  HealthCheckupsPage,
  InventoryPage,
  MedicalEventsPage,
  StudentRecordsPage,
  VaccinationPage
} from "../Pages/Nurse/pages";
import NurseLayout from "../Pages/Nurse/layout/NurseLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const NurseRoutes = () => {
  return [
    <Route
      key="nurse-routes"
      path="/nurse/*"
      element={
        <ProtectedRoute allowedRoles={["nurse"]}>
          <NurseLayout>
            <Routes>              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="consultations" element={<Consultation />} />
              <Route path="student-records" element={<StudentRecordsPage />} />
              <Route path="health-checkups" element={<HealthCheckupsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="medical-events" element={<MedicalEventsPage />} />
              <Route path="vaccination" element={<VaccinationPage />} />
            </Routes>
          </NurseLayout>
        </ProtectedRoute>
      }
    />,
  ];
};

export default NurseRoutes;
