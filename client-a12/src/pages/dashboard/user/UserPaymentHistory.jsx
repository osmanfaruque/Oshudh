import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useReTitle } from "re-title";
import axios from "axios";
import  API_CONFIG  from "../../../configs/api.config";

const UserPaymentHistory = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    setTitle("Payment History | User Dashboard");
  }, [setTitle]);

  // Fetch user payment history
  const { data: paymentHistory = [], isLoading } = useQuery({
    queryKey: ["userPaymentHistory", currentUser?.email],
    queryFn: async () => {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/user/payment-history`,
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data.data || [];
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
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600">
          All payment history in tabular form with transaction ID and status
        </p>
      </div>

      {/* Payment History Table - As per PD */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.transactionId || payment.paymentIntentId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ৳{(payment.totalAmount || payment.total || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentHistory.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payment history found
            </h3>
            <p className="text-gray-500">
              Your payment history will appear here once you make purchases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPaymentHistory;
