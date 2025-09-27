import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReTitle } from "re-title";
import  API_CONFIG  from "../../configs/api.config";
import axios from "axios";
import { useCart } from "../../contexts/CartContext";
import {
  FaEye,
  FaShoppingCart,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const ShopPage = () => {
  const setTitle = useReTitle();
  const { addToCart } = useCart();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("itemName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  React.useEffect(() => {
    setTitle("Shop | Oshudh");
  }, [setTitle]);

  // Fetch medicines
  const {
    data: medicinesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["medicines", page, search, sortBy, sortOrder],
    queryFn: async () => {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/medicines`, {
        params: { page, limit: 10, search, sortBy, sortOrder },
      });
      return response.data;
    },
  });

  // Add to cart function
  const handleAddToCart = (medicine) => {
    const cartItem = {
      medicineId: medicine._id,
      itemName: medicine.itemName,
      genericName: medicine.genericName,
      company: medicine.company,
      perUnitPrice: medicine.perUnitPrice,
      currentPrice: medicine.currentPrice || medicine.perUnitPrice,
      imageUrl: medicine.imageUrl,
      quantity: 1,
    };

    addToCart(cartItem);
  };

  // View details modal
  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    document.getElementById("medicine_modal").showModal();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-medical-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Medicines
          </h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="medical-btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const medicines = medicinesData?.data || [];
  const pagination = medicinesData?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏪 Medicine Shop
          </h1>
          <p className="text-gray-600 text-lg">
            Browse our complete collection of medicines
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Sort By */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="itemName">Sort by Name</option>
              <option value="perUnitPrice">Sort by Price</option>
              <option value="company">Sort by Company</option>
              <option value="createdAt">Sort by Date</option>
            </select>

            {/* Sort Order */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {medicines.length} of {pagination.totalCount || 0} medicines
          </p>
        </div>

        {/* Medicine Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={
                            medicine.imageUrl ||
                            "https://i.ibb.co/v6LGC7hK/image.png"
                          }
                          alt={medicine.itemName}
                          onError={(e) => {
                            e.target.src =
                              "https://i.ibb.co/v6LGC7hK/image.png";
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.itemName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {medicine.genericName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medicine.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-green-600">
                          ৳{medicine.perUnitPrice}
                        </span>
                        {medicine.discountPercentage > 0 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            {medicine.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleAddToCart(medicine)}
                        className="medical-btn-primary px-3 py-1 text-sm"
                      >
                        <FaShoppingCart className="inline mr-1" />
                        Select
                      </button>
                      <button
                        onClick={() => handleViewDetails(medicine)}
                        className="medical-btn-secondary px-3 py-1 text-sm"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Page {pagination.current} of {pagination.total}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="medical-btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="inline mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.total}
                    className="medical-btn-primary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FaChevronRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medicine Details Modal */}
        <dialog id="medicine_modal" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            {selectedMedicine && (
              <>
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    ✕
                  </button>
                </form>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={
                        selectedMedicine.imageUrl ||
                        "https://i.ibb.co/v6LGC7hK/image.png"
                      }
                      alt={selectedMedicine.itemName}
                      className="w-48 h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://i.ibb.co/v6LGC7hK/image.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">
                      {selectedMedicine.itemName}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">Generic Name:</span>{" "}
                        {selectedMedicine.genericName}
                      </p>
                      <p>
                        <span className="font-semibold">Company:</span>{" "}
                        {selectedMedicine.company}
                      </p>
                      <p>
                        <span className="font-semibold">Category:</span>{" "}
                        {selectedMedicine.category}
                      </p>
                      <p>
                        <span className="font-semibold">Price:</span>{" "}
                        <span className="text-green-600 font-bold">
                          ৳{selectedMedicine.perUnitPrice}
                        </span>
                      </p>
                      {selectedMedicine.discountPercentage > 0 && (
                        <p>
                          <span className="font-semibold">Discount:</span>{" "}
                          <span className="text-red-600">
                            {selectedMedicine.discountPercentage}% OFF
                          </span>
                        </p>
                      )}
                      {selectedMedicine.description && (
                        <p>
                          <span className="font-semibold">Description:</span>{" "}
                          {selectedMedicine.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          handleAddToCart(selectedMedicine);
                          document.getElementById("medicine_modal").close();
                        }}
                        className="medical-btn-primary w-full"
                      >
                        <FaShoppingCart className="inline mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default ShopPage;
