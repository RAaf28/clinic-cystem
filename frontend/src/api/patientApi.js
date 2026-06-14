import axiosInstance from './axiosInstance';

/** GET /api/patients — Admin & Dokter */
export const getAll = () =>
  axiosInstance.get('/patients');

/** GET /api/patients/:id */
export const getById = (id) =>
  axiosInstance.get(`/patients/${id}`);

/** POST /api/patients — Admin only */
export const create = (data) =>
  axiosInstance.post('/patients', data);

/** PUT /api/patients/:id — Admin atau Pasien ybs */
export const update = (id, data) =>
  axiosInstance.put(`/patients/${id}`, data);

/** DELETE /api/patients/:id — Admin only */
export const remove = (id) =>
  axiosInstance.delete(`/patients/${id}`);
