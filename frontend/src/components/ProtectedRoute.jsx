import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  // No token, then redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Token expired, then redirect to login
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Role not allowed, then redirect to unauthorized
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Otherwise, allow access
    return children;
  } catch (error) {
    // Invalid token format, then clear and redirect
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}
