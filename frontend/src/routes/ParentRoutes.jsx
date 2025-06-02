import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Import layouts from SharedLayouts
import { MainLayout, HomeLayout } from "../components/layouts/SharedLayouts";

// Import Parent Pages
import MainPage from "../Pages/Parent/components/Home_co/index";
import IntroductionPage from "../Pages/Parent/components/Introduction_co/IntroductionPage";
import StudentProfile from "../Pages/Parent/components/StudentProfile_co/StudentProfile";
import Notifications from "../Pages/Parent/components/Notifications_co/Notifications";
import ParentContact from "../Pages/Parent/components/Contact_co/Contact";
import HealthGuide from "../Pages/Parent/components/HealthGuide_co/HealthGuide";
import HealthGuideDetail from "../Pages/Parent/components/HealthGuide_co/HealthGuideDetail";
import HealthDeclaration from "../Pages/Parent/components/HealthDeclaration_co/HealthDeclaration";
import SendMedicine from "../Pages/Parent/components/SendMedicine_co/SendMedicine";
import MedicalRecords from "../Pages/Parent/components/MedicalRecords_co/MedicalRecords";
import Community from "../Pages/Parent/components/Community_co/Community";
import CommunityPost from "../Pages/Parent/components/Community_co/CommunityPost";

// Parent routes including all parent-specific pages
const ParentRoutes = () => {
  return [
    // Trang chủ cho phụ huynh
    <Route
      key="parent-home"
      path="/parent"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <HomeLayout>
            <MainPage />
          </HomeLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-introduction"
      path="/parent/introduction"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <IntroductionPage />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-student-profile"
      path="/parent/student-profile"
      element={
        <ProtectedRoute allowedRoles={["parent", "admin", "nurse"]}>
          <MainLayout>
            <StudentProfile />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-notifications"
      path="/parent/notifications"
      element={
        <ProtectedRoute allowedRoles={["parent", "admin", "nurse"]}>
          <MainLayout>
            <Notifications />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-contact"
      path="/parent/contact"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <ParentContact />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-health-guide"
      path="/parent/health-guide"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <HealthGuide />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-health-guide-detail"
      path="/parent/health-guide/:articleId"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <HealthGuideDetail />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-health-declaration"
      path="/parent/health-declaration"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <HealthDeclaration />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-send-medicine"
      path="/parent/send-medicine"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <SendMedicine />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-medical-records"
      path="/parent/medical-records"
      element={
        <ProtectedRoute allowedRoles={["parent"]}>
          <MainLayout>
            <MedicalRecords />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-community"
      path="/parent/community"
      element={
        <ProtectedRoute allowedRoles={["parent", "nurse", "admin"]}>
          <MainLayout>
            <Community />
          </MainLayout>
        </ProtectedRoute>
      }
    />,

    <Route
      key="parent-community-post"
      path="/parent/community/post/:postId"
      element={
        <ProtectedRoute allowedRoles={["parent", "nurse", "admin"]}>
          <MainLayout>
            <CommunityPost />
          </MainLayout>
        </ProtectedRoute>
      }
    />,
  ];
};

export default ParentRoutes;
