import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import { useForm } from "react-hook-form";
import API_CONFIG from "../../../configs/api.config";
import {
  FaList,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTablets,
  FaFlask,
  FaCapsules,
  FaSyringe,
  FaPills,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import CategoryModal from "../../../components/shared/CategoryModal";

const ManageCategories = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const {
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  React.useEffect(() => {
    setTitle("Manage Categories | Admin Dashboard");
  }, [setTitle]);

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      try {
        const token = await currentUser.getIdToken(true);

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/admin/categories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch categories");
        }

        return response.data.data || [];
      } catch (error) {
        console.error(" Categories fetch error:", error);
      }
    },
    enabled: !!currentUser,
    refetchOnWindowFocus: false,
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/admin/categories`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin-categories"]);
      setIsModalOpen(false);
      reset();
      setEditingCategory(null);
      Swal.fire({
        icon: "success",
        title: "Category Added!",
        text: "New category has been added successfully.",
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

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }) => {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/admin/categories/${id}`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setIsModalOpen(false);
      reset();
      setEditingCategory(null);
      Swal.fire({
        icon: "success",
        title: "Category Updated!",
        text: "Category has been updated successfully.",
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

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId) => {
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}/admin/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      Swal.fire({
        icon: "success",
        title: "Category Deleted!",
        text: "Category has been deleted successfully.",
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
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory._id,
        categoryData: data,
      });
    } else {
      addCategoryMutation.mutate(data);
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    reset();
    setEditingCategory(category);

    // Pre-fill the form with category data
    setValue("categoryName", category.categoryName);
    setValue("categoryImage", category.categoryImage);

    // Open modal after form is prepared
    setIsModalOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = (category) => {
    if (category.medicineCount > 0) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete Category",
        text: `This category has ${category.medicineCount} medicines. Please remove all medicines first.`,
      });
      return;
    }

    Swal.fire({
      title: "Delete Category?",
      text: `Are you sure you want to delete "${category.categoryName}" category?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCategoryMutation.mutate(category._id);
      }
    });
  };

  // Handle add new category
  const handleAddNew = () => {
    reset({
      categoryName: "",
      categoryImage: "",
    });
    setEditingCategory(null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingCategory(null);
      reset();
    }, 100);
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    switch (name) {
      case "tablet":
        return <FaTablets className="text-2xl text-blue-600" />;
      case "syrup":
        return <FaFlask className="text-2xl text-green-600" />;
      case "capsule":
        return <FaCapsules className="text-2xl text-purple-600" />;
      case "injection":
        return <FaSyringe className="text-2xl text-red-600" />;
      default:
        return <FaPills className="text-2xl text-orange-600" />;
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
            <FaList className="mr-3 text-medical-primary" />
            Manage Categories
          </h1>
          <p className="text-gray-600">
            Add, edit, or delete medicine categories. Total: {categories.length}{" "}
            categories
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="medical-btn-primary flex items-center px-6 py-3"
        >
          <FaPlus className="mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Category Image */}
            <div className="relative h-48">
              <img
                src={
                  category.categoryImage ||
                  "https://i.ibb.co/v6LGC7hK/image.png"
                }
                alt={category.categoryName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
                {getCategoryIcon(category.categoryName)}
              </div>
            </div>

            {/* Category Details */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {category.categoryName}
                </h3>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {category.medicineCount} medicines
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Updated: {new Date(category.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 medical-btn-secondary text-sm py-2 flex items-center justify-center"
                >
                  <FaEdit className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center"
                  disabled={category.medicineCount > 0}
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <FaList className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding your first medicine category.
          </p>
          <button onClick={handleAddNew} className="medical-btn-primary">
            Add First Category
          </button>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        editingCategory={editingCategory}
        isLoading={
          addCategoryMutation.isLoading || updateCategoryMutation.isLoading
        }
      />

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Category Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {categories.reduce((sum, cat) => sum + cat.medicineCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Medicines</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {categories.length > 0
                ? Math.round(
                    categories.reduce(
                      (sum, cat) => sum + cat.medicineCount,
                      0
                    ) / categories.length
                  )
                : 0}
            </div>
            <div className="text-sm text-gray-600">Avg per Category</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {categories.find(
                (cat) =>
                  cat.medicineCount ===
                  Math.max(...categories.map((c) => c.medicineCount))
              )?.categoryName || "N/A"}
            </div>
            <div className="text-sm text-gray-600">Most Popular</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;