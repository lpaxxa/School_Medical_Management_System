import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./ParentLayoutSimple.css";

export default function ParentLayoutSimple({ children }) {
  return (
    <div className="simple-parent-layout">
      <Header />
      <main className="simple-parent-main">
        <div className="simple-parent-content">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
