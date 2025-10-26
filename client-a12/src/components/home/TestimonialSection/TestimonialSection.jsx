import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { Link } from "react-router";

import "swiper/css";
import "swiper/css/pagination";

const TestimonialSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "রহিমা খাতুন",
      location: "ঢাকা",
      rating: 5,
      comment:
        "Oshudh থেকে ওষুধ কিনে খুবই ভালো লেগেছে। দাম কম এবং ডেলিভারি খুব দ্রুত। ধন্যবাদ Oshudh টিমকে!",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b27c?w=150&h=150&fit=crop&crop=face",
      medicine: "Paracetamol & Vitamin tablets",
    },
    {
      id: 2,
      name: "মোঃ করিম উদ্দিন",
      location: "চট্টগ্রাম",
      rating: 5,
      comment:
        "বাবার ডায়াবেটিসের ওষুধ নিয়মিত এখান থেকে কিনি। কোয়ালিটি ভালো এবং দাম সাশ্রয়ী। সবার পরামর্শ করব।",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      medicine: "Diabetes medication",
    },
    {
      id: 3,
      name: "ফাতেমা বেগম",
      location: "সিলেট",
      rating: 5,
      comment:
        "রাতে জরুরি ওষুধের দরকার ছিল। অসুধের ২৪/৭ সেবা পেয়ে খুবই উপকৃত হয়েছি। অনেক ধন্যবাদ!",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      medicine: "Emergency medicines",
    },
    {
      id: 4,
      name: "ডাঃ আব্দুল হক",
      location: "রাজশাহী",
      rating: 5,
      comment:
        "একজন ডাক্তার হিসেবে বলতে পারি Oshudh সব ওষুধ অরিজিনাল এবং কোয়ালিটি সম্পন্ন। রোগীদের সুপারিশ করি।",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      medicine: "Professional recommendation",
    },
    {
      id: 5,
      name: "সালমা আক্তার",
      location: "খুলনা",
      rating: 5,
      comment:
        "বাচ্চাদের সিরাপ এবং ভিটামিন নিয়মিত Oshudh থেকে কিনি। প্যাকেজিং খুব ভালো এবং এক্সপায়ারি ডেট সব ঠিক থাকে।",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      medicine: "Children medicines",
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
            Customer Reviews 💬
          </h2>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
            Read genuine reviews from our satisfied customers across Bangladesh
            who trust Oshudh for their healthcare needs.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={true}
            breakpoints={{
              480: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="medical-card p-6 h-full hover:shadow-xl transition-all duration-300 relative">
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 text-primary/20">
                    <FaQuoteLeft className="text-3xl" />
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center mb-4">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg text-gray-800">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        📍 {testimonial.location}
                      </p>
                      <div className="flex items-center mt-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed italic">
                      "{testimonial.comment}"
                    </p>
                  </div>

                  {/* Medicine Info */}
                  <div className="border-t pt-3">
                    <p className="text-sm text-primary font-medium">
                      💊 Purchased: {testimonial.medicine}
                    </p>
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      ✓ Verified Purchase
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                10,000+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">
                4.9/5
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">50,000+</div>
              <div className="text-gray-600">Orders Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning mb-2">99%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Join Our Happy Customers Today! 🌟
          </h3>
          <p className="text-gray-600 mb-6">
            Experience the convenience of reliable healthcare delivery with
            Oshudh.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">Start Your Order</Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
