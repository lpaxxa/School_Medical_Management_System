import React from "react";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/Header/Header";
import Navigation from "../components/Navigation/Navigation";
import Footer from "../components/Footer/Footer";
import "./ParentLayout.css"; // Tạo file CSS tương ứng

const ParentLayout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <div className="parent-layout">
      <Header user={currentUser} />
      <Navigation />
      <main className="parent-content">{children}</main>
      <Footer />
    </div>
  );
};

export default ParentLayout;
