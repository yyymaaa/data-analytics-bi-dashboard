import { Naviagte } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoless }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    //No token means you are logged out
    if (!token) {
        return <Navigate to="/login" replace />
    }

    //if allowedRoutes is set, check if the user's role is allowed
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace/>
    }

    return children;
}