import axiosInstance from './axiosInstance';

/** GET /api/doctors — cached di backend */
export const getAll = () =>
  axiosInstance.get('/doctors');

/** GET /api/doctors/:id */
export const getById = (id) =>
  axiosInstance.get(`/doctors/${id}`);

/** POST /api/doctors — Admin only */
export const create = (data) =>
  axiosInstance.post('/doctors', data);

/** PUT /api/doctors/:id — Admin only */
export const update = (id, data) =>
  axiosInstance.put(`/doctors/${id}`, data);

/** DELETE /api/doctors/:id — Admin only */
export const remove = (id) =>
  axiosInstance.delete(`/doctors/${id}`);
