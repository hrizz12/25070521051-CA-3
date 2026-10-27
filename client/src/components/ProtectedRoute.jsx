import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Wraps every private page. Not signed in -> redirect to /login.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullPage label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}
