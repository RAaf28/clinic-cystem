import axiosInstance from './axiosInstance';

/** GET /api/payments — Admin only */
export const getAll = () =>
  axiosInstance.get('/payments');

/** GET /api/payments/stats — Admin only, dashboard summary */
export const getDashboardStats = () =>
  axiosInstance.get('/payments/stats');

/** GET /api/payments/:id */
export const getById = (id) =>
  axiosInstance.get(`/payments/${id}`);

/** GET /api/payments/appointment/:appointmentId */
export const getByAppointment = (appointmentId) =>
  axiosInstance.get(`/payments/appointment/${appointmentId}`);

/** PUT /api/payments/:id/status — Admin only */
export const updateStatus = (id, payment_status) =>
  axiosInstance.put(`/payments/${id}/status`, { payment_status });
