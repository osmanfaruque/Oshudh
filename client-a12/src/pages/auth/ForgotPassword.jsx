import React, { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useReTitle } from "re-title";
import Swal from "sweetalert2";
import Lottie from "lottie-react";
import AuthAnimation from "../../assets/animations/auth.json";

const ForgotPassword = () => {
  const setTitle = useReTitle();
  React.useEffect(() => {
    setTitle("Forget Password | Oshudh");
  }, [setTitle]);

  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await resetPassword(data.email);

      Swal.fire({
        icon: "success",
        title: "Reset Email Sent!",
        text: "Please check your email for password reset instructions.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Animation Side */}
            <div className="hidden lg:block">
              <Lottie
                className="hidden lg:block w-96 h-96"
                animationData={AuthAnimation}
                loop={true}
              />
            </div>

            {/* Reset Form Side */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-2">🏥</span>
                  <h1 className="text-2xl font-bold text-medical-primary">
                    Oshudh
                  </h1>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Reset Your Password
                </h2>
                <p className="text-gray-600">
                  Enter your email to receive reset instructions
                </p>
              </div>

              {/* Reset Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    placeholder="Enter your registered email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full medical-btn-primary py-3 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Sending Reset Email..." : "Send Reset Email"}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-medical-primary hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </div>

              {/* Register Link */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-medical-primary hover:underline"
                  >
                    Create account here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
