import axiosInstance from './axiosInstance';

/** GET /api/prescriptions/record/:medicalRecordId */
export const getByMedicalRecord = (medicalRecordId) =>
  axiosInstance.get(`/prescriptions/record/${medicalRecordId}`);

/** POST /api/prescriptions — Dokter only */
export const create = (data) =>
  axiosInstance.post('/prescriptions', data);

/** DELETE /api/prescriptions/:id — Dokter & Admin */
export const remove = (id) =>
  axiosInstance.delete(`/prescriptions/${id}`);
