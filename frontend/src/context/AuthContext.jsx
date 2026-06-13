import { createContext, useContext, useReducer, useEffect } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('klinik_token') || null,
  isLoading: true, // mulai sebagai true untuk memeriksa token saat mount
  isAuthenticated: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = async () => {
    if (!state.token) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }
    
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await authApi.getMe();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.data, token: state.token },
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('klinik_token');
      dispatch({ type: 'AUTH_ERROR', payload: error?.message || 'Gagal memuat profil' });
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await authApi.login(email, password);
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      localStorage.setItem('klinik_token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return true;
    } catch (error) {
      const errMsg = error?.message || 'Login gagal. Periksa kembali kredensial Anda.';
      dispatch({ type: 'AUTH_ERROR', payload: errMsg });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await authApi.register(userData);
      dispatch({ type: 'AUTH_LOGOUT' });
      return response;
    } catch (error) {
      const errMsg = error?.message || 'Registrasi gagal. Coba beberapa saat lagi.';
      dispatch({ type: 'AUTH_ERROR', payload: errMsg });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('klinik_token');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
