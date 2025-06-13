import React, { useEffect, useRef } from "react";
import "./Vision.css";
// Import trực tiếp hình ảnh từ folder assets
import visionImage from "../../../../assets/vision.jpg";

export default function Vision() {
  const counterRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Khởi tạo animation khi component mount
    function handleIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Kích hoạt animation cho tất cả các phần tử có class 'sm-vision-animate'
          const animElements =
            entry.target.querySelectorAll(".sm-vision-animate");
          animElements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add("sm-animated");
            }, index * 100);
          });

          // Kích hoạt animation cho counter
          const counters = entry.target.querySelectorAll(".sm-stat-number");
          counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute("data-target"));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
              current += step;
              if (current < target) {
                counter.textContent = Math.ceil(current) + "+";
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = target + "+";
              }
            };

            updateCounter();
          });
        }
      });
    }

    // Tạo observer với callback và options
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    });

    // Quan sát section
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Cleanup khi component unmount
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const visionPoints = [
    {
      icon: "fa-solid fa-shield-heart",
      title: "Môi trường an toàn",
      description:
        "Xây dựng môi trường học tập an toàn, lành mạnh cho mọi học sinh",
      color: "#4f46e5", // Indigo
    },
    {
      icon: "fa-solid fa-hand-holding-heart",
      title: "Chăm sóc toàn diện",
      description: "Hỗ trợ phát triển cả thể chất lẫn tinh thần của học sinh",
      color: "#10b981", // Emerald
    },
    {
      icon: "fa-solid fa-people-group",
      title: "Kết nối cộng đồng",
      description:
        "Là cầu nối vững chắc giữa gia đình, nhà trường và cơ sở y tế",
      color: "#f59e0b", // Amber
    },
    {
      icon: "fa-solid fa-chart-line",
      title: "Phát triển bền vững",
      description:
        "Không ngừng cải tiến quy trình, trang thiết bị và chất lượng dịch vụ",
      color: "#3b82f6", // Blue
    },
  ];

  return (
    // Thêm thẻ wrapper bên ngoài để reset tất cả các thuộc tính từ ParentLayout
    <div className="sm-vision-reset-wrapper">
      <div className="sm-vision-system" ref={sectionRef}>
        <div className="sm-vision-outer">
          <div className="sm-vision-container">
            {/* Header */}
            <div className="sm-vision-header">
              <span className="sm-vision-badge sm-vision-animate">
                Định hướng phát triển
              </span>
              <h2 className="sm-vision-title sm-vision-animate">
                <span className="sm-title-gradient">Tầm nhìn</span> và{" "}
                <span className="sm-title-underlined">sứ mệnh</span>
              </h2>
              <div className="sm-title-divider sm-vision-animate"></div>
            </div>

            {/* Content */}
            <div className="sm-vision-content">
              {/* Text column */}
              <div className="sm-vision-text sm-vision-animate">
                <h3 className="sm-vision-heading">
                  Chăm sóc sức khỏe học đường -{" "}
                  <span className="sm-vision-highlight">
                    Kiến tạo tương lai
                  </span>
                </h3>

                <p className="sm-vision-description">
                  Đảm bảo môi trường học tập an toàn, lành mạnh và hỗ trợ tối đa
                  cho sự phát triển thể chất lẫn tinh thần của học sinh. Chúng
                  tôi cam kết nâng cao chất lượng chăm sóc sức khỏe thông qua
                  các giải pháp y tế tiên tiến và toàn diện.
                </p>

                <div className="sm-vision-quote">
                  <i className="fa-solid fa-quote-left"></i>
                  <p>
                    Sức khỏe học đường tốt là nền tảng cho một thế hệ phát triển
                    toàn diện
                  </p>
                  <i className="fa-solid fa-quote-right"></i>
                </div>

                <div className="sm-vision-points">
                  {visionPoints.map((point, index) => (
                    <div
                      className="sm-vision-point sm-vision-animate"
                      key={index}
                    >
                      <div
                        className="sm-point-icon"
                        style={{ backgroundColor: point.color }}
                      >
                        <i className={point.icon}></i>
                        <div className="sm-icon-glow"></div>
                      </div>
                      <div className="sm-point-content">
                        <h3 className="sm-point-title">{point.title}</h3>
                        <p className="sm-point-description">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image column */}
              <div className="sm-vision-media sm-vision-animate">
                <div className="sm-vision-image-wrapper">
                  <img
                    src={visionImage}
                    alt="Tầm nhìn và sứ mệnh"
                    className="sm-vision-image"
                  />

                  <div className="sm-mission-badge">
                    <i className="fa-solid fa-rocket"></i>
                    <span>Sứ mệnh</span>
                  </div>
                </div>

                <div className="sm-vision-stats" ref={counterRef}>
                  <div className="sm-stat-item">
                    <span className="sm-stat-number" data-target="1000">
                      0+
                    </span>
                    <span className="sm-stat-label">
                      Học sinh được chăm sóc
                    </span>
                    <div className="sm-stat-icon">
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                  </div>
                  <div className="sm-stat-item">
                    <span className="sm-stat-number" data-target="100">
                      0+
                    </span>
                    <span className="sm-stat-label">Giáo viên được hỗ trợ</span>
                    <div className="sm-stat-icon">
                      <i className="fa-solid fa-chalkboard-teacher"></i>
                    </div>
                  </div>
                  <div className="sm-stat-item">
                    <span className="sm-stat-number" data-target="250">
                      0+
                    </span>
                    <span className="sm-stat-label">
                      Khám sức khỏe mỗi tháng
                    </span>
                    <div className="sm-stat-icon">
                      <i className="fa-solid fa-stethoscope"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm-vision-conclusion sm-vision-animate">
              <p>
                Hệ thống y tế học đường không chỉ góp phần nâng cao chất lượng
                giáo dục mà còn xây dựng thói quen sống lành mạnh ngay từ lứa
                tuổi học sinh, tạo nền móng vững chắc cho sự phát triển của thế
                hệ tương lai.
              </p>

              <div className="sm-vision-action">
                <a href="#contact" className="sm-vision-button">
                  Tìm hiểu thêm
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="sm-bg-circle"></div>
          <div className="sm-bg-dots"></div>
          <div className="sm-bg-wave"></div>
        </div>
      </div>
    </div>
  );
}
