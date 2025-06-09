import React from "react";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/Header/Header";
import Navigation from "../components/Navigation/Navigation";
import Footer from "../components/Footer/Footer";
import "./ParentLayout.css";

const ParentLayout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <div className="parent-layout">
      <Header user={currentUser} />
      <Navigation />
      <div className="content-wrapper">
        <main className="parent-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default ParentLayout;
