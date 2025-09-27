import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaUserCircle } from "react-icons/fa";

const DashboardHeader = ({ userRole }) => {
  const { currentUser } = useAuth();

  const getRoleInfo = () => {
    switch (userRole) {
      case "admin":
        return {
          title: "Admin Dashboard",
          color: "text-red-600",
        };
      case "seller":
        return {
          title: "Seller Dashboard",
          color: "text-green-600",
        };
      case "user":
      default:
        return {
          title: "User Dashboard",
          color: "text-blue-600",
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{roleInfo.title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {currentUser?.displayName || currentUser?.email || "User"}
            </p>
            <p className={`text-xs capitalize font-semibold ${roleInfo.color}`}>
              {userRole || "user"}
            </p>
          </div>
          <div className="relative">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-gray-500 text-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
