import { BrowserRouter } from 'react-router-dom';
import GlobalProvider from './context/GlobalProvider';
import AppRoutes from './routes';
import './App.css'; // Keep standard app css import just in case, though index.css handles tailwind

function App() {
  return (
    <BrowserRouter>
      <GlobalProvider>
        <AppRoutes />
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default App;
