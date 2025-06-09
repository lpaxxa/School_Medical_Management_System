import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="nurse-footer">
      <div className="footer-content">
        <p>&copy; 2025 Hệ Thống Quản Lý Y Tế Trường Học</p>
        <div className="footer-links">
          <a href="/terms">Điều khoản sử dụng</a>
          <a href="/privacy">Chính sách bảo mật</a>
          <a href="/help">Trung tâm trợ giúp</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
