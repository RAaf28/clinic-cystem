import axiosInstance from './axiosInstance';

/** GET /api/medical-records — Admin & Dokter */
export const getAll = () =>
  axiosInstance.get('/medical-records');

/** GET /api/medical-records/:id */
export const getById = (id) =>
  axiosInstance.get(`/medical-records/${id}`);

/** GET /api/medical-records/patient/:patientId */
export const getByPatient = (patientId) =>
  axiosInstance.get(`/medical-records/patient/${patientId}`);

/** POST /api/medical-records — Dokter only */
export const create = (data) =>
  axiosInstance.post('/medical-records', data);

/** PUT /api/medical-records/:id — Dokter only */
export const update = (id, data) =>
  axiosInstance.put(`/medical-records/${id}`, data);
