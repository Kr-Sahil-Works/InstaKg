import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { authUser, loading } = useAuth();

  if (loading) return null;

  if (!authUser) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
