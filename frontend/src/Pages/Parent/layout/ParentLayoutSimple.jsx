import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./ParentLayoutSimple.css";

export default function ParentLayoutSimple({ children, isHomePage = false }) {
  return (
    <div className="simple-parent-layout">
      <Header />
      <main className="simple-parent-main">
        <div
          className={`simple-parent-content ${isHomePage ? "home-page" : ""}`}
        >
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
