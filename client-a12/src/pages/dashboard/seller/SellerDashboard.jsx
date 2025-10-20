import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import {
  FaPills,
  FaShoppingCart,
  FaBullhorn,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import  API_CONFIG  from "../../../configs/api.config";

const SellerDashboard = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    setTitle("Seller Dashboard | Oshudh");
  }, [setTitle]);

  // Fetch seller dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["seller-dashboard", currentUser?.email],
    queryFn: async () => {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/seller/dashboard`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
      });
      return response.data.data;
    },
    enabled: !!currentUser,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Seller Homepage</h1>
        <p className="text-gray-600">Total sales revenue of your medicines</p>
      </div>

      {/* Stats Cards - PD Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid Total</p>
              <p className="text-3xl font-bold text-green-600">
                ৳{stats?.paidTotal?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Total</p>
              <p className="text-3xl font-bold text-orange-600">
                ৳{stats?.pendingTotal?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Seller Features as mentioned in PD */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Seller Dashboard Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/seller/medicines"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <FaPills className="text-2xl text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Manage Medicines
                </h4>
                <p className="text-sm text-blue-600">
                  Add, edit your medicine inventory
                </p>
              </div>
            </div>
          </a>

          <a
            href="/dashboard/seller/payments"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <FaShoppingCart className="text-2xl text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Payment History
                </h4>
                <p className="text-sm text-blue-600">
                  View purchase history with status
                </p>
              </div>
            </div>
          </a>

          <a
            href="/dashboard/seller/advertise"
            className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <FaBullhorn className="text-2xl text-blue-600 mr-3" />
              <div>
                <h4 className="font-semibold text-blue-800">
                  Ask For Advertisement
                </h4>
                <p className="text-sm text-blue-600">
                  Request slider advertisements
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
