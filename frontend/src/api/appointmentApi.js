import axiosInstance from './axiosInstance';

/** GET /api/appointments — role-based filtering otomatis dari backend */
export const getAll = (params = {}) =>
  axiosInstance.get('/appointments', { params });

/** GET /api/appointments/:id */
export const getById = (id) =>
  axiosInstance.get(`/appointments/${id}`);

/** POST /api/appointments — Pasien & Admin */
export const create = (data) =>
  axiosInstance.post('/appointments', data);

/** PUT /api/appointments/:id/status — Dokter & Admin */
export const updateStatus = (id, status) =>
  axiosInstance.put(`/appointments/${id}/status`, { status });

/** DELETE /api/appointments/:id — Admin only */
export const remove = (id) =>
  axiosInstance.delete(`/appointments/${id}`);
