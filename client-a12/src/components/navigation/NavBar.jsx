import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useUserRole } from "../../hooks/useUserRole";
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
  const { userRole } = useUserRole();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { cartCount } = useCart();

  // Track scroll position for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["why-choose-us", "customer-reviews"];
      const scrollPosition = window.scrollY + 100; // offset for navbar

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler
  const handleSmoothScroll = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = 64; // navbar height
      const sectionTop = section.offsetTop - navbarHeight;
      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  // Get profile path based on role
  const getProfilePath = () => {
    if (!currentUser) return "/login";
    switch (userRole) {
      case "admin":
        return "/dashboard/admin/profile";
      case "seller":
        return "/dashboard/seller/profile";
      case "user":
      default:
        return "/dashboard/user/profile";
    }
  };

  const navLinks = !currentUser
    ? [
        { to: "/", label: "Home" },
        { to: "/shop", label: "Shop" },
        { to: "/about", label: "About Us" },
        { to: "/discounts", label: "Discounts" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/shop", label: "Shop" },
        { to: "/about", label: "About Us" },
        { to: "/discounts", label: "Discounts" },
        { to: "/cart", label: `Cart${cartCount ? ` (${cartCount})` : ""}` },
        { to: "/checkout", label: "Checkout" },
        { to: getProfilePath(), label: "Profile" },
      ];

  const handleLogout = () => {
    logout()
      .then(() => {})
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

        return response.data.data.map((category) => ({
          name: category.categoryName.trim(),
          path: `/category/${category.categoryName.toLowerCase().trim()}`,
          icon: getCategoryIcon(category.categoryName.trim()),
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

  return (
    <nav className="fixed top-0 inset-x-0 z-50 medical-nav text-white shadow">
      <div className="container mx-auto px-4 ">
        {/* Bar height */}
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/icon.png" alt="Oshudh" className="h-8 w-8 mr-2" />
              <span className="font-bold text-lg">Oshudh</span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <ul className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => {
              const isScrollLink = link.to.includes("#");
              const sectionId = isScrollLink ? link.to.split("#")[1] : "";
              const isActive = isScrollLink 
                ? activeSection === sectionId 
                : location.pathname === link.to;

              return (
                <li key={link.to}>
                  {isScrollLink ? (
                    <a
                      href={link.to}
                      onClick={(e) => handleSmoothScroll(e, sectionId)}
                      className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                        isActive ? "bg-white/15" : "hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium ${
                          isActive ? "bg-white/15" : "hover:bg-white/10"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  )}
                </li>
              );
            })}

            {/* Categories dropdown kept for desktop hover */}
            <li
              className="relative"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 flex items-center">
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
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1 text-gray-700 ">
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
          </ul>

          {/* Right: Language + Auth */}
          <div className="flex items-center">
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

            {/* Auth */}
            <div className="ml-2">
              {!currentUser ? (
                <div className="flex items-center gap-2">
                  {/* Logged-out: keep CTA minimal */}
                  <Link
                    to="/login"
                    className="btn btn-sm bg-white text-medical-primary border-none hover:bg-gray-100"
                  >
                    Join Us
                  </Link>
                </div>
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
                    className="menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow bg-white rounded-box w-60 text-gray-700"
                  >
                    <li className="p-2 font-semibold border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        <span>
                          {currentUser.displayName ||
                            currentUser.email ||
                            "User"}
                        </span>
                      </div>
                    </li>
                    <div className="divider my-1"></div>
                    {/* Profile Link - Most Important */}
                    <li>
                      <Link
                        to={getProfilePath()}
                        className="flex items-center gap-2 font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <FaUser />
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 hover:bg-gray-50"
                      >
                        <FaTachometerAlt />
                        Dashboard
                      </Link>
                    </li>
                    <div className="divider my-1"></div>
                    {/* Protected quick links */}
                    <li className="menu-title">Quick Access</li>
                    <li>
                      <Link to="/cart">🛒 Cart</Link>
                    </li>
                    <li>
                      <Link to="/checkout">💳 Checkout</Link>
                    </li>
                    <li>
                      <Link to="/invoice">📄 Invoice</Link>
                    </li>
                    <div className="divider my-1"></div>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left text-blue-600 hover:bg-blue-50"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-2 btn btn-ghost btn-circle text-white"
              onClick={() => setIsMobileMenuOpen((s) => !s)}
              aria-label="Toggle Menu"
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3">
            <ul className="px-2 pt-2 space-y-1">
              {navLinks.map((link) => {
                const isScrollLink = link.to.includes("#");
                const sectionId = isScrollLink ? link.to.split("#")[1] : "";
                const isActive = isScrollLink 
                  ? activeSection === sectionId 
                  : location.pathname === link.to;

                return (
                  <li key={link.to}>
                    {isScrollLink ? (
                      <a
                        href={link.to}
                        onClick={(e) => handleSmoothScroll(e, sectionId)}
                        className={`block px-3 py-2 rounded-md text-sm cursor-pointer ${
                          isActive ? "bg-white/15" : "hover:bg-white/10"
                        }`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-sm ${
                            isActive ? "bg-white/15" : "hover:bg-white/10"
                          }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    )}
                  </li>
                );
              })}

              {/* Mobile categories */}
              <li className="px-3 py-2">
                <span className="text-sm font-medium">Categories:</span>
                <ul className="ml-2 mt-2 space-y-1">
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
      </div>
    </nav>
  );
};

export default NavBar;
