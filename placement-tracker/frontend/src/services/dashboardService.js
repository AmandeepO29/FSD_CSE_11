import api from './api';

export const dashboardService = {
  getPublicOverview: async () => {
    const { data } = await api.get('/public/overview');
    return data;
  },
  getAdminDashboard: async () => {
    const { data } = await api.get('/dashboard/admin');
    return data;
  },
  getStudentDashboard: async () => {
    const { data } = await api.get('/dashboard/student');
    return data;
  },
};
