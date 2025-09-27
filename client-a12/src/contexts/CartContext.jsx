import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_CONFIG from "../configs/api.config";
import axios from "axios";
import Swal from "sweetalert2";

const CartContextInstance = createContext(null);

export const useCart = () => useContext(CartContextInstance);

const CartContext = ({ children }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cart items with TanStack Query
  const {
    data: cartItems = [],
    isLoading: cartLoading,
    error: cartError,
  } = useQuery({
    queryKey: ["cart", currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];

      const response = await axios.get(`${API_CONFIG.BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
      });
      return response.data.data;
    },
    enabled: !!currentUser,
  });

  // Add to cart 
  const addToCartMutation = useMutation({
    mutationFn: async (medicineData) => {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/cart`,
        medicineData,
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        text: "Medicine added successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Failed to add to cart",
        text: error.message,
      });
    },
  });

  // Update cart item 
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/cart/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  // Remove from cart 
  const removeFromCartMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${API_CONFIG.BASE_URL}/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "Item removed from cart",
        timer: 1500,
        showConfirmButton: false,
      });
    },
  });

  // Clear cart 
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(
        `${API_CONFIG.BASE_URL}/cart/clear`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
      Swal.fire({
        icon: "success",
        title: "Cart Cleared!",
        text: "All items removed from cart",
        timer: 1500,
        showConfirmButton: false,
      });
    },
  });

  // Helper functions
  const addToCart = (medicineData) => {
    if (!currentUser) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add items to cart",
      });
      return;
    }
    addToCartMutation.mutate(medicineData);
  };

  const updateCartItem = (id, quantity) => {
    updateCartMutation.mutate({ id, quantity });
  };

  const removeFromCart = (id) => {
    removeFromCartMutation.mutate(id);
  };

  const clearCart = () => {
    Swal.fire({
      title: "Clear Cart?",
      text: "Are you sure you want to remove all items?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, clear it!",
    }).then((result) => {
      if (result.isConfirmed) {
        clearCartMutation.mutate();
      }
    });
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.currentPrice || item.perUnitPrice || 0;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    cartLoading,
    cartError,
    cartTotal,
    cartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };

  return (
    <CartContextInstance.Provider value={value}>
      {children}
    </CartContextInstance.Provider>
  );
};

export default CartContext;
