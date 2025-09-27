import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import { FaHistory } from "react-icons/fa";

const UserDashboard = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    setTitle("User Dashboard | Oshudh");
  }, [setTitle]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {currentUser?.displayName || currentUser?.email}
        </p>
      </div>

      {/* User Features*/}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          User Dashboard Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <a
            href="/dashboard/user/payments"
            className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <FaHistory className="text-3xl text-blue-600 mr-4" />
              <div>
                <h4 className="text-xl font-semibold text-blue-800">
                  Payment History
                </h4>
                <p className="text-blue-600">
                  View all payment history with transaction ID and status
                  (pending/paid)
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
