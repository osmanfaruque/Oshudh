import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useUserRole } from "../../hooks/useUserRole";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import LoadingAnimation from "../../components/shared/LoadingAnimation";

const DashboardLayout = () => {
  const { userRole, loading, error } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && userRole) {
      const currentPath = location.pathname;

      if (currentPath === "/dashboard") {
        switch (userRole) {
          case "admin":
            navigate("/dashboard/admin", { replace: true });
            break;
          case "seller":
            navigate("/dashboard/seller", { replace: true });
            break;
          case "user":
          default:
            navigate("/dashboard/user", { replace: true });
            break;
        }
      }

      // Prevent access to wrong dashboard
      else if (currentPath.includes("/dashboard/")) {
        const pathRole = currentPath.split("/dashboard/")[1]?.split("/")[0];

        if (pathRole && pathRole !== userRole) {
          // Redirect to correct dashboard
          switch (userRole) {
            case "admin":
              navigate("/dashboard/admin", { replace: true });
              break;
            case "seller":
              navigate("/dashboard/seller", { replace: true });
              break;
            case "user":
            default:
              navigate("/dashboard/user", { replace: true });
              break;
          }
        }
      }
    }
  }, [userRole, loading, navigate, location.pathname]);

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingAnimation />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error
  if (error && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Dashboard Access Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="medical-btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading if role not determined yet
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-medical-primary"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 mt-4">
            Setting up your dashboard...
          </h2>
          <p className="text-gray-600">Determining your access level</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar - Pass userRole dynamically */}
        <DashboardSidebar userRole={userRole} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header - Pass userRole dynamically */}
          <DashboardHeader userRole={userRole} />

          <main className="flex-1 p-6 overflow-auto">
            <Outlet context={{ userRole }} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
