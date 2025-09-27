import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import API_CONFIG from "../../../configs/api.config";
import axios from "axios";
import {
  FaTablets,
  FaFlask,
  FaCapsules,
  FaSyringe,
  FaPlus,
  FaPills,
} from "react-icons/fa";

// Function to get icon based on category name
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  
  switch (name) {
    case "tablet":
      return <FaTablets />;
    case "syrup":
      return <FaFlask />;
    case "capsule":
      return <FaCapsules />;
    case "injection":
      return <FaSyringe />;
    case "vitamins":
      return <FaPills />;
    default:
      return <FaPlus />;
  }
};

const CategorySection = () => {
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/categories`);
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch categories");
        }

        const categoriesWithIcons = response.data.data.map(category => ({
          ...category,
          categoryName: category.categoryName.trim(),
          icon: getCategoryIcon(category.categoryName.trim())
        }));
        
        return categoriesWithIcons;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Medicine Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="medical-card p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Medicine Categories
          </h2>
          <p className="text-gray-600 text-lg">
            Browse our wide range of healthcare products by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id || category._id}
              to={`/category/${category.categoryName.toLowerCase()}`}
              className="medical-card p-6 hover:scale-105 transition-transform duration-300 group"
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={category.categoryImage}
                  alt={category.categoryName}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-medical-primary text-white p-3 rounded-full">
                  {category.icon}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {category.categoryName}
                </h3>
                <p className="text-medical-secondary font-medium">
                  {category.medicineCount} medicines available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
