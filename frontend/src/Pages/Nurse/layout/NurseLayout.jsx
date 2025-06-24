import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
// Sửa đường dẫn import để trỏ đúng đến các component
import Header from "../components/Header/Header";
import Navigation from "../components/Navigation/Navigation";
import { 
  InventoryProvider, 
  MedicalEventsProvider,
  MedicineApprovalProvider
} from "../../../context/NurseContext";
import { StudentRecordsProvider } from "../../../context/NurseContext/StudentRecordsContext";
import { BlogProvider } from "../../../context/NurseContext/BlogContext";
import { HealthCheckupProvider } from "../../../context/NurseContext/HealthCheckupContext";
import { VaccinationProvider } from "../../../context/NurseContext/VaccinationContext";
import "./NurseLayout.css";

const NurseLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };    
  
  return (
    <div className="nurse-layout">
      <Header />      
      <div className="layout-container">
        <Navigation />        
        <main className="nurse-content">
          <InventoryProvider>
            <MedicalEventsProvider>
              <MedicineApprovalProvider>
                <StudentRecordsProvider>
                  <HealthCheckupProvider>
                    <BlogProvider>
                      <VaccinationProvider>
                        {children}
                      </VaccinationProvider>
                    </BlogProvider>
                  </HealthCheckupProvider>
                </StudentRecordsProvider>
              </MedicineApprovalProvider>
            </MedicalEventsProvider>
          </InventoryProvider>
        </main>
      </div>
    </div>
  );
};

export default NurseLayout;