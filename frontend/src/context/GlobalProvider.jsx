import { AuthProvider } from './AuthContext';

const GlobalProvider = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default GlobalProvider;
