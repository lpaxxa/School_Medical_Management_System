import React from "react";
import "./Hero.css";
import { parentNS } from "../../../../styles/namespace-manager";

export default function Hero() {
  return (
    <section className={`hero modern-hero ${parentNS.cls("hero")}`}>
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">Hệ thống Y tế Học đường Tốt nhất</div>
            <h1 className="hero-title">
              Giải pháp Chăm sóc
              <br />
              Sức khỏe Hiện đại
              <br />
              <span className="gradient-text">Cho Thế giới Số</span>
            </h1>
            <p className="hero-description">
              Tương lai của y tế học đường ngay trong tầm tay của bạn—an toàn,
              thông minh và liền mạch. Hệ thống quản lý toàn diện giúp theo dõi
              sức khỏe học sinh một cách chính xác và hiệu quả.
            </p>
            <div className="hero-buttons">
              <button className="hero-btn primary-btn">
                <span>Bắt đầu ngay hôm nay</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Học sinh</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Trường học</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Độ tin cậy</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-frame">
                <div className="phone-screen">
                  <div className="phone-header">
                    <div className="phone-time">9:41</div>
                    <div className="phone-status">
                      <div className="signal"></div>
                      <div className="wifi"></div>
                      <div className="battery"></div>
                    </div>
                  </div>

                  <div className="app-content">
                    <div className="welcome-section">
                      <div className="user-avatar">
                        <img
                          src="https://images.unsplash.com/photo-1494790108755-2616b612b830?w=50&h=50&fit=crop&crop=face"
                          alt="User Avatar"
                        />
                      </div>
                      <div className="welcome-text">
                        <span className="welcome-label">Chào mừng trở lại</span>
                        <span className="user-name">Nguyễn Minh Anh</span>
                      </div>
                      <div className="notification-icon">
                        <i className="fas fa-bell"></i>
                      </div>
                    </div>

                    <div className="balance-card">
                      <div className="balance-icon">₫</div>
                      <div className="balance-amount">850,000₫</div>
                      <div className="balance-label">Tổng chi phí y tế</div>
                    </div>

                    <div className="quick-actions">
                      <div className="action-btn">
                        <i className="fas fa-plus"></i>
                        <span>Khám</span>
                      </div>
                      <div className="action-btn">
                        <i className="fas fa-paper-plane"></i>
                        <span>Gửi</span>
                      </div>
                      <div className="action-btn">
                        <i className="fas fa-file-medical"></i>
                        <span>Hồ sơ</span>
                      </div>
                      <div className="action-btn">
                        <i className="fas fa-th"></i>
                        <span>Thêm</span>
                      </div>
                    </div>

                    <div className="recent-section">
                      <div className="section-header">
                        <span>Gần đây</span>
                        <span className="see-all">Xem tất cả</span>
                      </div>
                      <div className="recent-contacts">
                        <div className="contact-item">
                          <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                            alt="Doctor"
                          />
                          <span>BS. Văn A.</span>
                        </div>
                        <div className="contact-item">
                          <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face"
                            alt="Nurse"
                          />
                          <span>Y tá B.</span>
                        </div>
                        <div className="contact-item">
                          <img
                            src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&crop=face"
                            alt="Pharmacist"
                          />
                          <span>Dược sĩ C.</span>
                        </div>
                        <div className="contact-item">
                          <img
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face"
                            alt="Admin"
                          />
                          <span>Quản lý D.</span>
                        </div>
                        <div className="contact-item">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                            alt="Parent"
                          />
                          <span>Phụ huynh E.</span>
                        </div>
                      </div>
                    </div>

                    <div className="transaction-card">
                      <div className="transaction-header">
                        <span>Giao dịch</span>
                        <span className="transaction-amount">₫ 286,500</span>
                      </div>
                      <div className="transaction-detail">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=30&h=30&fit=crop&crop=face"
                          alt="Doctor"
                        />
                        <span className="transaction-name">BS. Minh Tuấn</span>
                        <span className="transaction-growth">↗ 10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </section>
  );
}
