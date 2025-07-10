import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./ParentLayout.css";

const ParentLayout = ({ children }) => {
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(130); // Default height for header + navigation

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);

    // Calculate header height and add proper spacing
    const updateHeaderHeight = () => {
      const header = document.querySelector(".parent-header");
      if (header) {
        // Use getBoundingClientRect for more accurate height calculation
        const rect = header.getBoundingClientRect();
        const height = rect.height;
        setHeaderHeight(height);

        // Log for debugging
        console.log("Header height calculated:", height);
      }
    };

    // Multiple attempts to get correct height
    const timeouts = [100, 300, 500, 1000];
    const timeoutIds = timeouts.map((delay) =>
      setTimeout(updateHeaderHeight, delay)
    );

    // Update on window resize with debounce
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateHeaderHeight, 150);
    };

    window.addEventListener("resize", handleResize);

    // Update when DOM changes (for responsive header)
    const observer = new MutationObserver(() => {
      setTimeout(updateHeaderHeight, 100);
    });

    const header = document.querySelector(".parent-header");
    if (header) {
      observer.observe(header, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["class", "style"],
      });
    }

    // Cleanup
    return () => {
      timeoutIds.forEach(clearTimeout);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      // Reset body padding when component unmounts
      document.body.style.paddingTop = "0";
    };
  }, [location.pathname]);

  // Calculate proper padding with buffer
  const calculatePadding = () => {
    // Add a 30px buffer to ensure content never touches header
    return headerHeight + 30;
  };

  return (
    <div
      className="parent-layout"
      style={{ paddingTop: `${calculatePadding()}px` }}
    >
      <Header />
      <main className="parent-main-content">
        {/* Render children if passed, otherwise use Outlet for routing */}
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default ParentLayout;
