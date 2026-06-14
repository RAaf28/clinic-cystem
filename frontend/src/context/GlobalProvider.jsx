import { AuthProvider } from './AuthContext';
import { AppointmentProvider } from './AppointmentContext';
import { MedicalRecordProvider } from './MedicalRecordContext';

const GlobalProvider = ({ children }) => (
  <AuthProvider>
    <AppointmentProvider>
      <MedicalRecordProvider>
        {children}
      </MedicalRecordProvider>
    </AppointmentProvider>
  </AuthProvider>
);

export default GlobalProvider;
