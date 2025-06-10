import React from "react";
import "./index.css";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import About from "../../components/About/About";
import Vision from "../../components/Vision/Vision";
import CallToAction from "../../components/CallToAction/CallToAction";

export default function Main() {
  return (
    <>
      <div className="home-page">
        <div className="home-container">
          <Hero />
          <Features />
          <About />
        </div>
      </div>

      {/* Tách Vision ra khỏi container chung để tránh xung đột style */}
      <Vision />

      <div className="home-page">
        <div className="home-container">
          <CallToAction />
        </div>
      </div>
    </>
  );
}
