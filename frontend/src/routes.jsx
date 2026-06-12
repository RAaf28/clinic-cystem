import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Placeholder Pages for now
const DashboardPage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-headline-lg text-on-surface mb-4">Dashboard</h1>
      <p className="text-body-md text-on-surface-variant mb-8">
        Selamat datang, <span className="font-bold">{user?.name || 'User'}</span>!
      </p>
      <button 
        onClick={logout} 
        className="btn-primary w-auto inline-flex px-6 py-3 bg-error text-on-error hover:opacity-90"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Keluar
      </button>
    </div>
  );
};
const UnauthorizedPage = () => <div className="p-8"><h1 className="text-error text-headline-lg">403 - Akses Ditolak</h1></div>;

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Private Routes (All Roles) */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        } 
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
