import React from "react";
import { useReTitle } from "re-title";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaShoppingCart, FaEye, FaPercent } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import API_CONFIG from "../../configs/api.config";
import axios from "axios";

const DiscountsPage = () => {
  const setTitle = useReTitle();
  React.useEffect(() => {
    setTitle("Discount Products | Oshudh");
  }, [setTitle]);

  const { addToCart } = useCart();
  const { data: discountProductsData, isLoading: loading } = useQuery({
    queryKey: ["discount-products"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/medicines/discount-products`);
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch discount products");
        }
        
        return response.data;
      } catch (error) {
        console.error("Error fetching discount products:", error);
        return { data: [] };
      }
    },
    refetchOnWindowFocus: false,
  });

  const discountProducts = discountProductsData?.data || [];

  const handleAddToCart = (product) => {
    const discountedPrice = product.perUnitPrice * (1 - product.discountPercentage / 100);
    
    const cartItem = {
      medicineId: product._id,
      itemName: product.itemName,
      genericName: product.genericName,
      imageUrl: product.imageUrl,
      category: product.category,
      company: product.company,
      massUnit: product.massUnit,
      perUnitPrice: product.perUnitPrice,
      discountPercentage: product.discountPercentage,
      currentPrice: discountedPrice,
      quantity: 1,
      sellerEmail: product.sellerEmail,
    };
    
    addToCart(cartItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg"></div>
              <p className="mt-4 text-body">Loading discount products...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!discountProducts || discountProducts.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="heading-primary mb-4">
                🏷️ Discount Products
              </h1>
              <p className="text-body mb-8">
                No discount products available at the moment
              </p>
              <Link to="/shop" className="medical-btn-primary text-button px-8 py-4 inline-block">
                Browse All Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="heading-primary mb-3 sm:mb-4">
              🏷️ Special Discounts
            </h1>
            <p className="text-body max-w-2xl mx-auto">
              Save more on quality medicines with our exclusive discount offers!
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discountProducts.map((product) => {
              const discountedPrice = product.perUnitPrice * (1 - product.discountPercentage / 100);
              
              return (
                <div key={product._id} className="medical-card hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-badge shadow-lg">
                    {product.discountPercentage}% OFF
                  </div>

                  {/* Image */}
                  <figure className="h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.itemName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Medicine";
                      }}
                    />
                  </figure>

                  {/* Card Body */}
                  <div className="p-4">
                    <h3 className="heading-tertiary mb-2 line-clamp-2">
                      {product.itemName}
                    </h3>
                    <p className="text-small text-gray-500 mb-1">
                      {product.genericName}
                    </p>
                    <p className="text-tiny text-gray-400 mb-3">
                      {product.company} • {product.category}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="heading-tertiary text-green-600">
                          ৳{discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-small line-through text-gray-400">
                          ৳{product.perUnitPrice}
                        </span>
                      </div>
                      <p className="text-tiny text-gray-500">per {product.massUnit || 'unit'}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button 
                        className="medical-btn-primary flex-1 text-small py-2"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaShoppingCart className="inline mr-2" />
                        Add to Cart
                      </button>
                      <Link 
                        to="/shop"
                        className="medical-btn-outline px-4 py-2 flex items-center justify-center"
                      >
                        <FaEye />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiscountsPage;
