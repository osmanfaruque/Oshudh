import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import API_CONFIG from "../../../configs/api.config";
import {
  FaHistory,
  FaUser,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaBox,
  FaClock,
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
import { Line, Bar } from "react-chartjs-2";

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

const UserDashboard = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    setTitle("User Dashboard | Oshudh");
  }, [setTitle]);

  // Fetch user orders for statistics
  const { data: payments = [] } = useQuery({
    queryKey: ["userOrders", currentUser?.email],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/orders?userEmail=${currentUser.email}`,
        { headers: API_CONFIG.HEADERS }
      );
      return data || [];
    },
    enabled: !!currentUser?.email,
  });

  // Calculate stats from actual data
  const userStats = {
    totalOrders: payments.length,
    totalSpent: payments.reduce((sum, p) => sum + (p.total || 0), 0),
    pendingOrders: payments.filter((p) => p.status === "pending").length,
    completedOrders: payments.filter((p) => p.status === "paid").length,
  };

  // Prepare chart data - Last 7 days order activity
  const getLast7DaysData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }

    const orderCounts = last7Days.map((day) => {
      return payments.filter((payment) => {
        const paymentDate = new Date(payment.createdAt).toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        });
        return paymentDate === day;
      }).length;
    });

    return { labels: last7Days, data: orderCounts };
  };

  const chartData = getLast7DaysData();

  const orderActivityData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Orders",
        data: chartData.data,
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
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
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {currentUser?.displayName || currentUser?.email}! 👋
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {userStats.totalOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaShoppingCart className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-green-600">
                ৳{userStats.totalSpent.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Lifetime</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaMoneyBillWave className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-orange-600">
                {userStats.pendingOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-purple-600">
                {userStats.completedOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">Successful orders</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <FaBox className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Activity Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          Order Activity - Last 7 Days
        </h3>
        <div className="h-64">
          <Line data={orderActivityData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* View Profile */}
          <Link
            to="/dashboard/user/profile"
            className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaUser className="text-3xl text-blue-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xl font-semibold text-blue-800">
                  My Profile
                </h4>
                <p className="text-blue-600">View and edit your profile</p>
              </div>
            </div>
          </Link>

          {/* Payment History */}
          <Link
            to="/dashboard/user/payments"
            className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaHistory className="text-3xl text-blue-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xl font-semibold text-blue-800">
                  Payment History
                </h4>
                <p className="text-blue-600">View all transactions</p>
              </div>
            </div>
          </Link>

          {/* Shop Now */}
          <Link
            to="/shop"
            className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center">
              <FaShoppingCart className="text-3xl text-blue-600 mr-4 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-xl font-semibold text-blue-800">
                  Shop Medicines
                </h4>
                <p className="text-blue-600">Browse our products</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaClock className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No recent activity</p>
          <p className="text-sm text-gray-500 mt-2">
            Start shopping to see your activity here
          </p>
          <Link to="/shop" className="medical-btn-primary mt-4 inline-flex items-center gap-2">
            <FaShoppingCart />
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
