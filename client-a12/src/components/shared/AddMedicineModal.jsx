import { useForm } from "react-hook-form";
import { FaTimes, FaImage } from "react-icons/fa";

const AddMedicineModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingMedicine,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: editingMedicine || {
      discountPercentage: 0,
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl p-8 transform transition-all">
        <div className="absolute top-0 right-0 pt-6 pr-6">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
          </h3>

          <form
            onSubmit={handleSubmit((data) => onSubmit(data))}
            className="space-y-6 mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("itemName", {
                    required: "Item name is required",
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors"
                  placeholder="e.g., Napa Extra 500mg"
                />
                {errors.itemName && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.itemName.message}
                  </p>
                )}
              </div>

              {/* Generic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("genericName", {
                    required: "Generic name is required",
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors"
                  placeholder="e.g., Paracetamol"
                />
                {errors.genericName && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.genericName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("shortDescription", {
                  required: "Description is required",
                })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors resize-none"
                placeholder="Brief description of the medicine"
              />
              {errors.shortDescription && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaImage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  {...register("imageUrl", {
                    required: "Image URL is required",
                    pattern: {
                      value: /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg)$/i,
                      message:
                        "Must be a valid image URL (jpg, png, webp, svg)",
                    },
                  })}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors"
                  placeholder="https://example.com/medicine-image.jpg"
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.imageUrl.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors appearance-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"></div>
                </div>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("company", {
                    required: "Company name is required",
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors"
                  placeholder="e.g., Beximco, Square, etc."
                />
                {errors.company && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.company.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mass Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mass Unit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("massUnit", {
                      required: "Mass unit is required",
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors appearance-none"
                  >
                    <option value="">Select Unit</option>
                    <option value="Mg">Mg</option>
                    <option value="ML">ML</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"></div>
                </div>
                {errors.massUnit && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.massUnit.message}
                  </p>
                )}
              </div>

              {/* Per Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per Unit Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("perUnitPrice", {
                      required: "Price is required",
                      min: {
                        value: 0.01,
                        message: "Price must be greater than 0",
                      },
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Price must have at most 2 decimal places",
                      },
                    })}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors"
                    placeholder="0.00"
                  />
                  {errors.perUnitPrice && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.perUnitPrice.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    %
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("discountPercentage", {
                      min: {
                        value: 0,
                        message: "Discount cannot be negative",
                      },
                      max: {
                        value: 100,
                        message: "Discount cannot exceed 100%",
                      },
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Discount must have at most 2 decimal places",
                      },
                    })}
                    className="w-full pr-8 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary focus:border-medical-primary transition-colors"
                    placeholder="0"
                  />
                  {errors.discountPercentage && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.discountPercentage.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-black bg-medical-primary border border-transparent rounded-lg hover:bg-medical-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-primary transition-colors flex items-center gap-2"
              >
                {editingMedicine ? (
                  <>
                    <span>Update Medicine</span>
                  </>
                ) : (
                  <>
                    <span>Add Medicine</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineModal;
