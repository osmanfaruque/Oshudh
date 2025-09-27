import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import axios from 'axios';
import  API_CONFIG  from '../../../configs/api.config';
import { FaUser, FaPills, FaEye, FaHistory, FaSearch, FaFilter, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaClock, FaDollarSign } from 'react-icons/fa';

const PaymentHistory = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    setTitle('Payment History | Seller Dashboard');
  }, [setTitle]);

  // Helper function to get date range based on filter
  const getDateRange = (filter) => {
    const today = new Date();
    switch (filter) {
      case 'today':
        return {
          start: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
          end: new Date(today.setHours(23, 59, 59, 999)).toISOString()
        };
      case 'week':
        const weekStart = new Date(today.setDate(today.getDate() - 7));
        return {
          start: new Date(weekStart.setHours(0, 0, 0, 0)).toISOString(),
          end: new Date().toISOString()
        };
      case 'month':
        const monthStart = new Date(today.setDate(today.getDate() - 30));
        return {
          start: new Date(monthStart.setHours(0, 0, 0, 0)).toISOString(),
          end: new Date().toISOString()
        };
      default:
        return undefined;
    }
  };

  // Fetch payment history data
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['sellerPaymentHistory', currentPage, searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      const params = {
        page: currentPage,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        dateRange: getDateRange(dateFilter)
      };
      
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/seller/payment-history`, { 
        params,
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`
        }
      });
      return data;
    },
    keepPreviousData: true,
    enabled: !!currentUser
  });

  const payments = response?.payments || [];
  const pagination = response?.pagination || { total: 0, pages: 0, currentPage: 1 };
  const stats = response?.stats || {
    total: 0,
    paid: 0,
    pending: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    totalCommission: 0
  };

  // View payment details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    document.getElementById('payment_details_modal').showModal();
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

  const getDeliveryStatusBadge = (status) => {
    const colors = {
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
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
            <FaHistory className="mr-3 text-medical-primary" />
            Payment History
          </h1>
          <p className="text-gray-600">
            Track all payments for your medicines. Total: {payments.length}{" "}
            transactions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaHistory className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Orders</p>
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
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                ৳{stats.totalEarnings.toFixed(2)}
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
              <p className="text-sm text-gray-600">Pending Earnings</p>
              <p className="text-2xl font-bold text-orange-600">
                ৳{stats.pendingEarnings.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaDollarSign className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Platform Fee</p>
              <p className="text-2xl font-bold text-purple-600">
                ৳{stats.totalCommission.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <FaDollarSign className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary appearance-none"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-gray-600">
            Showing {payments.length} of {pagination.total} orders
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p>Failed to load payment history. Please try again later.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && payments.length === 0 && (
        <div className="text-center py-12">
          <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No payment history found
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Your payment history will appear here once customers purchase your medicines."}
          </p>
        </div>
      )}

      {/* Payments Table */}
      {!isLoading && !error && payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mt-6 overflow-x-auto">
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
                  Medicines
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Earnings
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
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.orderId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.transactionId}
                      </div>
                      <div className="text-xs text-gray-400">
                        via {payment.paymentMethod}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.buyerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.buyerEmail}
                        </div>
                        <div className="text-xs text-gray-400">
                          {payment.buyerPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaPills className="text-medical-primary mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.medicines.length} item(s)
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.medicines[0]?.itemName}
                          {payment.medicines.length > 1 &&
                            ` +${payment.medicines.length - 1} more`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Total: ৳{payment.totalAmount}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-green-600">
                        ৳{payment.sellerEarning.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Fee: ৳{payment.commission.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(
                          (payment.commission / payment.totalAmount) *
                          100
                        ).toFixed(1)}
                        % fee
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(payment.status)}
                      {getDeliveryStatusBadge(payment.deliveryStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      <div>
                        <div>
                          {new Date(payment.orderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(payment.orderDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetails(payment)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2 p-6 border-t border-gray-200">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${page === pagination.currentPage
                    ? 'bg-medical-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
                      <strong>Payment Status:</strong>{" "}
                      {getStatusBadge(selectedPayment.status)}
                    </p>
                    <p>
                      <strong>Delivery Status:</strong>{" "}
                      {getDeliveryStatusBadge(selectedPayment.deliveryStatus)}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(selectedPayment.orderDate).toLocaleString()}
                    </p>
                    {selectedPayment.paidDate && (
                      <p>
                        <strong>Paid Date:</strong>{" "}
                        {new Date(selectedPayment.paidDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedPayment.buyerName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedPayment.buyerEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedPayment.buyerPhone}
                    </p>
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
                          Generic Name
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
                            {medicine.genericName}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Payment */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Customer Payment
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
                        <span>Total Paid:</span>
                        <span className="text-blue-600">
                          ৳{selectedPayment.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Earning */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Your Earnings
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Medicine Sales:</span>
                      <span>৳{selectedPayment.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Platform Fee:</span>
                      <span>-৳{selectedPayment.commission}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Your Earning:</span>
                        <span className="text-green-600">
                          ৳{selectedPayment.sellerEarning}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Fee Rate:{" "}
                      {(
                        (selectedPayment.commission /
                          selectedPayment.totalAmount) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default PaymentHistory;