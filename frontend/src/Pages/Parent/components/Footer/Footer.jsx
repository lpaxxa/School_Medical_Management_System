import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import logoImage from "../../../../assets/A1.jpg";
import "./Footer.css";

export default function Footer() {
  useEffect(() => {
    const footerContent = document.querySelector(".footer-content");
    if (footerContent) {
      footerContent.classList.add("visible");
    }
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-column info-column">
            <Link to="/" className="footer-logo">
              <img src={logoImage} alt="School Medical System" />
            </Link>
            <p className="footer-description">
              Hệ thống quản lý y tế học đường hỗ trợ chăm sóc sức khỏe toàn diện
              cho học sinh, tạo nền tảng vững chắc cho tương lai.
            </p>
            <address className="school-address">
              <div className="address-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Võ Văn Tần, Phường 11, Quận 3, TP.HCM</span>
              </div>
              <div className="address-item">
                <i className="fas fa-phone"></i>
                <span>
                  Hotline: <a href="tel:+84982345678">0982 345 678</a>
                </span>
              </div>
              <div className="address-item">
                <i className="fas fa-envelope"></i>
                <span>
                  Email:{" "}
                  <a href="mailto:info@medicalschool.edu.vn">
                    info@medicalschool.edu.vn
                  </a>
                </span>
              </div>
            </address>
          </div>

          <div className="footer-column connect-column">
            <h3 className="footer-title">Kết nối với chúng tôi</h3>
            <div className="social-icons-container">
              <div className="social-icons">
                <a
                  href="#"
                  className="social-icon facebook"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="social-icon twitter"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="social-icon instagram"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="social-icon linkedin"
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  href="#"
                  className="social-icon youtube"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <p className="connect-description">
              Theo dõi chúng tôi trên các kênh mạng xã hội để cập nhật thông tin
              mới nhất về y tế học đường.
            </p>
          </div>

          <div className="footer-column contact-column">
            <h3 className="footer-title">Thông tin liên hệ</h3>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-headset"></i>
                </div>
                <div className="contact-detail">
                  <div className="contact-label">Hỗ trợ kỹ thuật</div>
                  <div className="contact-value">
                    <a href="tel:+84901234567">0901 234 567</a>
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="contact-detail">
                  <div className="contact-label">Giờ làm việc</div>
                  <div className="contact-value">
                    Thứ 2 - Thứ 6: 7:30 - 17:00
                  </div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-user-nurse"></i>
                </div>
                <div className="contact-detail">
                  <div className="contact-label">Y tá trực</div>
                  <div className="contact-value">
                    <a href="tel:+84909876543">0909 876 543</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Hệ thống Quản lý Y tế Học đường.
            Đã đăng ký bản quyền. Phát triển bởi{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              School Medical Team
            </a>
          </p>
          <div className="footer-bottom-links">
            <a href="/terms" className="footer-bottom-link">
              Điều khoản sử dụng
            </a>
            <a href="/privacy" className="footer-bottom-link">
              Chính sách bảo mật
            </a>
            <a href="/security" className="footer-bottom-link">
              Bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
