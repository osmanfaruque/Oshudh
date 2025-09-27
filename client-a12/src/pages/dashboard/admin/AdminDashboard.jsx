import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import { Link } from "react-router";
import API_CONFIG from "../../../configs/api.config";
import axios from "axios";
import {
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const AdminDashboard = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    setTitle("Admin Dashboard | Oshudh");
  }, [setTitle]);

  // Fetch admin dashboard stats
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const token = await currentUser.getIdToken(true);

        const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        return response.data.data;
      } catch (error) {
        console.error("Admin stats query error:", error);
        throw error;
      }
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure you're logged in as admin user
          </p>
          <button
            onClick={() => window.location.reload()}
            className="medical-btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Homepage</h1>
        <p className="text-gray-600">Total sales revenue of the website</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sales Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                ৳{stats?.totalSalesRevenue?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From {stats?.totalOrders || 0} orders
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaDollarSign className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid Total</p>
              <p className="text-3xl font-bold text-blue-600">
                ৳{stats?.paidTotal?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Completed transactions
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaCheckCircle className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Total</p>
              <p className="text-3xl font-bold text-orange-600">
                ৳{stats?.pendingTotal?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <FaUsers className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-indigo-600">
                {stats?.totalSellers || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50">
              <FaUsers className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-pink-600">
                {stats?.totalMedicines || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-pink-50">
              <FaPills className="text-2xl text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-teal-600">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-teal-50">
              <FaShoppingCart className="text-2xl text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Features  */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Admin Dashboard Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Manage Users */}
          <Link
            to="/dashboard/admin/users"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaUsers className="text-2xl text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-blue-800">Manage Users</h4>
                <p className="text-sm text-blue-600">
                  Make users seller/admin or downgrade
                </p>
              </div>
            </div>
          </Link>

          {/* Manage Category */}
          <Link
            to="/dashboard/admin/categories"
            className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaPills className="text-2xl text-green-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-green-800">
                  Manage Category
                </h4>
                <p className="text-sm text-green-600">
                  Add, update, delete medicine categories
                </p>
              </div>
            </div>
          </Link>

          {/* Payment Management */}
          <Link
            to="/dashboard/admin/payments"
            className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaShoppingCart className="text-2xl text-yellow-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-yellow-800">
                  Payment Management
                </h4>
                <p className="text-sm text-yellow-600">
                  Accept pending payments
                </p>
              </div>
            </div>
          </Link>

          {/* Sales Report */}
          <Link
            to="/dashboard/admin/sales-report"
            className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaChartLine className="text-2xl text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-purple-800">Sales Report</h4>
                <p className="text-sm text-purple-600">
                  View & download sales data
                </p>
              </div>
            </div>
          </Link>

          {/* Manage Banner Advertise */}
          <Link
            to="/dashboard/admin/banner"
            className="block p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaChartLine className="text-2xl text-red-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-red-800">
                  Manage Banner Advertise
                </h4>
                <p className="text-sm text-red-600">
                  Control homepage slider ads
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Debug Info (Remove in production) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          Debug: User - {currentUser?.email} | Time -{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
