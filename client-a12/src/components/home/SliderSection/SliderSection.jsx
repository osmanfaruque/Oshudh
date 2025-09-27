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
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    const fallbackSlides = [
      {
        id: "default-1",
        medicineImage:
          "https://i.ibb.co/v6LGC7hK/image.png",
        medicineName: "Quality Healthcare Products",
        description:
          "Trusted medicines delivered to your door. Your health is our priority.",
        sellerEmail: "info@oshudh.com",
      },
      {
        id: "default-2",
        medicineImage:
          "https://i.ibb.co/ZzSDFzJM/image.png",
        medicineName: "24/7 Medical Support",
        description:
          "Round-the-clock healthcare assistance when you need it most.",
        sellerEmail: "support@oshudh.com",
      },
    ];

    return (
      <section className="relative">
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
          className="h-96 md:h-[500px] custom-slider"
        >
          {fallbackSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className="relative h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.medicineImage})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                      {slide.medicineName}
                    </h2>
                    <p className="text-lg md:text-xl mb-6">
                      {slide.description}
                    </p>
                    <button className="medical-btn-primary text-lg px-8 py-3">
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
    <section className="relative">
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
        className="h-96 md:h-[500px] custom-slider"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative h-full overflow-hidden">
              {/* Background Image */}
              <img
                src={slide.medicineImage}
                alt={slide.medicineName}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    {slide.medicineName}
                  </h2>
                  <p className="text-lg md:text-xl mb-6">{slide.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="text-sm opacity-80">
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
