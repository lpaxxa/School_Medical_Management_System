const API_BASE_URL = "/api/v1";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

class VaccineService {
  async getAllVaccines() {
    try {
      const response = await fetch(`${API_BASE_URL}/vaccines/getAllVaccine`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: "Lấy dữ liệu vaccine thành công"
      };
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      return {
        success: false,
        data: [],
        message: error.message || "Có lỗi xảy ra khi lấy dữ liệu vaccine"
      };
    }
  }

  async getVaccineStatistics() {
    try {
      const result = await this.getAllVaccines();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      const vaccines = result.data;
      
      // Tính toán thống kê
      const stats = {
        total: vaccines.length,
        active: vaccines.filter(v => v.isActive).length,
        inactive: vaccines.filter(v => !v.isActive).length,
        forInfants: vaccines.filter(v => v.minAgeMonths <= 12).length,
        forChildren: vaccines.filter(v => v.minAgeMonths > 12 && v.maxAgeMonths <= 60).length,
        forTeens: vaccines.filter(v => v.minAgeMonths > 60).length,
        multiDose: vaccines.filter(v => v.totalDoses > 1).length,
        singleDose: vaccines.filter(v => v.totalDoses === 1).length,
        byAgeGroup: {
          "0-1 tuổi": vaccines.filter(v => v.maxAgeMonths <= 12).length,
          "1-5 tuổi": vaccines.filter(v => v.minAgeMonths <= 60 && v.maxAgeMonths > 12).length,
          "5+ tuổi": vaccines.filter(v => v.minAgeMonths > 60).length
        }
      };

      return {
        success: true,
        data: stats,
        message: "Tính toán thống kê thành công"
      };
    } catch (error) {
      console.error("Error calculating vaccine statistics:", error);
      return {
        success: false,
        data: null,
        message: error.message || "Có lỗi xảy ra khi tính toán thống kê"
      };
    }
  }

  // Helper function để chuyển đổi tháng thành năm tuổi
  monthsToAgeText(months) {
    if (months < 12) {
      return `${months} tháng`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} tuổi`;
      } else {
        return `${years} tuổi ${remainingMonths} tháng`;
      }
    }
  }

  // Helper function để lấy độ tuổi phù hợp
  getAgeRange(vaccine) {
    const minAge = this.monthsToAgeText(vaccine.minAgeMonths);
    const maxAge = this.monthsToAgeText(vaccine.maxAgeMonths);
    return `${minAge} - ${maxAge}`;
  }

  // Helper function để lấy thông tin liều tiêm
  getDosageInfo(vaccine) {
    if (vaccine.totalDoses === 1) {
      return "Tiêm 1 lần";
    } else {
      return `${vaccine.totalDoses} liều (cách ${vaccine.intervalDays} ngày)`;
    }
  }
}

const vaccineService = new VaccineService();
export default vaccineService;
