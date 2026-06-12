import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('klinik_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      return Promise.reject(new Error(response.data.message || 'Error occurred'));
    }
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('klinik_token');
        // Redirect will be handled by the router/auth context, but we could do window.location.href = '/login' here
      } else if (error.response.status === 403) {
        console.warn('Akses ditolak');
      }
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
