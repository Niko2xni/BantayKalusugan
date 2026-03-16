import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * 
 * Props:
 *   - children: The component to render if authorized
 *   - requiredRole: Optional. If set (e.g., "admin"), only users with that role can access.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const userData = localStorage.getItem("user");

  // Not logged in at all → redirect to login
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userData);

  // If a specific role is required and user doesn't have it → redirect to their dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
