import { Link } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import { FaShoppingCart, FaEye, FaPercent } from "react-icons/fa";
import { useCart } from "../../../contexts/CartContext";
import API_CONFIG from "../../../configs/api.config";
import axios from "axios";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const DiscountProducts = () => {
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4">Loading discount products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!discountProducts || discountProducts.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              🏷️ Discount Products
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              No discount products available at the moment
            </p>
            <Link to="/shop" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🏷️ Discount Products
          </h2>
          <p className="text-gray-600 text-lg">
            Save more on quality medicines!
          </p>
        </div>

        {/* Products Display */}
        {discountProducts.length === 1 ? (
          // Single product display
          <div className="flex justify-center mb-12">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-sm w-full">
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 z-10 bg-error text-white px-3 py-1 rounded-full text-sm font-bold">
                {discountProducts[0].discountPercentage}% OFF
              </div>

              {/* Image */}
              <figure className="h-48">
                <img
                  src={discountProducts[0].imageUrl}
                  alt={discountProducts[0].itemName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=200&fit=crop";
                  }}
                />
              </figure>

              {/* Card Body */}
              <div className="card-body p-4">
                <h3 className="card-title text-lg">{discountProducts[0].itemName}</h3>
                <p className="text-sm text-gray-600">{discountProducts[0].genericName}</p>
                <p className="text-xs text-gray-500 mb-3">
                  by {discountProducts[0].company}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ৳{(discountProducts[0].perUnitPrice * (1 - discountProducts[0].discountPercentage / 100)).toFixed(0)}
                    </span>
                    <span className="text-lg line-through text-gray-400">
                      ৳{discountProducts[0].perUnitPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">per {discountProducts[0].massUnit || 'unit'}</p>
                </div>

                {/* Actions */}
                <div className="card-actions">
                  <button 
                    className="btn btn-primary btn-sm flex-1"
                    onClick={() => handleAddToCart(discountProducts[0])}
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                  <Link 
                    to="/shop"
                    className="btn btn-outline btn-sm"
                  >
                    <FaEye />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={discountProducts.length > 1}
            pagination={{ clickable: true }}
            navigation={discountProducts.length > 1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-12"
          >
            {discountProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 mx-auto max-w-sm">
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-error text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discountPercentage}% OFF
                  </div>

                  {/* Image */}
                  <figure className="h-48">
                    <img
                      src={product.imageUrl}
                      alt={product.itemName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=200&fit=crop";
                      }}
                    />
                  </figure>

                  {/* Card Body */}
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg">{product.itemName}</h3>
                    <p className="text-sm text-gray-600">{product.genericName}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      by {product.company}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ৳{(product.perUnitPrice * (1 - product.discountPercentage / 100)).toFixed(0)}
                        </span>
                        <span className="text-lg line-through text-gray-400">
                          ৳{product.perUnitPrice}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">per {product.massUnit || 'unit'}</p>
                    </div>

                    {/* Actions */}
                    <div className="card-actions">
                      <button 
                        className="btn btn-primary btn-sm flex-1"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaShoppingCart className="mr-2" />
                        Add to Cart
                      </button>
                      <Link 
                        to="/shop"
                        className="btn btn-outline btn-sm"
                      >
                        <FaEye />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {/* View All Products Button */}
        <div className="text-center mt-8">
          <Link to="/shop" className="btn btn-primary btn-lg">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DiscountProducts;
