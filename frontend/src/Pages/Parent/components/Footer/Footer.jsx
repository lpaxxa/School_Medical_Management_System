import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import logoImage from "../../../../assets/A1.jpg";
import "./Footer.css";

export default function Footer() {
  useEffect(() => {
    const footerContent = document.querySelector(".phFooterContent");
    if (footerContent) {
      footerContent.classList.add("phFooterVisible");
    }
  }, []);

  return (
    <footer className="phFooter">
      <div className="phFooterInner">
        <div className="phFooterContent">
          <div className="phFooterColumn phFooterInfoColumn">
            <Link to="/" className="phFooterLogo">
              <img src={logoImage} alt="School Medical System" />
            </Link>
            <p className="phFooterDescription">
              Hệ thống quản lý y tế học đường hỗ trợ chăm sóc sức khỏe toàn diện
              cho học sinh, tạo nền tảng vững chắc cho tương lai.
            </p>
            <address className="phFooterSchoolAddress">
              <div className="phFooterAddressItem">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Võ Văn Tần, Phường 11, Quận 3, TP.HCM</span>
              </div>
              <div className="phFooterAddressItem">
                <i className="fas fa-phone"></i>
                <span>
                  Hotline: <a href="tel:+84982345678">0982 345 678</a>
                </span>
              </div>
              <div className="phFooterAddressItem">
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

          <div className="phFooterColumn phFooterConnectColumn">
            <h3 className="phFooterTitle">Kết nối với chúng tôi</h3>
            <div className="phFooterSocialIconsContainer">
              <div className="phFooterSocialIcons">
                <a
                  href="#"
                  className="phFooterSocialIcon phFooterFacebook"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="phFooterSocialIcon phFooterTwitter"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="phFooterSocialIcon phFooterInstagram"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="phFooterSocialIcon phFooterLinkedin"
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  href="#"
                  className="phFooterSocialIcon phFooterYoutube"
                  aria-label="YouTube"
                >
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <p className="phFooterConnectDescription">
              Theo dõi chúng tôi trên các kênh mạng xã hội để cập nhật thông tin
              mới nhất về y tế học đường.
            </p>
          </div>

          <div className="phFooterColumn phFooterContactColumn">
            <h3 className="phFooterTitle">Thông tin liên hệ</h3>
            <div className="phFooterContactInfo">
              <div className="phFooterContactItem">
                <div className="phFooterContactIcon">
                  <i className="fas fa-headset"></i>
                </div>
                <div className="phFooterContactDetail">
                  <div className="phFooterContactLabel">Hỗ trợ kỹ thuật</div>
                  <div className="phFooterContactValue">
                    <a href="tel:+84901234567">0901 234 567</a>
                  </div>
                </div>
              </div>

              <div className="phFooterContactItem">
                <div className="phFooterContactIcon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="phFooterContactDetail">
                  <div className="phFooterContactLabel">Giờ làm việc</div>
                  <div className="phFooterContactValue">
                    Thứ 2 - Thứ 6: 7:30 - 17:00
                  </div>
                </div>
              </div>

              <div className="phFooterContactItem">
                <div className="phFooterContactIcon">
                  <i className="fas fa-user-nurse"></i>
                </div>
                <div className="phFooterContactDetail">
                  <div className="phFooterContactLabel">Y tá trực</div>
                  <div className="phFooterContactValue">
                    <a href="tel:+84909876543">0909 876 543</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="phFooterDivider"></div>

        <div className="phFooterBottom">
          <p className="phFooterCopyright">
            &copy; {new Date().getFullYear()} Hệ thống Quản lý Y tế Học đường.
            Đã đăng ký bản quyền. Phát triển bởi{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              School Medical Team
            </a>
          </p>
          <div className="phFooterBottomLinks">
            <a href="/terms" className="phFooterBottomLink">
              Điều khoản sử dụng
            </a>
            <a href="/privacy" className="phFooterBottomLink">
              Chính sách bảo mật
            </a>
            <a href="/security" className="phFooterBottomLink">
              Bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
