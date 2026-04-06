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
  const token = localStorage.getItem("token");

  // Not logged in at all → redirect to login
  if (!userData || !token) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it → redirect to their dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
