import React, { useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useReTitle } from "re-title";
import API_CONFIG from "../../configs/api.config";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";
import {
  FaEye,
  FaShoppingCart,
  FaArrowLeft,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const setTitle = useReTitle();
  const { addToCart } = useCart();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("itemName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  React.useEffect(() => {
    setTitle(`${categoryName} | Oshudh`);
  }, [setTitle, categoryName]);

  // Fetch medicines by category
  const {
    data: medicinesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "categoryMedicines",
      categoryName,
      page,
      search,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/categories/${categoryName}/medicines`,
        {
          params: { page, limit: 10, search, sortBy, sortOrder },
        }
      );
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
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-medical-primary"></div>
          <p className="mt-4 text-gray-600">
            Loading {categoryName} medicines...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading {categoryName} Medicines
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Link to="/shop" className="medical-btn-primary">
            Back to Shop
          </Link>
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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/shop"
              className="text-medical-primary hover:underline flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Shop
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 capitalize">
              💊 {categoryName} Medicines
            </h1>
            <p className="text-gray-600 text-lg">
              Browse all {categoryName.toLowerCase()} medicines available in our
              store
            </p>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${categoryName} medicines...`}
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
            Showing {medicines.length} of {pagination.totalCount || 0}{" "}
            {categoryName} medicines
          </p>
        </div>

        {/* Medicine Cards Grid */}
        {medicines.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl text-gray-300 mb-4">💊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No {categoryName} Medicines Found
            </h3>
            <p className="text-gray-600 mb-6">
              {search
                ? `No medicines found matching "${search}" in ${categoryName} category.`
                : `No medicines available in ${categoryName} category at the moment.`}
            </p>
            <div className="space-x-4">
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="medical-btn-outline"
                >
                  Clear Search
                </button>
              )}
              <Link to="/shop" className="medical-btn-primary">
                Browse All Medicines
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {medicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {/* Discount Badge */}
                  {medicine.discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-error text-white px-3 py-1 rounded-full text-sm font-bold">
                      {medicine.discountPercentage}% OFF
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {categoryName}
                    </span>
                  </div>

                  {/* Image */}
                  <figure className="h-48 overflow-hidden">
                    <img
                      src={
                        medicine.imageUrl ||
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop"
                      }
                      alt={medicine.itemName}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop";
                      }}
                    />
                  </figure>

                  {/* Card Body */}
                  <div className="card-body p-4">
                    {/* Title */}
                    <h3 className="card-title text-lg line-clamp-2 min-h-[3.5rem]">
                      {medicine.itemName}
                    </h3>

                    {/* Description */}
                    <div className="min-h-[3rem]">
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {medicine.genericName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {medicine.company}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="my-3">
                      {medicine.discountPercentage > 0 ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">
                              ৳
                              {(
                                medicine.perUnitPrice *
                                (1 - medicine.discountPercentage / 100)
                              ).toFixed(0)}
                            </span>
                            <span className="text-lg line-through text-gray-400">
                              ৳{medicine.perUnitPrice}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            per {medicine.massUnit || "unit"}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-green-600">
                            ৳{medicine.perUnitPrice}
                          </span>
                          <p className="text-xs text-gray-500">
                            per {medicine.massUnit || "unit"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="card-actions flex gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-1"
                        onClick={() => handleAddToCart(medicine)}
                      >
                        <FaShoppingCart className="mr-1" />
                        Add to Cart
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleViewDetails(medicine)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="bg-white rounded-lg shadow-md px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.current} of {pagination.total}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="medical-btn-outline px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft className="inline mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.total}
                    className="medical-btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <FaChevronRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

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
                      {selectedMedicine.massUnit && (
                        <p>
                          <span className="font-semibold">Mass Unit:</span>{" "}
                          {selectedMedicine.massUnit}
                        </p>
                      )}
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
                      {selectedMedicine.shortDescription && (
                        <p>
                          <span className="font-semibold">Description:</span>{" "}
                          {selectedMedicine.shortDescription}
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

export default CategoryPage;
