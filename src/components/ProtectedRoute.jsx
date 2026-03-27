import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps a route so only authenticated users (optionally with a specific role) can access it.
 * Unauthenticated → /login
 * Wrong role → /
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthed, user } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
