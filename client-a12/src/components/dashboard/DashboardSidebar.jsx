import React from "react";
import { Link, useLocation } from "react-router";
import {
  FaTachometerAlt,
  FaUsers,
  FaPills,
  FaShoppingCart,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaHistory,
  FaBullhorn,
  FaHome,
  FaList,
  FaCreditCard,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

const DashboardSidebar = ({ userRole }) => {
  const location = useLocation();
  const { logout, currentUser } = useAuth();


  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear cached role
        localStorage.removeItem(`userRole_${currentUser?.email}`);
        logout();
        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getMenuItems = () => {

    switch (userRole) {
      case "admin":
        return [
          {
            path: "/dashboard/admin",
            icon: FaTachometerAlt,
            label: "Dashboard",
          },
          {
            path: "/dashboard/admin/profile",
            icon: FaUser,
            label: "My Profile",
          },
          {
            path: "/dashboard/admin/users",
            icon: FaUsers,
            label: "Manage Users",
          },
          {
            path: "/dashboard/admin/categories",
            icon: FaList,
            label: "Manage Categories",
          },
          {
            path: "/dashboard/admin/payments",
            icon: FaCreditCard,
            label: "Payment Management",
          },
          {
            path: "/dashboard/admin/sales-report",
            icon: FaChartBar,
            label: "Sales Report",
          },
          {
            path: "/dashboard/admin/banner",
            icon: FaBullhorn,
            label: "Manage Banner",
          },
        ];
      case "seller":
        return [
          {
            path: "/dashboard/seller",
            icon: FaTachometerAlt,
            label: "Dashboard",
          },
          {
            path: "/dashboard/seller/profile",
            icon: FaUser,
            label: "My Profile",
          },
          {
            path: "/dashboard/seller/medicines",
            icon: FaPills,
            label: "Manage Medicines",
          },
          {
            path: "/dashboard/seller/payments",
            icon: FaShoppingCart,
            label: "Payment History",
          },
          {
            path: "/dashboard/seller/advertise",
            icon: FaBullhorn,
            label: "Ask for Advertisement",
          },
        ];
      case "user":
      default:
        return [
          {
            path: "/dashboard/user",
            icon: FaTachometerAlt,
            label: "Dashboard",
          },
          {
            path: "/dashboard/user/profile",
            icon: FaUser,
            label: "My Profile",
          },
          {
            path: "/dashboard/user/payments",
            icon: FaHistory,
            label: "Payment History",
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getRoleDisplay = () => {
    switch (userRole) {
      case "admin":
        return { emoji: "👑", label: "Admin", color: "text-red-600" };
      case "seller":
        return { emoji: "🏪", label: "Seller", color: "text-green-600" };
      case "user":
      default:
        return { emoji: "👤", label: "User", color: "text-blue-600" };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center group">
          <img src="/icon.png" alt="Oshudh" className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold text-medical-primary group-hover:text-blue-700 transition-colors">
            Oshudh
          </span>
        </Link>
        <p className={`text-sm mt-1 font-semibold ${roleDisplay.color}`}>
          {roleDisplay.emoji} {roleDisplay.label} Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        <div className="px-4 mb-4">
          <Link
            to="/"
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <FaHome className="mr-3" />
            Back to Home
          </Link>
        </div>

        <div className="px-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Dashboard Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-medical-primary text-white shadow-lg bg-black"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon className={`mr-3 ${active ? "text-white" : ""}`} />
                {item.label}
                {active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t bg-gray-50">
        <div className="mb-3 text-center">
          <div className="text-sm font-medium text-gray-700">
            {currentUser?.displayName || currentUser?.email || "User"}
          </div>
          <div className={`text-xs font-semibold ${roleDisplay.color}`}>
            {roleDisplay.emoji} {roleDisplay.label}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
