import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { StudentDataProvider } from "./context/StudentDataContext";

// Import CSS theo thứ tự: reset -> global -> layout-fixes
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/layout-fixes.css";
import "./App.css";

// Component con để có thể sử dụng useAuth hook
const AppContent = () => {
  const { currentUser } = useAuth();

  // Đảm bảo scroll về đầu trang khi component được mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app">
      <Routes>{AppRoutes({ currentUser })}</Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StudentDataProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </StudentDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
