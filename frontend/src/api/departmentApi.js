import axiosInstance from './axiosInstance';

/** GET /api/departments — public */
export const getAll = () =>
  axiosInstance.get('/departments');

/** POST /api/departments — Admin only */
export const create = (data) =>
  axiosInstance.post('/departments', data);

/** PUT /api/departments/:id — Admin only */
export const update = (id, data) =>
  axiosInstance.put(`/departments/${id}`, data);

/** DELETE /api/departments/:id — Admin only */
export const remove = (id) =>
  axiosInstance.delete(`/departments/${id}`);
