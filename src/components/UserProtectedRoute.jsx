import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

/**
 * Route guard for regular (non-admin) users.
 * Unauthenticated visitors are redirected to /login.
 * The current path is preserved in location.state.from so the user
 * is returned here after a successful login.
 */
export default function UserProtectedRoute({ children }) {
  const { isAuthenticated } = useUserAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
