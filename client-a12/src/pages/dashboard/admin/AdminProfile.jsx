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
  FaShieldAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";

const AdminProfile = () => {
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
    setTitle("Admin Profile | Oshudh");
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
        text: "Your admin profile has been updated successfully.",
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaShieldAlt className="text-blue-600" />
            Admin Profile
          </h1>
          <p className="text-gray-600">Manage your administrator profile</p>
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
        {/* Cover/Header Section with Admin Badge */}
        <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative">
          <div className="absolute top-4 right-4 bg-white text-purple-600 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <FaShieldAlt />
            ADMINISTRATOR
          </div>
        </div>

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
                        encodeURIComponent(formData.displayName || "Admin") +
                        "&background=7c3aed&color=fff&size=128";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-100">
                    <FaUser className="text-5xl text-purple-500" />
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
                  className="text-2xl font-bold text-gray-900 border-b-2 border-purple-500 focus:outline-none w-full md:w-auto"
                  placeholder="Enter your name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.displayName || "Administrator"}
                </h2>
              )}
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <FaEnvelope className="text-sm" />
                {currentUser?.email}
              </p>
              <p className="text-purple-600 font-semibold text-sm mt-1 flex items-center gap-1">
                <FaShieldAlt />
                Admin Access Granted
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
                <FaEnvelope className="text-purple-500" />
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
                  <FaCamera className="text-purple-500" />
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  name="photoURL"
                  value={formData.photoURL}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaPhone className="text-purple-500" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            {/* Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaMapMarkerAlt className="text-purple-500" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <FaShieldAlt />
              Administrator Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-700 font-medium">
                  Account Created:
                </span>
                <p className="text-purple-900">
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
                <span className="text-purple-700 font-medium">
                  Last Sign In:
                </span>
                <p className="text-purple-900">
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
                <span className="text-purple-700 font-medium">
                  Email Verified:
                </span>
                <p className="text-purple-900">
                  {currentUser?.emailVerified ? "✓ Yes" : "✗ No"}
                </p>
              </div>
              <div>
                <span className="text-purple-700 font-medium">User ID:</span>
                <p className="text-purple-900 text-xs font-mono">
                  {currentUser?.uid?.substring(0, 20)}...
                </p>
              </div>
            </div>
          </div>

          {/* Admin Permissions Info */}
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Administrator Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                Manage all users and roles
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                Manage medicine categories
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                Approve/reject payments
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                View sales reports & analytics
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                Manage banner advertisements
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-green-500">✓</span>
                Full system access & control
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
