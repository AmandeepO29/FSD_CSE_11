import api from './api';

export const driveService = {
  listDrives: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const { data } = await api.get('/drives', { params: cleanParams });
    return data;
  },
  getDriveById: async (id) => {
    const { data } = await api.get(`/drives/${id}`);
    return data;
  },
  createDrive: async (payload) => {
    const { data } = await api.post('/drives', payload);
    return data;
  },
  updateDrive: async (id, payload) => {
    const { data } = await api.put(`/drives/${id}`, payload);
    return data;
  },
  togglePublish: async (id, published) => {
    const { data } = await api.patch(`/drives/${id}/publish`, null, {
      params: { published },
    });
    return data;
  },
  deleteDrive: async (id) => {
    const { data } = await api.delete(`/drives/${id}`);
    return data;
  },
};
