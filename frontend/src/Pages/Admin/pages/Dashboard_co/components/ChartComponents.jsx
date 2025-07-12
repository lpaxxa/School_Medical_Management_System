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
        backgroundColor: "#64748b",
        borderColor: "#fff",
        borderWidth: 2,
      },
    },
  };

  return <Line data={data} options={options} />;
};

// 3b. Bar Chart - Thống kê trạng thái kế hoạch tiêm chủng
export const VaccinationPlansStatusChart = ({ data }) => {
  const chartData = {
    labels: ["Chờ phụ huynh", "Đang thực hiện", "Hoàn thành", "Đã hủy"],
    datasets: [
      {
        label: "Số kế hoạch",
        data: [
          data.statusBreakdown?.waitingParent || 0,
          data.statusBreakdown?.inProgress || 0,
          data.statusBreakdown?.completed || 0,
          data.statusBreakdown?.canceled || 0,
        ],
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
        borderColor: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
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
        callbacks: {
          label: function (context) {
            const total = data.total || 0;
            const percentage = total > 0 ? ((context.parsed.y * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed.y} (${percentage}%)`;
          },
        },
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
        backgroundColor: ["#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4"],
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
  // Filter out metadata and only get actual grade keys
  const grades = Object.keys(data).filter(key => !key.startsWith('_'));

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
        title: {
          display: true,
          text: "Khối lớp",
          color: "#374151",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 20,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          stepSize: 5,
          callback: function(value) {
            // Only show values: 0, 5, 10, 15, 20
            if ([0, 5, 10, 15, 20].includes(value)) {
              return value;
            }
            return '';
          },
        },
        title: {
          display: true,
          text: "Số lượng học sinh",
          color: "#374151",
          font: {
            size: 12,
            weight: "bold",
          },
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

// 8. Pie Chart - Trạng thái chiến dịch sức khỏe
export const HealthCampaignStatusChart = ({ data }) => {
  const chartData = {
    labels: ["Đang chuẩn bị", "Đang diễn ra", "Hoàn thành", "Đã hủy"],
    datasets: [
      {
        data: [data.preparing, data.ongoing, data.completed, data.cancelled],
        backgroundColor: ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"],
        borderColor: ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"],
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
            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// 9. Pie Chart - Số lượng học sinh theo khối lớp
export const StudentsByGradeChart = ({ data }) => {
  // Extract grade stats, filtering out non-grade keys
  const gradeStats = data.gradeStats || {};
  const grades = Object.keys(gradeStats).filter(key => !key.startsWith('_'));
  const values = grades.map(grade => gradeStats[grade]);
  
  // Generate distinct neutral colors for each grade
  const colors = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#22c55e", // green-500
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
  ];

  const chartData = {
    labels: grades,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, grades.length),
        borderColor: colors.slice(0, grades.length),
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
            size: 11,
          },
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value * 100) / total).toFixed(1) : 0;
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
            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} học sinh (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// 10. Pie Chart - Trạng thái phê duyệt thuốc
export const MedicationApprovalStatusChart = ({ data }) => {
  const chartData = {
    labels: ["Đã phê duyệt", "Bị từ chối", "Đang chờ"],
    datasets: [
      {
        data: [data.approved, data.rejected, data.pending],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
        borderColor: ["#10b981", "#ef4444", "#f59e0b"],
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
            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// 11. Pie Chart - Trạng thái sử dụng thuốc
export const MedicationConsumptionStatusChart = ({ data }) => {
  const chartData = {
    labels: ["Đã uống hết", "Uống một phần", "Hết hạn"],
    datasets: [
      {
        data: [data.fullyTaken, data.partiallyTaken, data.expired],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: ["#10b981", "#f59e0b", "#ef4444"],
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
            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

// 12. Pie Chart - Phân loại tiêm chủng theo nguồn
export const VaccinationTypeChart = ({ data }) => {
  const chartData = {
    labels: ["Kế hoạch trường", "Phụ huynh khai báo", "Tiêm bù"],
    datasets: [
      {
        data: [data.schoolPlan, data.parentDeclared, data.catchUp],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderColor: ["#3b82f6", "#10b981", "#f59e0b"],
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
            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} mũi tiêm (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};
