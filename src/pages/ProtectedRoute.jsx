import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    const isSuperAdmin = sessionStorage.getItem("isSuperAdmin") === "true"
    return isAdmin || isSuperAdmin ? children : <Navigate to="/clearance" />;

};

export default ProtectedRoute;