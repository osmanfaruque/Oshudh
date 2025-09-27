import React from "react";
import { useForm } from "react-hook-form";
import { FaTimes, FaSave, FaImage } from "react-icons/fa";

const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      categoryName: editingCategory?.categoryName || "",
      categoryImage: editingCategory?.categoryImage || "",
    },
  });

  React.useEffect(() => {
    if (editingCategory) {
      reset({
        categoryName: editingCategory.categoryName,
        categoryImage: editingCategory.categoryImage,
      });
    }
  }, [editingCategory, reset]);

  if (!isOpen) return null;

  const submitForm = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white w-full max-w-md mx-auto rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
            {/* Category Name */}
            <div>
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category Name *
              </label>
              <input
                id="categoryName"
                type="text"
                placeholder="Category Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("categoryName", {
                  required: "Category name is required",
                  minLength: {
                    value: 2,
                    message: "Category name must be at least 2 characters",
                  },
                })}
              />
              {errors.categoryName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryName.message}
                </p>
              )}
            </div>

            {/* Category Image URL */}
            <div>
              <label
                htmlFor="categoryImage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category Image URL *
              </label>
              <div className="relative">
                <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="categoryImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("categoryImage", {
                    required: "Category image URL is required",
                    pattern: {
                      value: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/i,
                      message: "Please enter a valid image URL",
                    },
                  })}
                />
              </div>
              {errors.categoryImage && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryImage.message}
                </p>
              )}
            </div>

            {/* Preview current image if editing */}
            {editingCategory && editingCategory.categoryImage && (
              <div className="mt-3 p-3 border rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Current image:</p>
                <img
                  src={editingCategory.categoryImage}
                  alt={editingCategory.categoryName}
                  className="h-32 object-cover rounded w-full"
                />
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {isLoading
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Add Category"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
