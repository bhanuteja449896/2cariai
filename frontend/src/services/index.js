import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const reportService = {
  uploadReport: async (formData) => {
    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getReports: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/reports?${params}`);
    return response.data;
  },

  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  downloadReport: async (id) => {
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  shareReport: async (id, shareData) => {
    const response = await api.post(`/reports/${id}/share`, shareData);
    return response.data;
  },

  getSharedReports: async () => {
    const response = await api.get('/reports/shared');
    return response.data;
  },

  revokeAccess: async (id) => {
    const response = await api.delete(`/reports/shared/${id}`);
    return response.data;
  }
};

export const vitalsService = {
  getVitals: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/vitals?${params}`);
    return response.data;
  },

  getVitalsSummary: async () => {
    const response = await api.get('/vitals/summary');
    return response.data;
  },

  getVitalTypes: async () => {
    const response = await api.get('/vitals/types');
    return response.data;
  },

  getVitalsTrends: async (vitalType) => {
    const response = await api.get(`/vitals/trends?vital_type=${vitalType}`);
    return response.data;
  }
};
