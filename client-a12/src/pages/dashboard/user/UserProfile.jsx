import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import Swal from "sweetalert2";

const UserProfile = () => {
  const setTitle = useReTitle();
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    photoURL: currentUser?.photoURL || "",
    phone: "",
    address: "",
  });

  React.useEffect(() => {
    setTitle("My Profile | Oshudh");
  }, [setTitle]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      await updateUserProfile(formData.displayName, formData.photoURL);

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || "",
      photoURL: currentUser?.photoURL || "",
      phone: "",
      address: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="medical-btn-primary flex items-center gap-2"
          >
            <FaEdit />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover/Header Section */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-green-500"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-6">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {formData.photoURL ? (
                  <img
                    src={formData.photoURL}
                    alt={formData.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(formData.displayName || "User") +
                        "&background=2563eb&color=fff&size=128";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100">
                    <FaUser className="text-5xl text-blue-500" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <FaCamera />
                </button>
              )}
            </div>

            <div className="md:ml-6 mt-4 md:mt-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full md:w-auto"
                  placeholder="Enter your name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.displayName || "User"}
                </h2>
              )}
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <FaEnvelope className="text-sm" />
                {currentUser?.email}
              </p>
            </div>

            {isEditing && (
              <div className="mt-4 md:mt-0 flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="medical-btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave />
                  {isUpdating ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="btn btn-outline btn-error flex items-center gap-2"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaEnvelope className="text-blue-500" />
                Email Address
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{currentUser?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Photo URL */}
            {isEditing && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaCamera className="text-blue-500" />
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            )}

            {/* Phone (Future implementation) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaPhone className="text-blue-500" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">
                    {formData.phone || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Address (Future implementation) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="text-blue-500" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter your address"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">
                    {formData.address || "Not provided"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Account Created:</span>
                <p className="text-blue-900">
                  {currentUser?.metadata?.creationTime
                    ? new Date(
                        currentUser.metadata.creationTime
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Last Sign In:</span>
                <p className="text-blue-900">
                  {currentUser?.metadata?.lastSignInTime
                    ? new Date(
                        currentUser.metadata.lastSignInTime
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Email Verified:</span>
                <p className="text-blue-900">
                  {currentUser?.emailVerified ? "✓ Yes" : "✗ No"}
                </p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">User ID:</span>
                <p className="text-blue-900 text-xs font-mono">
                  {currentUser?.uid?.substring(0, 20)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
