import React from "react";
import { Link } from "react-router";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useReTitle } from "re-title";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";

const CartPage = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const {
    cartItems,
    cartLoading,
    cartTotal,
    cartCount,
    updateCartItem,
    removeFromCart,
    clearCart,
    isUpdatingCart,
    isRemovingFromCart,
    isClearingCart,
  } = useCart();

  React.useEffect(() => {
    setTitle("Cart | Oshudh");
  }, [setTitle]);

  // If not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please login to view your cart items
              </p>
              <Link to="/login" className="medical-btn-primary">
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-medical-primary"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some medicines to your cart to continue shopping
              </p>
              <Link to="/shop" className="medical-btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle quantity change
  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(item._id, newQuantity);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/shop"
              className="text-medical-primary hover:underline flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Continue Shopping
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            🛒 Your Cart ({cartCount} items)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Clear Cart Button */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Cart Items</h2>
                  <button
                    onClick={clearCart}
                    disabled={isClearingCart}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center disabled:opacity-50"
                  >
                    <FaTrash className="mr-1" />
                    {isClearingCart ? "Clearing..." : "Clear All"}
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Medicine Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.imageUrl ||
                            "https://i.ibb.co/v6LGC7hK/image.png"
                          }
                          alt={item.itemName}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "https://i.ibb.co/v6LGC7hK/image.png";
                          }}
                        />
                      </div>

                      {/* Medicine Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.itemName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.genericName}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {item.company}
                        </p>

                        {/* Price */}
                        <div className="mt-2">
                          {item.discountPercentage > 0 ? (
                            <div>
                              <span className="text-lg font-bold text-green-600">
                                ৳{item.currentPrice || (item.perUnitPrice * (1 - item.discountPercentage / 100)).toFixed(0)}
                              </span>
                              <span className="text-sm line-through text-gray-400 ml-2">
                                ৳{item.perUnitPrice}
                              </span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
                                {item.discountPercentage}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-green-600">
                              ৳{item.currentPrice || item.perUnitPrice}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 ml-1 block">
                            per {item.massUnit || 'unit'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1 || isUpdatingCart}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[50px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                            disabled={isUpdatingCart}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item._id)}
                          disabled={isRemovingFromCart}
                          className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Subtotal ({item.quantity} items):
                        </span>
                        <span className="font-semibold text-gray-800">
                          ৳
                          {(
                            (item.currentPrice || item.perUnitPrice) *
                            item.quantity
                          ).toFixed(0)}
                        </span>
                      </div>
                      {item.discountPercentage > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600 mt-1">
                          <span>You saved:</span>
                          <span>
                            ৳{((item.perUnitPrice - (item.currentPrice || item.perUnitPrice)) * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Items ({cartCount}):</span>
                  <span>৳{cartTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ৳{cartTotal.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full medical-btn-primary text-center block py-3 text-lg"
              >
                Proceed to Checkout
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/shop"
                className="w-full medical-btn-secondary text-center block py-2 mt-3"
              >
                Continue Shopping
              </Link>

              {/* Delivery Info */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🚚 Delivery Info
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Free delivery on all orders</li>
                  <li>• Delivered within 24 hours</li>
                  <li>• Cash on delivery available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
