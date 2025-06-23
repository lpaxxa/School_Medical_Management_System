import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { StudentDataProvider } from "./context/StudentDataContext";
import "./styles/global.css";

// Import routes from the route files
import AppRoutes from "./routes";

function AppRoutesContainer() {
  const { currentUser } = useAuth();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease",
    });
  }, []);

  return <Routes>{AppRoutes({ currentUser })}</Routes>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <StudentDataProvider>
          <div className="app">
            <AppRoutesContainer />
          </div>
        </StudentDataProvider>
      </AuthProvider>
    </Router>
  );
}
