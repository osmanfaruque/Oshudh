import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";

import {
  FaBullhorn,
  FaPlus,
  FaImage,
  FaSave,
  FaTimes,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import  API_CONFIG  from "../../../configs/api.config";
import AskAdvertisementModal from "../../../components/shared/AskAdvertisementModal";

const AskForAdvertisement = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);


  React.useEffect(() => {
    setTitle("Ask For Advertisement | Seller Dashboard");
  }, [setTitle]);

  // Fetch seller's medicines for dropdown
  const { data: medicines = [] } = useQuery({
    queryKey: ["seller-medicines-for-ads", currentUser?.email],
    queryFn: async () => {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/seller/medicines`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
      });
      return response.data.data || [];
    },
    enabled: !!currentUser,
  });

  // Fetch seller's advertisement requests
  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ["seller-advertisements", currentUser?.email],
    queryFn: async () => {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/seller/advertisements`, {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`,
        },
      });
      return response.data.data || [];
    },
    enabled: !!currentUser,
  });

  // Submit advertisement request mutation
  const submitAdvertMutation = useMutation({
    mutationFn: async (advertData) => {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/seller/advertisements`,
        advertData,
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["seller-advertisements"]);
      setIsModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Advertisement Request Submitted!",
        text: "Your advertisement request has been sent to admin for review.",
        timer: 3000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    const selectedMedicine = medicines.find(
      (med) => med._id === data.medicineId
    );

    const advertData = {
      medicineId: data.medicineId,
      medicineName: selectedMedicine.itemName,
      genericName: selectedMedicine.genericName,
      company: selectedMedicine.company,
      medicineImage: data.medicineImage,
      description: data.description,
    };

    submitAdvertMutation.mutate(advertData);
  };

  // Handle add new advertisement
  const handleAddNew = () => {
    if (medicines.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Medicines Available",
        text: "Please add medicines to your inventory first before requesting advertisements.",
        confirmButtonText: "Add Medicines",
      });
      return;
    }

    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getStatusBadge = (advertisement) => {
    if (advertisement.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaToggleOn className="mr-1" />
          Active in Slider
        </span>
      );
    } else if (advertisement.adminStatus === "pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <FaClock className="mr-1" />
          Pending Review
        </span>
      );
    } else if (advertisement.adminStatus === "approved") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaCheckCircle className="mr-1" />
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

  // Calculate statistics
  const stats = {
    total: advertisements.length,
    active: advertisements.filter((a) => a.isActive).length,
    pending: advertisements.filter((a) => a.adminStatus === "pending").length,
    approved: advertisements.filter((a) => a.adminStatus === "approved").length,
    rejected: advertisements.filter((a) => a.adminStatus === "rejected").length,
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
            Ask For Advertisement
          </h1>
          <p className="text-gray-600">
            Request to advertise your medicines on the homepage slider. Total:{" "}
            {advertisements.length} requests
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="medical-btn-primary flex items-center px-6 py-3"
        >
          <FaPlus className="mr-2" />
          Request Advertisement
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
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
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <FaToggleOn className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
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
              <p className="text-2xl font-bold text-blue-600">
                {stats.approved}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FaCheckCircle className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <FaTimes className="text-2xl text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advertisement Requests */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {advertisements.length === 0 ? (
          <div className="text-center py-12">
            <FaBullhorn className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Advertisement Requests Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start promoting your medicines by requesting advertisement
              placement on the homepage slider.
            </p>
            <button onClick={handleAddNew} className="medical-btn-primary">
              Request Your First Advertisement
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Advertisement Requests
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {advertisements.map((advert) => (
                <div
                  key={advert._id}
                  className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Advertisement Image */}
                  <div className="relative h-48">
                    <img
                      src={advert.medicineImage}
                      alt={advert.medicineName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(advert)}
                    </div>
                    {advert.isActive && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Slide #{advert.priority}
                      </div>
                    )}
                  </div>

                  {/* Advertisement Details */}
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {advert.medicineName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {advert.genericName} • {advert.company}
                    </p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {advert.description}
                    </p>

                    <div className="text-xs text-gray-500 mb-3">
                      <p>
                        Requested:{" "}
                        {new Date(advert.requestedAt).toLocaleDateString()}
                      </p>
                      {advert.activatedAt && (
                        <p>
                          Activated:{" "}
                          {new Date(advert.activatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Status: {advert.adminStatus}
                      </span>
                      {advert.adminStatus === "rejected" && (
                        <button
                          onClick={handleAddNew}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Request Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Request Advertisement Modal */}
      <AskAdvertisementModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        medicines={medicines}
        isLoading={submitAdvertMutation.isLoading}
      />
    </div>
  );
};

export default AskForAdvertisement;
