import api from './api';

export const applicationService = {
  apply: async (driveId) => {
    const { data } = await api.post('/applications', { driveId });
    return data;
  },
  getMyApplications: async () => {
    const { data } = await api.get('/applications/my');
    return data;
  },
  listApplications: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const { data } = await api.get('/applications', { params: cleanParams });
    return data;
  },
  getApplicationsByDrive: async (driveId) => {
    const { data } = await api.get(`/applications/drive/${driveId}`);
    return data;
  },
  updateStatus: async (id, payload) => {
    const { data } = await api.put(`/applications/${id}/status`, payload);
    return data;
  },
};
