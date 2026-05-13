import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import Spinner from "./ui/Spinner";

export default function UserProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUserAuth();
  const location = useLocation();

  // Wait for token verification before deciding to redirect
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
