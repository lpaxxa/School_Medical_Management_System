import React from "react";
import Header from "../Header/Header";
import Navigation from "../Navigation/Navigation";
import Footer from "../Footer/Footer";

// Layout for parent pages - only include structural elements
export const MainLayout = ({ children }) => (
  <>
    <Header />
    <Navigation />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);

// Layout for admin/nurse pages - doesn't include header, navigation, or footer
// as these components are usually customized within admin/nurse dashboards
export const AdminLayout = ({ children }) => (
  <div className="admin-layout">{children}</div>
);

// For home page that needs additional components
export const HomeLayout = ({ children }) => (
  <>
    <Header />
    <Navigation />
    <main className="main-content">{children}</main>
    <Footer />
  </>
);
