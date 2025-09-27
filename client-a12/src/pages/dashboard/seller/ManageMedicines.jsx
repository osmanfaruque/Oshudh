import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import { useForm } from "react-hook-form";
import AddMedicineModal from "../../../components/shared/AddMedicineModal";
import {
  FaPills,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import  API_CONFIG  from "../../../configs/api.config";

const ManageMedicines = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const {
    reset,
    setValue,
  } = useForm();

  React.useEffect(() => {
    setTitle("Manage Medicines | Seller Dashboard");
  }, [setTitle]);

  // Fetch seller's medicines
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: [
      "seller-medicines",
      currentUser?.email,
      searchTerm,
      categoryFilter,
    ],
    queryFn: async () => {
      try {
        const token = await currentUser.getIdToken();
        
        // Build query parameters
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (categoryFilter !== "all") params.append("category", categoryFilter);
        
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/seller/medicines?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch medicines");
        }
        
        return response.data;
      } catch (error) {
        console.error("Error fetching seller medicines:", error);
        throw error;
      }
    },
    enabled: !!currentUser,
    refetchOnWindowFocus: false,
  });
  
  // Extract medicines from API response
  const medicines = medicinesData?.data || [];

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-for-seller"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/categories`);
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch categories");
        }
        
        return response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return { data: [] };
      }
    },
    refetchOnWindowFocus: false,
  });

  // Extract categories from API response
  const categories = categoriesData?.data?.map(cat => cat.categoryName.trim()) || [];
  // Add medicine 
  const addMedicineMutation = useMutation({
    mutationFn: async (medicineData) => {
      const token = await currentUser.getIdToken();
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/seller/medicines`,
        medicineData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["seller-medicines"]);
      setIsModalOpen(false);
      reset();
      setEditingMedicine(null);
      Swal.fire({
        icon: "success",
        title: "Medicine Added!",
        text: "New medicine has been added successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Add Failed",
        text: error.message,
      });
    },
  });

  // Update medicine 
  const updateMedicineMutation = useMutation({
    mutationFn: async ({ id, medicineData }) => {
      const token = await currentUser.getIdToken();
      
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/seller/medicines/${id}`,
        medicineData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["seller-medicines"]);
      setIsModalOpen(false);
      reset();
      setEditingMedicine(null);
      Swal.fire({
        icon: "success",
        title: "Medicine Updated!",
        text: "Medicine has been updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    },
  });

  // Delete medicine 
  const deleteMedicineMutation = useMutation({
    mutationFn: async (medicineId) => {
      const token = await currentUser.getIdToken();
      
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}/seller/medicines/${medicineId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["seller-medicines"]);
      Swal.fire({
        icon: "success",
        title: "Medicine Deleted!",
        text: "Medicine has been deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    const medicineData = {
      ...data,
      perUnitPrice: parseFloat(data.perUnitPrice),
      discountPercentage: parseFloat(data.discountPercentage || 0),
    };

    if (editingMedicine) {
      updateMedicineMutation.mutate({
        id: editingMedicine._id,
        medicineData,
      });
    } else {
      addMedicineMutation.mutate(medicineData);
    }
  };

  // Handle edit medicine
  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setValue("itemName", medicine.itemName);
    setValue("genericName", medicine.genericName);
    setValue("shortDescription", medicine.shortDescription);
    setValue("imageUrl", medicine.imageUrl);
    setValue("category", medicine.category);
    setValue("company", medicine.company);
    setValue("massUnit", medicine.massUnit);
    setValue("perUnitPrice", medicine.perUnitPrice);
    setValue("discountPercentage", medicine.discountPercentage);
    setIsModalOpen(true);
  };

  // Handle delete medicine
  const handleDeleteMedicine = (medicine) => {
    Swal.fire({
      title: "Delete Medicine?",
      text: `Are you sure you want to delete "${medicine.itemName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMedicineMutation.mutate(medicine._id);
      }
    });
  };

  // Handle add new medicine
  const handleAddNew = () => {
    setEditingMedicine(null);
    reset();
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
    reset();
  };

  // Filter medicines
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || medicine.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
            <FaPills className="mr-3 text-medical-primary" />
            Manage Medicines
          </h1>
          <p className="text-gray-600">
            Add, edit, or delete your medicine inventory. Total:{" "}
            {medicines.length} medicines
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="medical-btn-primary flex items-center px-6 py-3"
        >
          <FaPlus className="mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="text-sm text-gray-600 flex items-center">
            <FaFilter className="mr-2" />
            Showing {filteredMedicines.length} of {medicines.length} medicines
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category & Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price & Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock & Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover shadow-sm"
                        src={
                          medicine.imageUrl || "https://i.ibb.co/v6LGC7hK/image.png"
                        }
                        alt={medicine.itemName}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {medicine.itemName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {medicine.genericName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {medicine.massUnit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {medicine.category}
                      </span>
                      <div className="text-sm text-gray-900 mt-1">
                        {medicine.company}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        ৳{medicine.perUnitPrice}
                      </div>
                      {medicine.discountPercentage > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {medicine.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Stock: {medicine.stock}
                      </div>
                      <div className="text-sm text-green-600">
                        Sales: {medicine.sales}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(medicine.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditMedicine(medicine)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Medicine"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(medicine)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Medicine"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <FaPills className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No medicines found
            </h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by adding your first medicine."}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        editingMedicine={editingMedicine}
        categories={categories}
      />

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Medicine Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {medicines.length}
            </div>
            <div className="text-sm text-gray-600">Total Medicines</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {medicines.reduce((sum, med) => sum + med.sales, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Sales</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {medicines.reduce((sum, med) => sum + med.stock, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Stock</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {medicines.filter((med) => med.discountPercentage > 0).length}
            </div>
            <div className="text-sm text-gray-600">Discounted Items</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMedicines;