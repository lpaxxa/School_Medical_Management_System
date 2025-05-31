import React from "react";
import { Link } from "react-router-dom";
import "./CallToAction.css";

const CallToAction = () => {
  return (
    <section className="cta">
      {/* Floating elements */}
      <div className="cta-float cta-float-1"></div>
      <div className="cta-float cta-float-2"></div>
      <div className="cta-float cta-float-3"></div>

      <div className="cta-content">
        <h2 className="cta-title">Đặt lịch kiểm tra sức khỏe ngay hôm nay</h2>
        <p className="cta-description">
          Chúng tôi cung cấp dịch vụ kiểm tra sức khỏe toàn diện cho học sinh.
          Đặt lịch hẹn ngay để con bạn được chăm sóc tốt nhất.
        </p>
        <div className="cta-buttons">
          {/* <Link to="/parent/appointment" className="cta-button">
            <i className="fas fa-calendar-alt"></i> Đặt lịch ngay
          </Link> */}
          <Link
            to="/parent/contact"
            className="cta-button cta-button-secondary"
          >
            <i className="fas fa-phone-alt"></i> Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
