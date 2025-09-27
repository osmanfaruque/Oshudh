import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useReTitle } from "re-title";
import Lottie from "lottie-react";
import AuthAnimation from "../../assets/animations/auth.json";
import API_CONFIG from "../../configs/api.config";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const Register = () => {
  const setTitle = useReTitle();
  React.useEffect(() => {
    setTitle("Sign Up | Oshudh");
  }, [setTitle]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { createUser, updateUserProfile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Save user 
  const saveUserMutation = useMutation({
    mutationFn: async ({ userData, idToken }) => {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/users`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      return response.data;
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // 1. Create Firebase user
      const userCredential = await createUser(data.email, data.password);
      // 2. Update Firebase profile
      await updateUserProfile(data.username, data.photoURL);
      // 3. Save user to MongoDB
      const idToken = await userCredential.user.getIdToken();

      const userData = {
        username: data.username,
        email: data.email,
        photoURL: data.photoURL || "",
        role: data.role, // user/seller form
      };

      const result = await saveUserMutation.mutateAsync({ userData, idToken });

      if (!result.success) {
        throw new Error(result.error || "Failed to save user data");
      }

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Welcome to Oshudh: Health at Door",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(from, { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();

      // Save Google user to MongoDB
      const idToken = await userCredential.user.getIdToken();

      const userData = {
        username:
          userCredential.user.displayName ||
          userCredential.user.email.split("@")[0],
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL || "",
        role: "user", 
      };

      try {
        await saveUserMutation.mutateAsync({ userData, idToken });
      } catch (saveError) {
        console.warn("User save warning:", saveError.message);
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome to Oshudh: Health at Door",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate(from, { replace: true });
    } catch (error) {
      console.error("Google sign-in error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Animation Side */}
            <div className="hidden lg:block">
              <Lottie
                className="hidden lg:block w-96 h-96"
                animationData={AuthAnimation}
                loop={true}
              />
            </div>

            {/* Registration Form Side */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-2">🏥</span>
                  <h1 className="text-2xl font-bold text-medical-primary">
                    Oshudh
                  </h1>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Create Your Account
                </h2>
                <p className="text-gray-600">Join our healthcare community</p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    {...register("photoURL")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                    placeholder="Profile photo URL (optional)"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Role *
                  </label>
                  <select
                    {...register("role", { required: "Please select a role" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  >
                    <option value="">Choose your role</option>
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.role.message}
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
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaGoogle className="text-red-500 mr-2" />
                    Sign up with Google
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-medical-primary hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
