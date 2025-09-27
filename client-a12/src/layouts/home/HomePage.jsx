import React from "react";
import SliderSection from "../../components/home/SliderSection/SliderSection";
import CategorySection from "../../components/home/CategorySection/CategorySection";
import DiscountProducts from "../../components/home/DiscountProducts/DiscountProducts";
import AboutSection from "../../components/home/AboutSection/AboutSection";
import TestimonialSection from "../../components/home/TestimonialSection/TestimonialSection";
import { useReTitle } from "re-title";

const HomePage = () => {
  const setTitle = useReTitle();
  React.useEffect(() => {
    setTitle("Home | Oshudh");
  }, [setTitle]);

  return (
    <div className="min-h-screen ">
      {/*Slider Section */}
      <SliderSection />
      {/*Category Card Section  */}
      <CategorySection />
      {/*Discount products */}
      <DiscountProducts />
      {/*About Section */}
      <AboutSection />
      {/*Testimonial Section */}
      <TestimonialSection />
    </div>
  );
};

export default HomePage;
