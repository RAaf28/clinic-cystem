import axiosInstance from './axiosInstance';

/** GET /api/medicines — cached di backend */
export const getAll = () =>
  axiosInstance.get('/medicines');

/** GET /api/medicines/:id */
export const getById = (id) =>
  axiosInstance.get(`/medicines/${id}`);

/** POST /api/medicines — Admin only */
export const create = (data) =>
  axiosInstance.post('/medicines', data);

/** PUT /api/medicines/:id — Admin only */
export const update = (id, data) =>
  axiosInstance.put(`/medicines/${id}`, data);

/** DELETE /api/medicines/:id — Admin only */
export const remove = (id) =>
  axiosInstance.delete(`/medicines/${id}`);
