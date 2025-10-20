import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import API_CONFIG from "../../../configs/api.config";
import {
  FaBullhorn,
  FaSearch,
  FaFilter,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaImage,
  FaCheck,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const ManageBanner = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAdvert, setSelectedAdvert] = useState(null);

  React.useEffect(() => {
    setTitle("Manage Banner Advertise | Admin Dashboard");
  }, [setTitle]);

  // Fetch advertisement requests
  const { data: advertisementsData, isLoading } = useQuery({
    queryKey: ["admin-advertisements", searchTerm, statusFilter],
    queryFn: async () => {
      try {
        const token = await currentUser.getIdToken();
        
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/admin/advertisements`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              search: searchTerm,
              status: statusFilter !== "all" ? statusFilter : undefined,
            },
          }
        );
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch advertisements");
        }

        return response.data.data || [];
      } catch (error) {
        console.error("Failed to fetch advertisements:", error);
        throw error;
      }
    },
    enabled: !!currentUser,
    refetchOnWindowFocus: false,
  });

  // Toggle advertisement status (approve/reject/activate/deactivate)
  const toggleAdvertMutation = useMutation({
    mutationFn: async ({ advertId, action }) => {
      const token = await currentUser.getIdToken();
      
      const response = await axios.patch(
        `${API_CONFIG.BASE_URL}/admin/advertisements/${advertId}/toggle`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["admin-advertisements"]);
      
      const actionMessages = {
        approve: "Advertisement approved successfully!",
        reject: "Advertisement rejected!",
        activate: "Advertisement activated and added to homepage slider!",
        deactivate: "Advertisement deactivated and removed from slider!",
      };
      
      Swal.fire({
        icon: "success",
        title: "Action Completed!",
        text: actionMessages[variables.action],
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: error.response?.data?.error || error.message,
      });
    },
  });

  // Extract advertisements from API response  
  const advertisements = advertisementsData || [];

  // Handle advertisement actions
  const handleAdvertAction = (advert, action) => {
    const actionTexts = {
      approve: "approve this advertisement",
      reject: "reject this advertisement", 
      activate: "activate and add to homepage slider",
      deactivate: "deactivate and remove from slider",
    };

    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Advertisement?`,
      text: `Are you sure you want to ${actionTexts[action]} for "${advert.medicineName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: action === "reject" || action === "deactivate" ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}!`,
    }).then((result) => {
      if (result.isConfirmed) {
        toggleAdvertMutation.mutate({
          advertId: advert._id,
          action: action,
        });
      }
    });
  };

  // Handle toggle advertisement
  const handleToggleAdvert = (advert) => {
    if (advert.adminStatus === "approved") {
      handleAdvertAction(advert, advert.isActive ? "deactivate" : "activate");
    }
  };

  // View advertisement details
  const handleViewDetails = (advert) => {
    setSelectedAdvert(advert);
    document.getElementById("advert_details_modal").showModal();
  };

  // Filter advertisements
  const filteredAdverts = advertisements.filter((advert) => {
    const matchesSearch =
      advert.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advert.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advert.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && advert.adminStatus === "pending") ||
      (statusFilter === "approved" && advert.adminStatus === "approved") ||
      (statusFilter === "rejected" && advert.adminStatus === "rejected") ||
      (statusFilter === "active" && advert.isActive) ||
      (statusFilter === "inactive" && !advert.isActive && advert.adminStatus === "approved");

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: advertisements.length,
    pending: advertisements.filter((a) => a.adminStatus === "pending").length,
    approved: advertisements.filter((a) => a.adminStatus === "approved").length,
    rejected: advertisements.filter((a) => a.adminStatus === "rejected").length,
    active: advertisements.filter((a) => a.isActive).length,
    inactive: advertisements.filter((a) => !a.isActive && a.adminStatus === "approved").length,
    uniqueSellers: [...new Set(advertisements.map((a) => a.sellerEmail))].length,
  };

  const getStatusBadge = (advert) => {
    if (advert.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaToggleOn className="mr-1" />
          Active in Slider
        </span>
      );
    } else if (advert.adminStatus === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <FaClock className="mr-1" />
          Pending Review
        </span>
      );
    } else if (advert.adminStatus === "approved") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaCheck className="mr-1" />
          Approved (Not Active)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimes className="mr-1" />
          Rejected
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaBullhorn className="mr-3 text-medical-primary" />
            Manage Banner Advertise
          </h1>
          <p className="text-gray-600">
            Control homepage slider advertisements. Total:{" "}
            {advertisements.length} requests
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaBullhorn className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <FaClock className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaCheck className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaToggleOn className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <FaTimes className="text-2xl text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search advertisements..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active in Slider</option>
            <option value="inactive">Not Active</option>
          </select>

          {/* Results Count */}
          <div className="text-sm text-gray-600 flex items-center">
            <FaFilter className="mr-2" />
            Showing {filteredAdverts.length} of {advertisements.length}{" "}
            advertisements
          </div>
        </div>
      </div>

      {/* Current Slider Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaImage className="mr-2 text-medical-primary" />
          Currently in Homepage Slider ({stats.active} slides)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advertisements
            .filter((a) => a.isActive)
            .sort((a, b) => (a.priority || 999) - (b.priority || 999))
            .map((advert) => (
              <div key={advert._id} className="relative">
                <img
                  src={advert.medicineImage}
                  alt={advert.medicineName}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                  <h4 className="text-white font-semibold text-sm">
                    {advert.medicineName}
                  </h4>
                  <p className="text-white/80 text-xs">{advert.sellerName}</p>
                </div>
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Slide #{advert.priority}
                </div>
              </div>
            ))}
        </div>
        {stats.active === 0 && (
          <div className="text-center py-8 text-gray-500">
            No advertisements currently active in slider
          </div>
        )}
      </div>

      {/* Advertisements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Medicine Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Request Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdverts.map((advert) => (
                <tr key={advert._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        className="h-16 w-16 rounded-lg object-cover shadow-sm"
                        src={advert.medicineImage}
                        alt={advert.medicineName}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {advert.medicineName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {advert.genericName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {advert.company} • {advert.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {advert.description.length > 100
                        ? `${advert.description.substring(0, 100)}...`
                        : advert.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {advert.sellerName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaEnvelope className="mr-1" />
                        {advert.sellerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(advert)}
                    {advert.isActive && advert.priority && (
                      <div className="text-xs text-green-600 mt-1">
                        Priority: {advert.priority}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {advert.requestedAt ? new Date(advert.requestedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {advert.requestedAt ? new Date(advert.requestedAt).toLocaleTimeString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(advert)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>

                      {/* Status action buttons */}
                      {advert.adminStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleAdvertAction(advert, "approve")}
                            disabled={toggleAdvertMutation.isLoading}
                            className="px-2 py-1 text-xs medical-btn-primary disabled:opacity-50"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleAdvertAction(advert, "reject")}
                            disabled={toggleAdvertMutation.isLoading}
                            className="px-2 py-1 text-xs medical-btn-outline disabled:opacity-50"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}

                      {/* Toggle slider for approved advertisements */}
                      {advert.adminStatus === "approved" && (
                        <button
                          onClick={() => handleToggleAdvert(advert)}
                          disabled={toggleAdvertMutation.isLoading}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors disabled:opacity-50 ${
                            advert.isActive
                              ? "medical-btn-outline"
                              : "medical-btn-primary"
                          }`}
                        >
                          {advert.isActive ? (
                            <>
                              <FaToggleOff className="mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <FaToggleOn className="mr-1" />
                              Add to Slider
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdverts.length === 0 && (
          <div className="text-center py-12">
            <FaBullhorn className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No advertisements found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Advertisement Details Modal */}
      <dialog id="advert_details_modal" className="modal">
        <div className="modal-box max-w-4xl">
          {selectedAdvert && (
            <>
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>

              <h3 className="font-bold text-xl mb-6 text-medical-primary">
                Advertisement Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Medicine Image */}
                <div>
                  <img
                    src={selectedAdvert.medicineImage}
                    alt={selectedAdvert.medicineName}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Medicine Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Medicine Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Name:</strong> {selectedAdvert.medicineName}
                      </p>
                      <p>
                        <strong>Generic Name:</strong>{" "}
                        {selectedAdvert.genericName}
                      </p>
                      <p>
                        <strong>Company:</strong> {selectedAdvert.company}
                      </p>
                      <p>
                        <strong>Category:</strong> {selectedAdvert.category}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {getStatusBadge(selectedAdvert.isActive)}
                      </p>
                      {selectedAdvert.isActive && selectedAdvert.priority && (
                        <p>
                          <strong>Slider Priority:</strong>{" "}
                          {selectedAdvert.priority}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Seller Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Name:</strong> {selectedAdvert.sellerName}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedAdvert.sellerEmail}
                      </p>
                      <p>
                        <strong>Request Date:</strong>{" "}
                        {new Date(selectedAdvert.requestedAt).toLocaleString()}
                      </p>
                      {selectedAdvert.activatedAt && (
                        <p>
                          <strong>Activated Date:</strong>{" "}
                          {new Date(
                            selectedAdvert.activatedAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Advertisement Description
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {selectedAdvert.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="modal-action">
                <button
                  onClick={() => {
                    document.getElementById("advert_details_modal").close();
                    handleToggleAdvert(selectedAdvert);
                  }}
                  className={`btn ${
                    selectedAdvert.isActive ? "btn-error" : "btn-success"
                  }`}
                  disabled={toggleAdvertMutation.isLoading}
                >
                  {selectedAdvert.isActive ? (
                    <>
                      <FaToggleOff className="mr-2" />
                      Remove from Slider
                    </>
                  ) : (
                    <>
                      <FaToggleOn className="mr-2" />
                      Add to Slider
                    </>
                  )}
                </button>
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default ManageBanner;
