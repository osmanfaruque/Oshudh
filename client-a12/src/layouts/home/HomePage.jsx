import React from "react";
import SliderSection from "../../components/home/SliderSection/SliderSection";
import CategorySection from "../../components/home/CategorySection/CategorySection";
import DiscountProducts from "../../components/home/DiscountProducts/DiscountProducts";
import TestimonialSection from "../../components/home/TestimonialSection/TestimonialSection";
import { useReTitle } from "re-title";

const HomePage = () => {
  const setTitle = useReTitle();
  React.useEffect(() => {
    setTitle("Home | Oshudh");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
      {/* Hero/Slider Section - Main banner showcasing featured products */}
      <SliderSection />
      
      {/* Category Section - Browse medicines by category */}
      <CategorySection />
      
      {/* Discount Products - Special offers and deals */}
      <DiscountProducts />
      
      {/* Testimonial Section - Customer reviews and feedback */}
      <TestimonialSection />
    </div>
  );
};

export default HomePage;
