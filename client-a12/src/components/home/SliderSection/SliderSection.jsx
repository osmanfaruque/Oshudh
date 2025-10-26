import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import API_CONFIG from "../../../configs/api.config";
import axios from "axios";
import "swiper/css";
import "swiper/css/pagination";
import "./SliderSection.css";

const SliderSection = () => {
  const { data: slidesData, isLoading } = useQuery({
    queryKey: ["active-advertisements"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/advertisements/active`);
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch active advertisements");
        }
        
        return response.data;
      } catch (error) {
        console.error("Error fetching active advertisements:", error);
        return { data: [] };
      }
    },
    refetchOnWindowFocus: false,
  });
  
  const slides = slidesData?.data || [];

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading hero slider...</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    const fallbackSlides = [
      {
        id: "default-1",
        medicineImage:
          "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1920&h=1080&fit=crop&q=80",
        medicineName: "Quality Healthcare Products",
        description:
          "Trusted medicines delivered to your door. Your health is our priority.",
        sellerEmail: "info@oshudh.com",
        badge: "Verified Quality"
      },
      {
        id: "default-2",
        medicineImage:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop&q=80",
        medicineName: "24/7 Medical Support",
        description:
          "Round-the-clock healthcare assistance when you need it most.",
        sellerEmail: "support@oshudh.com",
        badge: "Always Available"
      },
      {
        id: "default-3",
        medicineImage:
          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1920&h=1080&fit=crop&q=80",
        medicineName: "Fast & Reliable Delivery",
        description:
          "Get your medicines delivered quickly and safely to your doorstep.",
        sellerEmail: "support@oshudh.com",
        badge: "Quick Delivery"
      },
    ];

    return (
      <section className="relative w-full hero-section">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{
            clickable: true,
            type: 'bullets',
            renderBullet: function (index, className) {
              return '<span class="' + className + ' custom-pagination-bullet">' + (index + 1) + '</span>';
            },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="w-full custom-slider"
        >
          {fallbackSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full overflow-hidden hero-slide">
                {/* High-quality image with overlay */}
                <img
                  src={slide.medicineImage}
                  alt={slide.medicineName}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                
                {/* Hero Content */}
                <div className="absolute inset-0 flex items-end sm:items-center pb-20 sm:pb-0">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-full sm:max-w-2xl lg:max-w-3xl">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        {slide.badge}
                      </div>
                      
                      {/* Main Heading */}
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-2 sm:mb-4 md:mb-6 leading-tight drop-shadow-2xl">
                        {slide.medicineName}
                      </h1>
                      
                      {/* Description */}
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-4 sm:mb-6 md:mb-8 drop-shadow-xl leading-snug">
                        {slide.description}
                      </p>
                      
                      {/* CTA Button - Single on mobile */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <a 
                          href="/shop" 
                          className="medical-btn-primary text-base sm:text-lg px-8 py-3.5 sm:py-4 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                        >
                          🛒 Shop Now
                        </a>
                        <a 
                          href="#categories" 
                          className="hidden sm:inline-block medical-btn-secondary text-lg px-8 py-4 shadow-xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                        >
                          Browse Categories
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  }

  return (
    <section className="relative w-full hero-section">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{
          clickable: true,
          type: 'bullets',
          renderBullet: function (index, className) {
            return '<span class="' + className + ' custom-pagination-bullet">' + (index + 1) + '</span>';
          },
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={slides.length > 1}
        className="w-full custom-slider"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative w-full h-full overflow-hidden hero-slide">
              {/* High-quality image with overlay */}
              <img
                src={slide.medicineImage}
                alt={slide.medicineName}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
              
              {/* Hero Content */}
              <div className="absolute inset-0 flex items-end sm:items-center pb-20 sm:pb-0">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-full sm:max-w-2xl lg:max-w-3xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Featured Medicine
                    </div>
                    
                    {/* Main Heading */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-2 sm:mb-4 md:mb-6 leading-tight drop-shadow-2xl">
                      {slide.medicineName}
                    </h1>
                    
                    {/* Description */}
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-4 sm:mb-6 md:mb-8 drop-shadow-xl leading-snug">
                      {slide.description}
                    </p>
                    
                    {/* CTA Button - Single on mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <a 
                        href="/shop" 
                        className="medical-btn-primary text-base sm:text-lg px-8 py-3.5 sm:py-4 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 text-center font-semibold"
                      >
                        🛒 Shop Now
                      </a>
                    </div>
                    
                    {/* Seller Info - Hidden on mobile */}
                    <div className="hidden sm:block mt-6 md:mt-8">
                      <p className="text-sm md:text-base text-gray-200 drop-shadow-md">
                        By <span className="font-semibold text-white">{slide.sellerName || slide.sellerEmail}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default SliderSection;
