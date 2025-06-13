import React, { useEffect } from "react";
import FeatureCard from "./FeatureCard";
import "./Features.css";

export default function Features() {
  // Animation on scroll
  useEffect(() => {
    const cards = document.querySelectorAll(".feature-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("feature-visible");
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const features = [
    {
      title: "Hồ sơ y tế thông minh",
      description:
        "Quản lý hồ sơ sức khỏe học sinh một cách thông minh và hiệu quả, giúp theo dõi lịch sử y tế xuyên suốt quá trình học tập.",
      icon: "fa-regular fa-folder-medical",
      color: "#3b82f6",
    },
    {
      title: "Khám sức khỏe định kỳ",
      description:
        "Theo dõi và đánh giá sức khỏe học sinh thường xuyên, đảm bảo phát hiện sớm các vấn đề sức khỏe tiềm ẩn.",
      icon: "fa-solid fa-stethoscope",
      color: "#10b981",
    },
    {
      title: "Hỗ trợ tâm lý học đường",
      description:
        "Chăm sóc sức khỏe tinh thần và hỗ trợ tâm lý cho học sinh, tạo môi trường học tập lành mạnh và thoải mái.",
      icon: "fa-solid fa-brain",
      color: "#8b5cf6",
    },
    {
      title: "Quản lý bệnh nền",
      description:
        "Theo dõi và quản lý các bệnh lý mãn tính của học sinh, đảm bảo có biện pháp hỗ trợ kịp thời khi cần thiết.",
      icon: "fa-solid fa-clipboard-list",
      color: "#ef4444",
    },
    {
      title: "Kết nối phụ huynh - nhà trường",
      description:
        "Tạo cầu nối thông tin y tế giữa gia đình và trường học, đảm bảo sự phối hợp chặt chẽ trong chăm sóc sức khỏe học sinh.",
      icon: "fa-solid fa-people-arrows",
      color: "#f59e0b",
    },
    {
      title: "Theo dõi chỉ số phát triển",
      description:
        "Ghi nhận và phân tích các chỉ số phát triển của học sinh như chiều cao, cân nặng để đánh giá sự phát triển toàn diện.",
      icon: "fa-solid fa-chart-line",
      color: "#06b6d4",
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-container">
        {/* Background elements */}
        <div className="features-bg-element features-bg-circle"></div>
        <div className="features-bg-element features-bg-dots"></div>
        <div className="features-bg-element features-bg-square"></div>

        <div className="features-header">
          <span className="features-pre-title">Giải pháp toàn diện</span>
          <h2 className="features-title">Tính năng nổi bật</h2>
          <div className="features-title-underline"></div>
          <p className="features-subtitle">
            Khám phá các tính năng hiện đại giúp quản lý y tế học đường hiệu
            quả, đảm bảo sức khỏe và an toàn cho học sinh
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
