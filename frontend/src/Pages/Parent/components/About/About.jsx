import React, { useEffect } from "react";
import "./About.css";

export default function About() {
  // Animation khi scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".about-animate");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Thêm thành tựu và số liệu
  const achievements = [
    { value: "5k+", label: "Học sinh được chăm sóc" },
    { value: "98%", label: "Phụ huynh hài lòng" },
    { value: "24/7", label: "Hỗ trợ y tế" },
    { value: "100%", label: "Cam kết sức khỏe" },
  ];

  const highlights = [
    {
      icon: "fa-solid fa-heart-pulse",
      color: "#4f46e5",
      title: "Kiểm tra sức khỏe định kỳ",
      description:
        "Theo dõi sự phát triển thể chất của học sinh thông qua các đợt kiểm tra sức khỏe chuyên nghiệp",
    },
    {
      icon: "fa-solid fa-apple-whole",
      color: "#10b981",
      title: "Tư vấn dinh dưỡng",
      description:
        "Hướng dẫn về chế độ ăn uống cân bằng và lành mạnh cho sự phát triển toàn diện",
    },
    {
      icon: "fa-solid fa-shield-virus",
      color: "#f59e0b",
      title: "Phòng ngừa bệnh tật",
      description:
        "Các biện pháp phòng ngừa và xử lý kịp thời đặc biệt trong mùa dịch bệnh",
    },
    {
      icon: "fa-solid fa-brain",
      color: "#8b5cf6",
      title: "Chăm sóc sức khỏe tâm thần",
      description:
        "Tư vấn và hỗ trợ tâm lý, giúp học sinh phát triển tinh thần lành mạnh và cân bằng",
    },
  ];

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        {/* Phần tử nền trang trí */}
        <div className="about-bg-element about-bg-circle"></div>
        <div className="about-bg-element about-bg-square"></div>
        <div className="about-bg-element about-bg-dots"></div>

        <div className="about-header">
          <span className="about-pre-title about-animate">
            Hiểu về chúng tôi
          </span>
          <h2 className="about-title about-animate">
            Y tế học đường <span className="title-highlight">hàng đầu</span>
          </h2>
          <div className="about-title-divider about-animate"></div>
        </div>

        <div className="about-content">
          <div className="about-image-column about-animate">
            <div className="about-image-wrapper">
              <div className="about-image-overlay"></div>
              <img
                src="https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-27/1FVuqEqGnf.png"
                alt="Chăm sóc sức khỏe toàn diện"
                className="about-img"
              />
              <div className="about-image-shape about-image-shape-1"></div>
              <div className="about-image-shape about-image-shape-2"></div>
              <div className="experience-badge">
                <span className="years">15+</span>
                <span className="text">Năm kinh nghiệm</span>
              </div>
            </div>

            {/* Thành tựu nổi bật */}
            <div className="achievements-container">
              {achievements.map((item, index) => (
                <div className="achievement-item about-animate" key={index}>
                  <div className="achievement-value">{item.value}</div>
                  <div className="achievement-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-text-column">
            <h2 className="about-headline about-animate">
              Chú trọng chăm sóc sức khỏe toàn diện cho học sinh
            </h2>

            <p className="about-paragraph about-animate">
              Chăm sóc sức khỏe toàn diện cho học sinh là một trong những mục
              tiêu{" "}
              <span className="text-highlight">
                Trường Tiểu học, THCS và THPT Dewey
              </span>{" "}
              chú trọng hàng đầu, được duy trì song song với công tác giáo dục
              học sinh.
            </p>

            <p className="about-paragraph about-animate">
              Nhà trường có đội ngũ nhân viên y tế giàu kinh nghiệm và chuyên
              môn cao, luôn theo sát quá trình phát triển về thể chất của
              TDSers.
            </p>

            <div className="about-highlights">
              {highlights.map((item, index) => (
                <div
                  className="highlight-item about-animate"
                  key={index}
                  style={{ "--highlight-color": item.color }}
                >
                  <div className="highlight-icon-wrapper">
                    <i className={item.icon}></i>
                  </div>
                  <div className="highlight-content">
                    <h3 className="highlight-title">{item.title}</h3>
                    <p className="highlight-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="about-conclusion about-animate">
              Sự quan tâm toàn diện này chính là nền tảng giúp các em phát triển
              hài hòa cả thể chất lẫn tinh thần, sẵn sàng chinh phục những thử
              thách trong học tập và cuộc sống.
            </p>

            <div className="about-actions about-animate">
              <a href="#services" className="about-button primary">
                Dịch vụ của chúng tôi
                <i className="fa-solid fa-arrow-right"></i>
              </a>
              <a href="#contact" className="about-button secondary">
                Liên hệ ngay
                <i className="fa-solid fa-phone"></i>
              </a>
            </div>

            {/* Chứng nhận hoặc đối tác */}
            {/* <div className="about-certifications about-animate">
              <span className="cert-label">Được chứng nhận bởi:</span>
              <div className="cert-logos">
                <div className="cert-logo">
                  <img
                    src="https://via.placeholder.com/100x40?text=MedCert"
                    alt="Medical Certification"
                  />
                </div>
                <div className="cert-logo">
                  <img
                    src="https://via.placeholder.com/100x40?text=ISO"
                    alt="ISO Certification"
                  />
                </div>
                <div className="cert-logo">
                  <img
                    src="https://via.placeholder.com/100x40?text=HealthEd"
                    alt="Health Education"
                  />
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Hình nền trang trí */}
      <div className="about-shape shape-1"></div>
      <div className="about-shape shape-2"></div>
    </section>
  );
}
