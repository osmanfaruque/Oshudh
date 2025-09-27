import React, { useState } from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import API_CONFIG from "../../configs/api.config";
import axios from "axios";
import {
  FaShoppingCart,
  FaUserCircle,
  FaBars,
  FaUser,
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaTablets,
  FaFlask,
  FaCapsules,
  FaSyringe,
  FaPlus,
  FaPills,
} from "react-icons/fa";
import { MdLanguage } from "react-icons/md";

const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { cartCount } = useCart();
  const handleLogout = () => {
    logout()
      .then(() => {
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["nav-categories"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/categories`);
        
        if (!response.data.success) {
          throw new Error(response.data.error || "Failed to fetch categories");
        }
        
        return response.data.data.map(category => ({
          name: category.categoryName.trim(),
          path: `/category/${category.categoryName.toLowerCase().trim()}`,
          icon: getCategoryIcon(category.categoryName.trim())
        }));
      } catch (error) {
        console.error("Error fetching navbar categories:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    
    switch (name) {
      case "tablet":
        return "💊";
      case "syrup":
        return "🧴";
      case "capsule":
        return "💊";
      case "injection":
        return "💉";
      case "vitamins":
        return "🍯";
      default:
        return "➕";
    }
  };

  const navLinks = (
    <>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-medical-primary text-white bg-black"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-medical-primary text-white bg-black"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Shop
        </NavLink>
      </li>

      {/* Category Dropdown  */}
      <li
        className="relative"
        onMouseEnter={() => setIsCategoryDropdownOpen(true)}
        onMouseLeave={() => setIsCategoryDropdownOpen(false)}
      >
        <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center">
          Categories
          <svg
            className="ml-1 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isCategoryDropdownOpen && (
          <div className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.path}
                    to={category.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-medical-primary transition-colors"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  >
                    {category.icon} {category.name}
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Loading categories...
                </div>
              )}
            </div>
          </div>
        )}
      </li>
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Website Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/icon.png" alt="Oshudh" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-medical-primary">
                Oshudh
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <ul className="ml-10 flex items-baseline space-x-4">{navLinks}</ul>
          </div>

          {/* Right-side elements */}
          <div className="flex items-center">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-medical-primary transition-colors"
            >
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Language Dropdown */}
            <div className="relative ml-4">
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-sm"
                >
                  <MdLanguage size={20} />
                  <span className="ml-1">EN</span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 mt-2"
                >
                  <li>
                    <a>English</a>
                  </li>
                  <li>
                    <a>বাংলা</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* User Authentication */}
            <div className="ml-4">
              {!currentUser ? (
                <Link to="/login" className="btn btn-primary btn-sm">
                  Join Us
                </Link>
              ) : (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full overflow-hidden">
                      {currentUser.photoURL ? (
                        <img
                          alt="Profile"
                          src={currentUser.photoURL}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg"
                        style={{
                          display: currentUser.photoURL ? "none" : "flex",
                        }}
                      >
                        {currentUser.displayName
                          ? currentUser.displayName.charAt(0).toUpperCase()
                          : currentUser.email
                          ? currentUser.email.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52"
                  >
                    <li className="p-2 font-semibold">
                      {currentUser.displayName || currentUser.email || "User"}
                    </li>
                    <div className="divider my-0"></div>
                    <li>
                      <Link to="/update-profile" className="flex items-center">
                        <FaUser className="mr-2" /> Update Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard" className="flex items-center">
                        <FaTachometerAlt className="mr-2" /> Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-medical-primary"
            >
              <FaBars size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks}
            <li className="px-3 py-2">
              <span className="text-sm font-medium text-gray-700">
                Categories:
              </span>
              <ul className="ml-4 mt-2 space-y-1">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category.path}>
                      <Link
                        to={category.path}
                        className="block px-2 py-1 text-sm text-gray-600 hover:text-medical-primary"
                      >
                        {category.icon} {category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-2 py-1 text-sm text-gray-500">
                    Loading categories...
                  </li>
                )}
              </ul>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
