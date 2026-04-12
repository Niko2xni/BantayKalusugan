import { Navigate } from "react-router-dom";
import { clearAuthSession, getStoredUser } from "../utils/authSession";

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * 
 * Props:
 *   - children: The component to render if authorized
 *   - requiredRole: Optional. If set (e.g., "admin"), only users with that role can access.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const user = getStoredUser();
  const token = localStorage.getItem("token");

  // Not logged in at all → redirect to login
  if (!user || !token) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    clearAuthSession();
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it → redirect to their dashboard
  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === "admin" ? "/admin" : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
