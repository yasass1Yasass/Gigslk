import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate for redirection
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Artists from './pages/Artists';
import About from './pages/About';
import HostDashboard from './pages/HostDashboard';
import ArtistManagement from './pages/ArtistManagement';
import HostManagement from './pages/HostManagement';
import AdminDashboard from './pages/AdminDashboard';
import RegisterPage from './pages/RegisterPage';
import SignInPage from './pages/SignIn'; 
import { useAuth } from './contexts/AuthContext'; // Import useAuth for authentication checks

function App() {
  const { isAuthenticated, user, isLoading } = useAuth(); // Get auth state from context

  // Show a loading indicator while authentication status is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading application...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-inter">
      <Routes>
        {/* Routes with Navigation */}
        <Route path="/" element={
          <>
            <Navigation />
            <Home />
          </>
        } />
        <Route path="/artists" element={
          <>
            <Navigation />
            <Artists />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navigation />
            <About />
          </>
        } />
        <Route path="/register" element={
          <>
            {/* Navigation might not be needed on register/signin pages for full-screen forms */}
            <RegisterPage />
          </>
        } />
        <Route path="/signin" element={
          <>
            <SignInPage />
          </>
        } />

        {/* Protected Routes for Dashboards */}
        {/* Host Dashboard */}
        <Route
          path="/host-dashboard"
          element={
            isAuthenticated && user?.role === 'host' ? (
              <HostDashboard />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        {/* Artist Management */}
        <Route
          path="/artist-management"
          element={
            isAuthenticated && user?.role === 'performer' ? (
              <ArtistManagement />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        {/* Host Management */}
        <Route
          path="/host-management"
          element={
            isAuthenticated && user?.role === 'host' ? (
              <HostManagement />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* Fallback route for any unmatched paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
