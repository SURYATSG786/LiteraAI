import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Shell from './Shell';

export function ProtectedRoute({ children, requireAssessment = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-xl font-extrabold text-[#06304f]/80">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (requireAssessment && user.assessment_score == null && location.pathname !== '/assessment') {
    return <Navigate to="/assessment" replace />;
  }

  return children || (
    <Shell>
      <Outlet />
    </Shell>
  );
}
