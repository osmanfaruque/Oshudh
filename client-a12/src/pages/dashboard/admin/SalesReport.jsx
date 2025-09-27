import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import axios from "axios";
import Swal from "sweetalert2";
import  API_CONFIG  from "../../../configs/api.config";
import {
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaSearch,
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SalesReport = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    setTitle("Sales Report | Admin Dashboard");
  }, [setTitle]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  React.useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setDateFrom(thirtyDaysAgo.toISOString().split("T")[0]);
    setDateTo(today);
  }, [today]);

  // Fetch sales data
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ["admin-sales", dateFrom, dateTo, searchTerm],
    queryFn: async () => {
      const token = await currentUser.getIdToken();
      
      const params = new URLSearchParams();
      if (dateFrom) params.append("startDate", dateFrom);
      if (dateTo) params.append("endDate", dateTo);
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/admin/sales-report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data.data || [];
    },
    enabled: !!currentUser,
  });

  // Filter sales data
  const filteredSales = salesData.filter((sale) => {
    // Handle invalid or missing sale date
    if (!sale.saleDate) return false;
    
    const saleDate = new Date(sale.saleDate);
    if (isNaN(saleDate.getTime())) return false; // Invalid date
    
    const saleDateString = saleDate.toISOString().split("T")[0];
    const withinDateRange =
      (!dateFrom || saleDateString >= dateFrom) && (!dateTo || saleDateString <= dateTo);

    const matchesSearch =
      !searchTerm ||
      (sale.medicineName && sale.medicineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.buyerName && sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.sellerName && sale.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.buyerEmail && sale.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.sellerEmail && sale.sellerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.orderId && sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

    return withinDateRange && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalSales: filteredSales.length,
    totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0),
    paidSales: filteredSales.filter((sale) => sale.paymentStatus === "paid")
      .length,
    pendingSales: filteredSales.filter(
      (sale) => sale.paymentStatus === "pending"
    ).length,
    uniqueCustomers: [...new Set(filteredSales.map((sale) => sale.buyerEmail))]
      .length,
    uniqueSellers: [...new Set(filteredSales.map((sale) => sale.sellerEmail))]
      .length,
  };

  // Prepare data for exports
  const exportData = filteredSales.map((sale) => ({
    "Order ID": sale.orderId || 'N/A',
    "Medicine Name": sale.medicineName || 'N/A',
    "Generic Name": sale.genericName || 'N/A',
    Company: sale.company || 'N/A',
    Category: sale.category || 'N/A',
    Quantity: sale.quantity || 0,
    "Unit Price": `৳${sale.unitPrice || 0}`,
    "Total Price": `৳${sale.totalPrice || 0}`,
    Seller: sale.sellerName || 'N/A',
    "Seller Email": sale.sellerEmail || 'N/A',
    Buyer: sale.buyerName || 'N/A',
    "Buyer Email": sale.buyerEmail || 'N/A',
    "Sale Date": sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'Invalid Date',
    "Payment Status": sale.paymentStatus || 'N/A',
  }));

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [`Oshudh Sales Report - ${dateFrom} to ${dateTo}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Total Sales: ${stats.totalSales} | Revenue: ৳${stats.totalRevenue}`],
      ],
      { origin: "A1" }
    );

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    ws["!cols"] = colWidths;

    const fileName = `sales-report-${dateFrom}-to-${dateTo}.xlsx`;
    XLSX.writeFile(wb, fileName);

    Swal.fire({
      icon: "success",
      title: "Excel Export Complete! 📊",
      text: `Report saved as ${fileName}`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    // Add logo and title
    doc.setFontSize(20);
    doc.text("🏥 Oshudh Sales Report", 14, 20);

    // Add date range
    doc.setFontSize(12);
    doc.text(`Date Range: ${dateFrom} to ${dateTo}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

    // Add statistics
    doc.text(
      `Total Sales: ${stats.totalSales} | Revenue: ৳${stats.totalRevenue} | Paid: ${stats.paidSales} | Pending: ${stats.pendingSales}`,
      14,
      46
    );

    // Prepare table data
    const tableData = filteredSales.map((sale) => [
      sale.orderId || 'N/A',
      sale.medicineName || 'N/A',
      sale.company || 'N/A',
      (sale.quantity || 0).toString(),
      `৳${sale.unitPrice || 0}`,
      `৳${sale.totalPrice || 0}`,
      sale.buyerName || 'N/A',
      sale.sellerName || 'N/A',
      sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'Invalid Date',
      sale.paymentStatus || 'N/A',
    ]);

    // Add table
    doc.autoTable({
      head: [
        [
          "Order ID",
          "Medicine",
          "Company",
          "Qty",
          "Unit Price",
          "Total",
          "Buyer",
          "Seller",
          "Date",
          "Status",
        ],
      ],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 12 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 },
        8: { cellWidth: 20 },
        9: { cellWidth: 15 },
      },
    });

    const fileName = `sales-report-${dateFrom}-to-${dateTo}.pdf`;
    doc.save(fileName);

    Swal.fire({
      icon: "success",
      title: "PDF Export Complete! 📄",
      text: `Report saved as ${fileName}`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Export to Word
  const exportToWord = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Oshudh Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { background: #f5f5f5; padding: 15px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Oshudh Sales Report</h1>
          <p>Date Range: ${dateFrom} to ${dateTo}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
          <h3>Summary Statistics</h3>
          <p>Total Sales: ${stats.totalSales} | Revenue: ৳${
      stats.totalRevenue
    }</p>
          <p>Paid Sales: ${stats.paidSales} | Pending Sales: ${
      stats.pendingSales
    }</p>
          <p>Unique Customers: ${stats.uniqueCustomers} | Unique Sellers: ${
      stats.uniqueSellers
    }</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Medicine Name</th>
              <th>Company</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSales
              .map(
                (sale) => `
              <tr>
                <td>${sale.orderId || 'N/A'}</td>
                <td>${sale.medicineName || 'N/A'}</td>
                <td>${sale.company || 'N/A'}</td>
                <td>${sale.quantity || 0}</td>
                <td>৳${sale.unitPrice || 0}</td>
                <td>৳${sale.totalPrice || 0}</td>
                <td>${sale.buyerName || 'N/A'}</td>
                <td>${sale.sellerName || 'N/A'}</td>
                <td>${sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'Invalid Date'}</td>
                <td>${sale.paymentStatus || 'N/A'}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${dateFrom}-to-${dateTo}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Word Export Complete! 📝",
      text: `Report saved as sales-report-${dateFrom}-to-${dateTo}.doc`,
      timer: 2000,
      showConfirmButton: false,
    });
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
            <FaChartLine className="mr-3 text-medical-primary" />
            Sales Report
          </h1>
          <p className="text-gray-600">
            Analyze sales data and export reports. Total: {filteredSales.length}{" "}
            sales
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSales}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaShoppingCart className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ৳{stats.totalRevenue}
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
              <p className="text-sm text-gray-600">Paid Sales</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.paidSales}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaChartLine className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pendingSales}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaChartLine className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.uniqueCustomers}
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
              <p className="text-sm text-gray-600">Sellers</p>
              <p className="text-2xl font-bold text-indigo-600">
                {stats.uniqueSellers}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50">
              <FaUsers className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                max={today}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                max={today}
                min={dateFrom}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Report
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
              >
                <FaFilePdf className="mr-1" />
                PDF
              </button>

              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
              >
                <FaFileExcel className="mr-1" />
                Excel
              </button>

              <CSVLink
                data={exportData}
                filename={`sales-report-${dateFrom}-to-${dateTo}.csv`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
              >
                <FaFileCsv className="mr-1" />
                CSV
              </CSVLink>

              <button
                onClick={exportToWord}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
              >
                <FaDownload className="mr-1" />
                DOC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Medicine Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity & Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seller
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Buyer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {sale.orderId}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sale.medicineName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.genericName} • {sale.company}
                      </div>
                      <div className="text-xs text-gray-400">
                        {sale.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Qty: {sale.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        ৳{sale.unitPrice} each
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        ৳{sale.totalPrice}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sale.sellerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.sellerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sale.buyerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.buyerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'Invalid Date'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sale.saleDate ? new Date(sale.saleDate).toLocaleTimeString() : 'Invalid Time'}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          sale.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {sale.paymentStatus || 'N/A'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <FaChartLine className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sales found
            </h3>
            <p className="text-gray-500">
              Try adjusting your date range or search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
