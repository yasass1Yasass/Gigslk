import { StrictMode } from 'react'; 
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthContextProvider } from './contexts/AuthContext'; // Import AuthContextProvider
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* BrowserRouter should wrap your app for routing */}
      <AuthContextProvider> {/* Wrap your App with AuthContextProvider */}
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
