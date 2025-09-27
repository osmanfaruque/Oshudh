import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useUserRole } from "../hooks/useUserRole";
import LoadingAnimation from "../components/shared/LoadingAnimation";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const location = useLocation();

  // Show loading if auth or role is still loading
  if (authLoading || roleLoading) {
    return <LoadingAnimation />;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Required role(s): {allowedRoles.join(", ")}
            <br />
            Your role: {userRole || "Unknown"}
          </p>
          <button
            onClick={() => window.history.back()}
            className="medical-btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
