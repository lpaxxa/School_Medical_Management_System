import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
// Component Header đã bị loại bỏ
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
  // Logic logout và user đã được chuyển vào Navigation.jsx
  
  return (
    <div className="nurse-layout">
      {/* Header đã được tích hợp vào Navigation */}
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
  );
};

export default NurseLayout;