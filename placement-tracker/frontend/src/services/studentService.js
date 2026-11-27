import api from './api';

export const studentService = {
  getMyProfile: async () => {
    const { data } = await api.get('/student/profile');
    return data;
  },
  updateMyProfile: async (payload) => {
    const { data } = await api.put('/student/profile', payload);
    return data;
  },
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/student/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  downloadResumeBlob: async (studentId) => {
    const { data } = await api.get(`/students/${studentId}/resume`, {
      responseType: 'blob',
    });
    return data;
  },
  // Admin student management
  listStudents: async (params = {}) => {
    const { data } = await api.get('/admin/students', { params });
    return data;
  },
  getStudentById: async (id) => {
    const { data } = await api.get(`/admin/students/${id}`);
    return data;
  },
  createStudent: async (payload) => {
    const { data } = await api.post('/admin/students', payload);
    return data;
  },
  updateStudent: async (id, payload) => {
    const { data } = await api.put(`/admin/students/${id}`, payload);
    return data;
  },
  toggleStudentStatus: async (id, active) => {
    const { data } = await api.patch(`/admin/students/${id}/status`, null, {
      params: { active },
    });
    return data;
  },
  deleteStudent: async (id) => {
    const { data } = await api.delete(`/admin/students/${id}`);
    return data;
  },
};
