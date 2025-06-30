import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";

// Đăng ký các component Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// 1. Pie Chart - Phân bổ người dùng theo vai trò
export const UserRoleChart = ({ data }) => {
  const chartData = {
    labels: ["Admin", "Y tá", "Phụ huynh"],
    datasets: [
      {
        data: [data.admin, data.nurse, data.parent],
        backgroundColor: ["#e11d48", "#059669", "#3b82f6"],
        borderColor: ["#e11d48", "#059669", "#3b82f6"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// 2. Bar Chart - Tình trạng sức khỏe học sinh (Mock data)
export const HealthStatusChart = () => {
  const chartData = {
    labels: ["Rất tốt", "Tốt", "Trung bình", "Cần theo dõi"],
    datasets: [
      {
        label: "Số học sinh",
        data: [560, 450, 190, 34],
        backgroundColor: ["#10b981", "#8bc34a", "#f59e0b", "#ef4444"],
        borderColor: ["#10b981", "#8bc34a", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// 3. Line Chart - Tiến độ tiêm chủng theo tháng
export const VaccinationProgressChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        display: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
        },
      },
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: "#059669",
        borderColor: "#fff",
        borderWidth: 2,
      },
    },
  };

  return <Line data={data} options={options} />;
};

// 4. Doughnut Chart - Tỷ lệ phản hồi khám sức khỏe
export const HealthCheckupResponseChart = ({ data }) => {
  const chartData = {
    labels: ["Đã tham gia", "Chờ xác nhận", "Từ chối"],
    datasets: [
      {
        data: [data.accepted, data.pending, data.rejected],
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444"],
        borderColor: "#fff",
        borderWidth: 3,
        cutout: "60%",
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ position: "relative" }}>
      <Doughnut data={chartData} options={options} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}>
          {data.participationRate}%
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>Tỷ lệ tham gia</div>
      </div>
    </div>
  );
};

// 5. Bar Chart - Sự cố y tế theo mức độ nghiêm trọng
export const MedicalEventsSeverityChart = ({ data }) => {
  const chartData = {
    labels: ["Nhẹ", "Trung bình", "Nghiêm trọng"],
    datasets: [
      {
        label: "Số sự cố",
        data: [
          data.severity.mild,
          data.severity.moderate,
          data.severity.severe,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// 6. Pie Chart - Loại tư vấn phổ biến
export const ConsultationTypesChart = ({ data }) => {
  const types = Object.keys(data.types);
  const values = Object.values(data.types);

  const chartData = {
    labels: types,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#ef4444",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#8b5cf6",
          "#06b6d4",
        ],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value * 100) / total).toFixed(1);
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 0,
                  pointStyle: "circle",
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// 7. Bar Chart - BMI học sinh theo khối
export const BMIByGradeChart = ({ data }) => {
  const grades = Object.keys(data);

  const chartData = {
    labels: grades,
    datasets: [
      {
        label: "Thiếu cân",
        data: grades.map((grade) => data[grade].thieuCan),
        backgroundColor: "#fbbf24",
        borderColor: "#fbbf24",
        borderWidth: 1,
      },
      {
        label: "Bình thường",
        data: grades.map((grade) => data[grade].binhThuong),
        backgroundColor: "#10b981",
        borderColor: "#10b981",
        borderWidth: 1,
      },
      {
        label: "Thừa cân",
        data: grades.map((grade) => data[grade].thuaCan),
        backgroundColor: "#f59e0b",
        borderColor: "#f59e0b",
        borderWidth: 1,
      },
      {
        label: "Béo phì",
        data: grades.map((grade) => data[grade].beoXhi),
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return <Bar data={chartData} options={options} />;
};
