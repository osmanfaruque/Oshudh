import React from "react";
import Lottie from "lottie-react";
import LoadingLottie from "../../assets/animations/loading.json";

const LoadingAnimation = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Lottie
        animationData={LoadingLottie}
        loop
        autoplay
        className="w-100 h-100 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]"
      />
    </div>
  );
};

export default LoadingAnimation;