import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Navigation from "../components/Navigation/Navigation";
import { 
  InventoryProvider, 
  MedicalEventsProvider,
  MedicineApprovalProvider
} from "../../../context/NurseContext";
import "./NurseLayout.css";

const NurseLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };    return (
    <div className="nurse-layout">
      <Header />      <div className="layout-container">
        <Navigation />        <main className="nurse-content">
          <InventoryProvider>
            <MedicalEventsProvider>
              <MedicineApprovalProvider>
                {children}
              </MedicineApprovalProvider>
            </MedicalEventsProvider>
          </InventoryProvider>
        </main>
      </div>
    </div>
  );
};

export default NurseLayout;