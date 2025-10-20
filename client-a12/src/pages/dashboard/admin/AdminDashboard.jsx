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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  // Fetch payments for chart data
  const { data: payments = [] } = useQuery({
    queryKey: ["allPayments"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/payments`, {
        headers: API_CONFIG.HEADERS,
      });
      return data || [];
    },
  });

  // Prepare chart data - Monthly revenue
  const getMonthlyRevenueData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = months.map((month, index) => {
      return payments
        .filter((payment) => {
          const paymentDate = new Date(payment.date);
          return (
            paymentDate.getFullYear() === currentYear &&
            paymentDate.getMonth() === index &&
            payment.status === "paid"
          );
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    });

    const monthlyOrders = months.map((month, index) => {
      return payments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate.getFullYear() === currentYear &&
          paymentDate.getMonth() === index
        );
      }).length;
    });

    return { labels: months, revenue: monthlyRevenue, orders: monthlyOrders };
  };

  const chartData = getMonthlyRevenueData();

  const salesChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Revenue (৳)",
        data: chartData.revenue,
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderColor: "rgb(37, 99, 235)",
        borderWidth: 2,
      },
    ],
  };

  const ordersChartData = {
    labels: ["Paid", "Pending", "Total"],
    datasets: [
      {
        label: "Orders",
        data: [
          stats?.paidOrders || 0,
          stats?.pendingOrders || 0,
          stats?.totalOrders || 0,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(37, 99, 235, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 146, 60)",
          "rgb(37, 99, 235)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of your platform's performance and statistics
        </p>
      </div>

      {/* Main Stats Cards - Revenue Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1 flex items-center gap-2">
                <FaDollarSign className="text-xl" />
                Total Sales Revenue
              </p>
              <p className="text-4xl font-bold">
                ৳{stats?.totalSalesRevenue?.toLocaleString() || "0"}
              </p>
              <p className="text-green-100 text-sm mt-2">
                From {stats?.totalOrders || 0} orders
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/20 backdrop-blur-sm">
              <FaChartLine className="text-3xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1 flex items-center gap-2">
                <FaCheckCircle className="text-xl" />
                Paid Total
              </p>
              <p className="text-4xl font-bold">
                ৳{stats?.paidTotal?.toLocaleString() || "0"}
              </p>
              <p className="text-blue-100 text-sm mt-2">Completed transactions</p>
            </div>
            <div className="p-4 rounded-lg bg-white/20 backdrop-blur-sm">
              <FaDollarSign className="text-3xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-1 flex items-center gap-2">
                <FaClock className="text-xl" />
                Pending Total
              </p>
              <p className="text-4xl font-bold">
                ৳{stats?.pendingTotal?.toLocaleString() || "0"}
              </p>
              <p className="text-orange-100 text-sm mt-2">Awaiting payment</p>
            </div>
            <div className="p-4 rounded-lg bg-white/20 backdrop-blur-sm">
              <FaClock className="text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.totalUsers || 0}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <div className="px-2 py-1 bg-purple-50 rounded">
                  Sellers: {stats?.totalSellers || 0}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <FaUsers className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Medicines</p>
              <p className="text-3xl font-bold text-pink-600">
                {stats?.totalMedicines || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Products available</p>
            </div>
            <div className="p-3 rounded-lg bg-pink-50">
              <FaPills className="text-3xl text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-teal-600">
                {stats?.totalOrders || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All time orders</p>
            </div>
            <div className="p-3 rounded-lg bg-teal-50">
              <FaShoppingCart className="text-3xl text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
              <p className="text-3xl font-bold text-indigo-600">
                ৳
                {stats?.totalOrders > 0
                  ? Math.round(stats.totalSalesRevenue / stats.totalOrders)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Per transaction</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50">
              <FaDollarSign className="text-3xl text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Monthly Revenue - {new Date().getFullYear()}
          </h3>
          <div className="h-80">
            <Bar data={salesChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Order Status Doughnut Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" />
            Order Distribution
          </h3>
          <div className="h-80">
            <Doughnut data={ordersChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Admin Features Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <FaUsers className="text-blue-600" />
          Admin Management Tools
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
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaPills className="text-2xl text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Manage Category
                </h4>
                <p className="text-sm text-blue-600">
                  Add, update, delete medicine categories
                </p>
              </div>
            </div>
          </Link>

          {/* Payment Management */}
          <Link
            to="/dashboard/admin/payments"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaShoppingCart className="text-2xl text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Payment Management
                </h4>
                <p className="text-sm text-blue-600">
                  Accept pending payments
                </p>
              </div>
            </div>
          </Link>

          {/* Sales Report */}
          <Link
            to="/dashboard/admin/sales-report"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaChartLine className="text-2xl text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-blue-800">Sales Report</h4>
                <p className="text-sm text-blue-600">
                  View & download sales data
                </p>
              </div>
            </div>
          </Link>

          {/* Manage Banner Advertise */}
          <Link
            to="/dashboard/admin/banner"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaChartLine className="text-2xl text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Manage Banner Advertise
                </h4>
                <p className="text-sm text-blue-600">
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
