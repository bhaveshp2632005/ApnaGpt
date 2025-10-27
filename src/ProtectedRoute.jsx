// ProtectedRoute.jsx
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // spinner while checking

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
