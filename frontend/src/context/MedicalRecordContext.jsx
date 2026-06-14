import { createContext, useContext, useReducer, useCallback } from 'react';
import * as medicalRecordApi from '../api/medicalRecordApi';
import * as prescriptionApi from '../api/prescriptionApi';

const MedicalRecordContext = createContext();

const initialState = {
  records: [],
  currentRecord: null,
  prescriptions: [],
  isLoading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_RECORDS_SUCCESS':
      return { ...state, isLoading: false, records: action.payload };
    case 'FETCH_RECORD_SUCCESS':
      return { ...state, isLoading: false, currentRecord: action.payload };
    case 'FETCH_PRESCRIPTIONS_SUCCESS':
      return { ...state, prescriptions: action.payload };
    case 'ADD_PRESCRIPTION':
      return { ...state, prescriptions: [...state.prescriptions, action.payload] };
    case 'REMOVE_PRESCRIPTION':
      return {
        ...state,
        prescriptions: state.prescriptions.filter((p) => p.id !== action.payload),
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLEAR_CURRENT':
      return { ...state, currentRecord: null, prescriptions: [] };
    default:
      return state;
  }
};

export const MedicalRecordProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchRecords = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await medicalRecordApi.getAll();
      dispatch({ type: 'FETCH_RECORDS_SUCCESS', payload: res.data?.data || [] });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Gagal memuat rekam medis' });
    }
  }, []);

  const fetchRecordByPatient = useCallback(async (patientId) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await medicalRecordApi.getByPatient(patientId);
      dispatch({ type: 'FETCH_RECORDS_SUCCESS', payload: res.data?.data || [] });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Gagal memuat rekam medis' });
    }
  }, []);

  const fetchRecordById = useCallback(async (id) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await medicalRecordApi.getById(id);
      dispatch({ type: 'FETCH_RECORD_SUCCESS', payload: res.data?.data });
      return res.data?.data;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err?.message });
      throw err;
    }
  }, []);

  const createRecord = useCallback(async (data) => {
    const res = await medicalRecordApi.create(data);
    await fetchRecords();
    return res.data?.data;
  }, [fetchRecords]);

  const fetchPrescriptions = useCallback(async (medicalRecordId) => {
    try {
      const res = await prescriptionApi.getByMedicalRecord(medicalRecordId);
      dispatch({ type: 'FETCH_PRESCRIPTIONS_SUCCESS', payload: res.data?.data || [] });
    } catch (err) {
      dispatch({ type: 'FETCH_PRESCRIPTIONS_SUCCESS', payload: [] });
    }
  }, []);

  const addPrescription = useCallback(async (data) => {
    const res = await prescriptionApi.create(data);
    dispatch({ type: 'ADD_PRESCRIPTION', payload: res.data?.data });
    // Refresh prescriptions list
    await fetchPrescriptions(data.medical_record_id);
    return res.data?.data;
  }, [fetchPrescriptions]);

  const removePrescription = useCallback(async (id, medicalRecordId) => {
    await prescriptionApi.remove(id);
    dispatch({ type: 'REMOVE_PRESCRIPTION', payload: id });
    if (medicalRecordId) await fetchPrescriptions(medicalRecordId);
  }, [fetchPrescriptions]);

  return (
    <MedicalRecordContext.Provider
      value={{
        ...state,
        fetchRecords,
        fetchRecordByPatient,
        fetchRecordById,
        createRecord,
        fetchPrescriptions,
        addPrescription,
        removePrescription,
      }}
    >
      {children}
    </MedicalRecordContext.Provider>
  );
};

export const useMedicalRecord = () => useContext(MedicalRecordContext);
export default MedicalRecordContext;
