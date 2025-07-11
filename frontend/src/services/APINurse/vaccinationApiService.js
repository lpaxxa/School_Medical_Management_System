import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const vaccinationApiService = {
  getAllVaccinationPlans: async () => {
    try {
      const response = await apiService.get('/vaccination-plans/getAllVaccinationPlans');
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccination plans:', error);
      throw error;
    }
  },

  getDetailsVaccinePlanById: async (id) => {
    try {
      const response = await apiService.get(`/vaccination-plans/getDetailsVaccinePlanById/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for vaccine plan ${id}:`, error);
      throw error;
    }
  },

  getAllVaccines: async () => {
    try {
      const response = await apiService.get('/vaccines/getAllVaccine');
      return response.data;
    } catch (error) {
      console.error('Error fetching all vaccines:', error);
      throw error;
    }
  },

  createVaccinationRecord: async (recordData) => {
    try {
      const response = await apiService.post('/vaccinations/record', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating vaccination record:', error);
      throw error;
    }
  },

  getAllVaccinationByHealthProfileId: async (healthProfileId) => {
    try {
      const response = await apiService.get(`/vaccinations/getAllVaccinationByHeathProfileId/${healthProfileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccination history for health profile ${healthProfileId}:`, error);
      throw error;
    }
  },

  getVaccinationHistoryByStudentId: async (parentId, studentId) => {
    try {
      const response = await apiService.get(`/vaccinations/parents/${parentId}/students/${studentId}/vaccinations`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccination history for student ${studentId}:`, error);
      throw error;
    }
  },

  updateVaccinationNote: async (vaccinationId, notes) => {
    try {
      // Try the existing API first
      const response = await apiService.put('/vaccinations/vaccinations/note', { vaccinationId, notes });
      return response.data;
    } catch (error) {
      // If the above fails, try alternative endpoint or format
      console.error(`Error updating note for vaccination ${vaccinationId}:`, error);
      
      // Alternative approach - try different endpoint structure
      try {
        const response = await apiService.put(`/vaccinations/${vaccinationId}/note`, { notes });
        return response.data;
      } catch (altError) {
        console.error(`Alternative API also failed for vaccination ${vaccinationId}:`, altError);
        throw error; // Throw the original error
      }
    }
  },
};

export default vaccinationApiService;