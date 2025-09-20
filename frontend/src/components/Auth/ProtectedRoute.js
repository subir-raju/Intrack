import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader } from "semantic-ui-react";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader active>Checking authentication...</Loader>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/qc-manager" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
