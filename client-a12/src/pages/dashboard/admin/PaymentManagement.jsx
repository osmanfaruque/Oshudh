import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import {
  FaCreditCard,
  FaSearch,
  FaFilter,
  FaCheck,
  FaClock,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import  API_CONFIG  from "../../../configs/api.config";

const PaymentManagement = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);

  React.useEffect(() => {
    setTitle("Payment Management | Admin Dashboard");
  }, [setTitle]);

  // Fetch payments
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["admin-payments", searchTerm, statusFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        
        const token = await currentUser.getIdToken();
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/admin/payments?${params.toString()}`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch payments");
        }
        
        return response.data;
      } catch (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
  });
  
  // Extract payments from API response
  const payments = paymentsData?.data || [];

  // Accept payment
  const acceptPaymentMutation = useMutation({
    mutationFn: async (paymentId) => {
      const token = await currentUser.getIdToken();
      const response = await axios.patch(
        `${API_CONFIG.BASE_URL}/admin/payments/${paymentId}/status`,
        { status: "paid" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-payments"]);
      Swal.fire({
        icon: "success",
        title: "Payment Accepted!",
        text: "Payment status has been updated to paid.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Accept Failed",
        text: error.message,
      });
    },
  });

  // Handle accept payment
  const handleAcceptPayment = (payment) => {
    Swal.fire({
      title: "Accept Payment?",
      text: `Confirm payment of ৳${payment.totalAmount} for order ${payment.orderId}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, accept payment!",
    }).then((result) => {
      if (result.isConfirmed) {
        acceptPaymentMutation.mutate(payment._id);
      }
    });
  };

  // View payment details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    document.getElementById("payment_details_modal").showModal();
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (payment.orderId && payment.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.buyerName && payment.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.buyerEmail && payment.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.userEmail && payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.sellerEmail && payment.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    paid: payments.filter((p) => p.status === "paid").length,
    totalRevenue: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.totalAmount || p.total || 0), 0),
    pendingAmount: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + (p.totalAmount || p.total || 0), 0),
  };

  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === "paid"
            ? "bg-green-100 text-green-800"
            : "bg-orange-100 text-orange-800"
        }`}
      >
        {status === "paid" ? (
          <FaCheckCircle className="mr-1" />
        ) : (
          <FaClock className="mr-1" />
        )}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaCreditCard className="mr-3 text-medical-primary" />
            Payment Management
          </h1>
          <p className="text-gray-600">
            Manage and process customer payments. Total: {payments.length}{" "}
            payments
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaCreditCard className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ৳{stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaDollarSign className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600">
                ৳{stats.pendingAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaExclamationTriangle className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>

          {/* Results Count */}
          <div className="text-sm text-gray-600 flex items-center">
            <FaFilter className="mr-2" />
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment._id || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.transactionId || payment.paymentIntentId || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {payment.items?.length || 0} item(s)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.userName || payment.buyerName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.userEmail || payment.buyerEmail || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.sellerName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.sellerEmail || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      ৳{payment.totalAmount || payment.total || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      via {payment.paymentMethod || 'stripe'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs">
                      {new Date(payment.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {payment.status === "pending" && (
                        <button
                          onClick={() => handleAcceptPayment(payment)}
                          disabled={acceptPaymentMutation.isLoading}
                          className="medical-btn-secondary px-3 py-1 text-xs disabled:opacity-50"
                        >
                          <FaCheck className="mr-1" />
                          Accept
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <FaCreditCard className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <dialog id="payment_details_modal" className="modal">
        <div className="modal-box max-w-4xl">
          {selectedPayment && (
            <>
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>

              <h3 className="font-bold text-xl mb-6 text-medical-primary">
                Payment Details - {selectedPayment.orderId}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Order ID:</strong> {selectedPayment.orderId}
                    </p>
                    <p>
                      <strong>Transaction ID:</strong>{" "}
                      {selectedPayment.transactionId}
                    </p>
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {selectedPayment.paymentMethod}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {getStatusBadge(selectedPayment.status)}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                    {selectedPayment.paidAt && (
                      <p>
                        <strong>Paid Date:</strong>{" "}
                        {new Date(selectedPayment.paidAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer & Seller Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Parties</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p>
                        <strong>Customer:</strong> {selectedPayment.buyerName}
                      </p>
                      <p className="text-gray-600">
                        {selectedPayment.buyerEmail}
                      </p>
                    </div>
                    <div className="mt-3">
                      <p>
                        <strong>Seller:</strong> {selectedPayment.sellerName}
                      </p>
                      <p className="text-gray-600">
                        {selectedPayment.sellerEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medicine Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Order Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Medicine
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Company
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center">
                          Qty
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right">
                          Unit Price
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPayment.medicines.map((medicine, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            {medicine.itemName}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {medicine.company}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {medicine.quantity}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            ৳{medicine.unitPrice}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                            ৳{medicine.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{selectedPayment.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>৳{selectedPayment.tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span>
                      {selectedPayment.deliveryCharge === 0
                        ? "FREE"
                        : `৳${selectedPayment.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">
                        ৳{selectedPayment.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedPayment.status === "pending" && (
                <div className="modal-action">
                  <button
                    onClick={() => {
                      document.getElementById("payment_details_modal").close();
                      handleAcceptPayment(selectedPayment);
                    }}
                    className="medical-btn-primary"
                    disabled={acceptPaymentMutation.isLoading}
                  >
                    <FaCheck className="mr-2" />
                    Accept Payment
                  </button>
                  <form method="dialog">
                    <button className="btn">Close</button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default PaymentManagement;
