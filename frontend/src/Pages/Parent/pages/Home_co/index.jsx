import React, { useEffect } from "react";
import "./index.css";
import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import About from "../../components/About/About";
import Vision from "../../components/Vision/Vision";
import CallToAction from "../../components/CallToAction/CallToAction";

export default function Main() {
  // Đảm bảo scroll về đầu trang khi component được mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="parent-home">
      <section className="parent-home-section">
        <Hero />
      </section>

      <section className="parent-home-section">
        <Features />
      </section>

      <section className="parent-home-section">
        <About />
      </section>

      <section className="parent-home-section parent-home-section-vision">
        <Vision />
      </section>

      <section className="parent-home-section">
        <CallToAction />
      </section>
    </div>
  );
}
