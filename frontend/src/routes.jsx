import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Fase 4 Feature Pages
import AppointmentListPage from './pages/appointments/AppointmentListPage';
import AppointmentDetailPage from './pages/appointments/AppointmentDetailPage';
import MedicalRecordPage from './pages/medical-records/MedicalRecordPage';
import PrescriptionPage from './pages/prescriptions/PrescriptionPage';
import PaymentPage from './pages/payments/PaymentPage';
import MedicinePage from './pages/medicines/MedicinePage';
import DoctorPage from './pages/doctors/DoctorPage';
import PatientPage from './pages/patients/PatientPage';

// ─── Unauthorized Page ────────────────────────────────────────────────────────
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-canvas-white">
    <div className="text-center space-y-4">
      <span className="material-symbols-outlined text-6xl text-error/50">lock</span>
      <h1 className="text-headline-lg text-primary" style={{ fontSize: '36px' }}>403</h1>
      <p className="text-body-md text-steel-secondary">Akses ditolak. Anda tidak memiliki izin untuk halaman ini.</p>
      <a href="/dashboard" className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-label-md hover:bg-on-primary-fixed-variant transition-colors">
        Kembali ke Dashboard
      </a>
    </div>
  </div>
);

// ─── Auth Layout (with top Navbar) ───────────────────────────────────────────
const AuthLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ── Public Routes ──────────────────────────────── */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout><LoginPage /></AuthLayout>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout><RegisterPage /></AuthLayout>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthLayout><ForgotPasswordPage /></AuthLayout>
          )
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Private: All Roles ─────────────────────────── */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />

      {/* ── Private: Admin + Dokter + Pasien ───────────── */}
      <Route path="/appointments" element={
        <PrivateRoute allowedRoles={['Admin', 'Dokter', 'Pasien']}>
          <AppointmentListPage />
        </PrivateRoute>
      } />
      <Route path="/appointments/:id" element={
        <PrivateRoute allowedRoles={['Admin', 'Dokter', 'Pasien']}>
          <AppointmentDetailPage />
        </PrivateRoute>
      } />

      {/* ── Private: Admin + Dokter ─────────────────────── */}
      <Route path="/patients" element={
        <PrivateRoute allowedRoles={['Admin', 'Dokter']}>
          <PatientPage />
        </PrivateRoute>
      } />
      <Route path="/medical-records" element={
        <PrivateRoute allowedRoles={['Admin', 'Dokter']}>
          <MedicalRecordPage />
        </PrivateRoute>
      } />
      <Route path="/prescriptions" element={
        <PrivateRoute allowedRoles={['Admin', 'Dokter']}>
          <PrescriptionPage />
        </PrivateRoute>
      } />

      {/* ── Private: Admin only ─────────────────────────── */}
      <Route path="/doctors" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <DoctorPage />
        </PrivateRoute>
      } />
      <Route path="/medicines" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <MedicinePage />
        </PrivateRoute>
      } />
      <Route path="/payments" element={
        <PrivateRoute allowedRoles={['Admin']}>
          <PaymentPage />
        </PrivateRoute>
      } />

      {/* ── Default & 404 ───────────────────────────────── */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
