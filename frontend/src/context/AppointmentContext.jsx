import { createContext, useContext, useReducer, useCallback } from 'react';
import * as appointmentApi from '../api/appointmentApi';

const AppointmentContext = createContext();

const initialState = {
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
};

const appointmentReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, appointments: action.payload };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SELECT':
      return { ...state, selectedAppointment: action.payload };
    case 'RESET_SELECTED':
      return { ...state, selectedAppointment: null };
    case 'UPDATE_ONE':
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };
    case 'REMOVE':
      return {
        ...state,
        appointments: state.appointments.filter((a) => a.id !== action.payload),
      };
    default:
      return state;
  }
};

export const AppointmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  const fetchAppointments = useCallback(async (filters = {}) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await appointmentApi.getAll(filters);
      dispatch({ type: 'FETCH_SUCCESS', payload: res.data?.data || [] });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Gagal memuat appointments' });
    }
  }, []);

  const fetchAppointmentById = useCallback(async (id) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await appointmentApi.getById(id);
      const appt = res.data?.data;
      dispatch({ type: 'SELECT', payload: appt });
      return appt;
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Gagal memuat appointment' });
      throw err;
    }
  }, []);

  const createAppointment = useCallback(async (data) => {
    const res = await appointmentApi.create(data);
    const newAppt = res.data?.data;
    // refresh list after create
    await fetchAppointments();
    return newAppt;
  }, [fetchAppointments]);

  const updateAppointmentStatus = useCallback(async (id, status) => {
    const res = await appointmentApi.updateStatus(id, status);
    dispatch({ type: 'UPDATE_ONE', payload: { id, status } });
    return res.data?.data;
  }, []);

  const deleteAppointment = useCallback(async (id) => {
    await appointmentApi.remove(id);
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  return (
    <AppointmentContext.Provider
      value={{
        ...state,
        fetchAppointments,
        fetchAppointmentById,
        createAppointment,
        updateAppointmentStatus,
        deleteAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => useContext(AppointmentContext);
export default AppointmentContext;
