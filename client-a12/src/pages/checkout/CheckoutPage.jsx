import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { useReTitle } from "re-title";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "../../configs/stripe.config";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import API_CONFIG from "../../configs/api.config";
import axios from "axios";
import Swal from "sweetalert2";
import { FaShieldAlt, FaArrowLeft, FaCreditCard, FaLock } from "react-icons/fa";

const CheckoutPage = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");

  React.useEffect(() => {
    setTitle("Checkout | Oshudh");
  }, [setTitle]);

  // Fetch cart items
  const {
    data: cartItems = [],
    isLoading: cartLoading,
    error: cartError,
  } = useQuery({
    queryKey: ["cart", currentUser?.email],
    queryFn: async () => {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
      });
      return response.data.data || [];
    },
    enabled: !!currentUser,
  });

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.perUnitPrice * item.quantity,
    0
  );
  const tax = subtotal * 0.05; // 5% tax
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryCharge;

  // Create payment intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount) => {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/payment/create-intent`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Payment Setup Failed",
        text: error.message,
      });
    },
  });

  // Create payment when total changes
  useEffect(() => {
    if (total > 0 && currentUser) {
      createPaymentIntentMutation.mutate(total);
    }
  }, [total, currentUser]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Empty Cart",
        text: "Your cart is empty. Please add items before checkout.",
        confirmButtonText: "Go to Shop",
      }).then(() => {
        navigate("/shop");
      });
    }
  }, [cartItems, cartLoading, navigate]);

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Cart
          </h2>
          <p className="text-gray-600">{cartError.message}</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#2563eb",
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              💳 Secure Checkout
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaShieldAlt className="mr-2 text-green-600" />
              SSL Encrypted & Secure Payment
            </p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center text-medical-primary hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-3">
                  <img
                    src={item.imageUrl || "https://i.ibb.co/v6LGC7hK/image.png"}
                    alt={item.itemName}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {item.itemName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.company} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      ৳{(item.perUnitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `৳${deliveryCharge}`
                  )}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-green-600">৳{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Delivery Information
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Standard Delivery: 2-3 business days</li>
                <li>• Free delivery on orders over ৳500</li>
                <li>• Cash on delivery available</li>
                <li>• Emergency delivery: Call +880 1234-567890</li>
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <FaCreditCard className="text-2xl text-medical-primary mr-3" />
              <h2 className="text-xl font-bold text-gray-800">
                Payment Details
              </h2>
            </div>

            {/* Security Notice */}
            <div className="flex items-center mb-6 p-3 bg-green-50 rounded-lg">
              <FaLock className="text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Secure Payment
                </p>
                <p className="text-xs text-green-600">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>

            {/* Stripe Payment Form */}
            {clientSecret ? (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  total={total}
                  cartItems={cartItems}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center h-40">
                <div className="loading loading-spinner loading-lg"></div>
                <span className="ml-3">Setting up secure payment...</span>
              </div>
            )}

            {/* Payment Security Info */}
            <div className="mt-6 text-center">
              <div className="flex justify-center items-center space-x-4 mb-3">
                <img
                  src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
                  alt="Mastercard"
                  className="h-6"
                />
                <img
                  src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg"
                  alt="American Express"
                  className="h-6"
                />
              </div>
              <p className="text-xs text-gray-500">
                Powered by Stripe. We don't store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;