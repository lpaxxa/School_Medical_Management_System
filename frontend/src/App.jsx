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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import routes from the route files
import AppRoutes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";

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
          <ErrorBoundary>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              style={{ zIndex: 9999 }}
            />
            <AppRoutesContainer />
          </ErrorBoundary>
        </StudentDataProvider>
      </AuthProvider>
    </Router>
  );
}
