import React, { useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useReTitle } from "re-title";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";
import {
  FaDownload,
  FaPrint,
  FaCheckCircle,
  FaHome,
  FaShoppingBag,
} from "react-icons/fa";

const InvoicePage = () => {
  const setTitle = useReTitle();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const invoiceRef = useRef();

  React.useEffect(() => {
    setTitle("Invoice | Oshudh");
  }, [setTitle]);

  // Get order data from checkout page
  const orderData = location.state?.orderData;
  const orderId = location.state?.orderId;

  // Redirect if no order data
  React.useEffect(() => {
    if (!orderData || !orderId) {
      Swal.fire({
        icon: "warning",
        title: "No Order Found",
        text: "Please complete your purchase first.",
        confirmButtonText: "Go to Shop",
      }).then(() => {
        navigate("/shop");
      });
    }
  }, [orderData, orderId, navigate]);

  if (!orderData || !orderId) {
    return null;
  }

  // Generate invoice number
  const invoiceNumber = `INV-${new Date().getFullYear()}-${orderId
    .toString()
    .slice(-6)
    .toUpperCase()}`;

  // Calculate totals
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + item.perUnitPrice * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryCharge;

  // Download PDF function
  const downloadPDF = async () => {
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoiceNumber}.pdf`);

      Swal.fire({
        icon: "success",
        title: "Downloaded!",
        text: "Invoice downloaded successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Failed to generate PDF. Please try again.",
      });
    }
  };

  // Print function
  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-3xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600">
            Your order has been placed successfully. Here's your invoice.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center medical-btn-primary px-6 py-3"
          >
            <FaDownload className="mr-2" />
            Download PDF
          </button>
          <button
            onClick={printInvoice}
            className="flex items-center justify-center medical-btn-outline px-6 py-3"
          >
            <FaPrint className="mr-2" />
            Print Invoice
          </button>
          <Link
            to="/shop"
            className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FaShoppingBag className="mr-2" />
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center medical-btn-primary px-6 py-3"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
        </div>

        {/* Invoice */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={invoiceRef}
            className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none"
          >
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-medical-primary to-blue-600 text-white p-8">
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="flex items-center mb-4 md:mb-0">
                  <img
                    src="/icon.png"
                    alt="Oshudh"
                    className="h-12 w-12 mr-4"
                  />
                  <div>
                    <h2 className="text-3xl font-bold">Oshudh</h2>
                    <p className="text-blue-100">Health at Door</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold mb-2">INVOICE</h3>
                  <p className="text-blue-100">#{invoiceNumber}</p>
                  <p className="text-blue-100">
                    Date: {new Date(orderData.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Company & Customer Info */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Company Info */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    From:
                  </h4>
                  <div className="text-gray-600">
                    <p className="font-semibold">Oshudh Limited</p>
                    <p>123 Health Street</p>
                    <p>Medical City, Dhaka 1000</p>
                    <p>Bangladesh</p>
                    <p className="mt-2">
                      <strong>Phone:</strong> +880 1234-567890
                    </p>
                    <p>
                      <strong>Email:</strong> info@oshudh.com
                    </p>
                    <p>
                      <strong>Website:</strong> www.oshudh.com
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    Bill To:
                  </h4>
                  <div className="text-gray-600">
                    <p className="font-semibold">
                      {orderData.userName || currentUser?.displayName}
                    </p>
                    <p>
                      <strong>Email:</strong> {orderData.userEmail}
                    </p>
                    <p>
                      <strong>Order ID:</strong> {orderId}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> Credit Card (Stripe)
                    </p>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      <span className="text-green-600 font-semibold">PAID</span>
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(orderData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Order Details:
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-left">
                          Item
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-left">
                          Company
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-center">
                          Quantity
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-right">
                          Unit Price
                        </th>
                        <th className="border border-gray-300 px-4 py-3 text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-sm text-gray-600">
                                {item.genericName}
                              </p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {item.company}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right">
                            ৳{item.perUnitPrice.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                            ৳{(item.perUnitPrice * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Payment Summary:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>৳{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (5%):</span>
                        <span>৳{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span>
                          {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total Paid:</span>
                          <span className="text-green-600">
                            ৳{total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Notes */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-gray-800 mb-2">
                      Important Notes:
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Keep this invoice for your records</li>
                      <li>• Delivery within 2-3 business days</li>
                      <li>• Check expiry dates upon delivery</li>
                      <li>• Contact us for any medicine-related queries</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 mb-2">
                      Customer Support:
                    </h5>
                    <div className="text-sm text-gray-600">
                      <p>📞 Hotline: +880 1234-567890</p>
                      <p>📧 Email: support@oshudh.com</p>
                      <p>🕒 Available: 24/7</p>
                      <p>💬 Live Chat: www.oshudh.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thank You Message */}
              <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
                <h4 className="text-xl font-bold text-blue-800 mb-2">
                  Thank You for Choosing Oshudh!
                </h4>
                <p className="text-blue-600">
                  Your health is our priority. We appreciate your trust in our
                  service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:shadow-none,
            .print\\:shadow-none * {
              visibility: visible;
            }
            .print\\:shadow-none {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              margin: 0.5in;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoicePage;
