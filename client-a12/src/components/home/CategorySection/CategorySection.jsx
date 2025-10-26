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
    <section id="categories" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="heading-primary mb-3 sm:mb-4">
            Browse by Category 🏥
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Find the right medicine quickly by browsing our organized categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id || category._id}
              to={`/category/${category.categoryName.toLowerCase()}`}
              className="medical-card overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative overflow-hidden h-40 sm:h-48 lg:h-56">
                <img
                  src={category.categoryImage}
                  alt={category.categoryName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-blue-500 text-white p-2.5 sm:p-3 rounded-full shadow-lg text-xl sm:text-2xl">
                  {category.icon}
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <h3 className="heading-tertiary mb-2 group-hover:text-blue-600 transition-colors">
                  {category.categoryName}
                </h3>
                <p className="text-small text-blue-600 font-semibold flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
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
