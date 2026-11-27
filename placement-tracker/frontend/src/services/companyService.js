import api from './api';

export const companyService = {
  listCompanies: async (search = '') => {
    const { data } = await api.get('/companies', {
      params: search ? { search } : {},
    });
    return data;
  },
  getCompanyById: async (id) => {
    const { data } = await api.get(`/companies/${id}`);
    return data;
  },
  createCompany: async (payload) => {
    const { data } = await api.post('/companies', payload);
    return data;
  },
  updateCompany: async (id, payload) => {
    const { data } = await api.put(`/companies/${id}`, payload);
    return data;
  },
  deleteCompany: async (id) => {
    const { data } = await api.delete(`/companies/${id}`);
    return data;
  },
};
