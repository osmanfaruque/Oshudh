import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";
import { useAuth } from "../../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSpinner, FaCreditCard } from "react-icons/fa";
import API_CONFIG from "../../configs/api.config";

const CheckoutForm = ({ clientSecret, total, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const saveOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/payment/save-order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      navigate("/invoice", {
        state: {
          orderId: data.orderId,
          orderData: {
            items: cartItems,
            total,
            userEmail: currentUser.email,
            userName: currentUser.displayName,
            timestamp: new Date().toISOString(),
          },
        },
      });
    },
    onError: (error) => {
      console.error("Order save error:", error);
      Swal.fire({
        icon: "error",
        title: "Order Save Failed",
        text: "Payment successful but order save failed. Please contact support.",
      });
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message);
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/invoice`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment successful, save order
      const orderData = {
        transactionId: paymentIntent.id,
        paymentIntentId: paymentIntent.id,
        items: cartItems,
        subtotal: cartItems.reduce(
          (sum, item) => sum + item.perUnitPrice * item.quantity,
          0
        ),
        tax:
          cartItems.reduce(
            (sum, item) => sum + item.perUnitPrice * item.quantity,
            0
          ) * 0.05,
        deliveryCharge: total > 500 ? 0 : 50,
        totalAmount: total,
        total,
        status: "paid",
        paymentMethod: "stripe",
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
      };

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Payment Successful!",
        text: "Your order has been placed successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Save order
      saveOrderMutation.mutate(orderData);
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  const addressElementOptions = {
    mode: "shipping",
    allowedCountries: ["BD"],
    defaultValues: {
      name: currentUser?.displayName || "",
      address: {
        country: "BD",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={currentUser?.displayName || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              defaultValue={currentUser?.email || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            placeholder="+880 1XXXXXXXXX"
            required
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Shipping Address
        </h3>
        <AddressElement options={addressElementOptions} />
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Payment Method
        </h3>
        <PaymentElement options={paymentElementOptions} />
      </div>

      {/* Error Message */}
      {message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={isLoading || !stripe || !elements}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium text-lg transition-colors ${
          isLoading || !stripe || !elements
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-medical-primary text-white hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <FaCreditCard className="mr-2" />
            Pay ৳{total.toFixed(2)}
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By completing your purchase, you agree to our{" "}
        <a href="#" className="text-medical-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-medical-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
};

export default CheckoutForm;
