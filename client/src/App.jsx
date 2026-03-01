import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import StartupAuth from './pages/StartupAuth';
import UserAuth from './pages/UserAuth';
import StartupDashboard from './pages/StartupDashboard';
import UserDashboard from './pages/UserDashboard';

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/startup-auth" element={<StartupAuth />} />
      <Route path="/user-auth" element={<UserAuth />} />
      <Route
        path="/startup/dashboard"
        element={
          <ProtectedRoute allowedRole="startup">
            <StartupDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
