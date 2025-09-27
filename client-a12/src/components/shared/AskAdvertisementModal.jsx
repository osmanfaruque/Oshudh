import { useForm } from "react-hook-form";
import { FaImage, FaSave, FaTimes } from "react-icons/fa";

const AskAdvertisementModal = ({
  isOpen,
  onClose,
  onSubmit,
  medicines,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Request Advertisement
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Medicine Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Medicine *
              </label>
              <select
                {...register("medicineId", {
                  required: "Please select a medicine",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              >
                <option value="">Choose a medicine to advertise</option>
                {medicines.map((medicine) => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.itemName} - {medicine.company}
                  </option>
                ))}
              </select>
              {errors.medicineId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.medicineId.message}
                </p>
              )}
            </div>

            {/* Advertisement Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Image URL *
              </label>
              <div className="relative">
                <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  {...register("medicineImage", {
                    required: "Advertisement image URL is required",
                    pattern: {
                      value: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i,
                      message: "Please enter a valid image URL",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  placeholder="https://example.com/banner-image.jpg"
                />
              </div>
              {errors.medicineImage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.medicineImage.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Recommended size: 800x400px for best quality
              </p>
            </div>

            {/* Advertisement Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advertisement Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message: "Description must be at least 20 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Description cannot exceed 200 characters",
                  },
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                placeholder="Write a compelling description for your medicine advertisement..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                This description will appear on the homepage slider
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Important Notes:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Advertisement requests are subject to admin approval</li>
                <li>
                  • Images should be high quality and relevant to the medicine
                </li>
                <li>• Descriptions should be clear and professional</li>
                <li>
                  • Active advertisements will be shown in the homepage slider
                </li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 medical-btn-primary flex items-center justify-center disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {isLoading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
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

export default AskAdvertisementModal;
