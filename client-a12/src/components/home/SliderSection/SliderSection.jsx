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
      },
      {
        id: "default-2",
        medicineImage:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop&q=80",
        medicineName: "24/7 Medical Support",
        description:
          "Round-the-clock healthcare assistance when you need it most.",
        sellerEmail: "support@oshudh.com",
      },
      {
        id: "default-3",
        medicineImage:
          "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1920&h=1080&fit=crop&q=80",
        medicineName: "Fast & Reliable Delivery",
        description:
          "Get your medicines delivered quickly and safely to your doorstep.",
        sellerEmail: "support@oshudh.com",
      },
    ];

    return (
      <section className="relative w-full">
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
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="w-full aspect-[16/9] md:aspect-[21/9] custom-slider"
        >
          {fallbackSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full overflow-hidden">
                {/* High-quality image with consistent aspect ratio */}
                <img
                  src={slide.medicineImage}
                  alt={slide.medicineName}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                      {slide.medicineName}
                    </h2>
                    <p className="text-lg md:text-xl mb-6 drop-shadow-md">
                      {slide.description}
                    </p>
                    <button className="medical-btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl">
                      Shop Now
                    </button>
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
    <section className="relative w-full">
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
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={slides.length > 1}
        className="w-full aspect-[16/9] md:aspect-[21/9] custom-slider"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative w-full h-full overflow-hidden">
              {/* High-quality image with consistent aspect ratio */}
              <img
                src={slide.medicineImage}
                alt={slide.medicineName}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                    {slide.medicineName}
                  </h2>
                  <p className="text-lg md:text-xl mb-6 drop-shadow-md">{slide.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="text-sm opacity-90 drop-shadow-md bg-black/20 px-4 py-2 rounded-full">
                      By {slide.sellerName || 'Seller'}
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
