import { Link } from "react-router";
import Lottie from "lottie-react";
import errorAnimation from "../../assets/animations/error.json";

const ErrorFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg">
        <Lottie
          animationData={errorAnimation}
          loop
          autoplay
          className="w-full h-auto"
        />
      </div>
      <div className="text-center mt-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Oops! Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorFound;