import { createBrowserRouter } from "react-router";
import App from "../App";

// Home
import HomePage from "../layouts/home/HomePage.jsx";

// Auth Pages
import Register from "../pages/auth/Register.jsx";
import LogIn from "../pages/auth/LogIn.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";

// Error Pages
import ErrorFound from "../pages/errors/ErrorFound.jsx";

// Private Route
import PrivateRoute from "./PrivateRoute.jsx";

// Medicine Pages
import ShopPage from "../pages/shop/ShopPage.jsx";
import CartPage from "../pages/cart/CartPage.jsx";
import CheckoutPage from "../pages/checkout/CheckoutPage.jsx";
import InvoicePage from "../pages/invoice/InvoicePage.jsx";
import CategoryPage from "../pages/category/CategoryPage.jsx";

// Dashboard Layout and Pages
import DashboardLayout from "../layouts/dashboard/DashboardLayout.jsx";

// Admin Dashboard
import AdminDashboard from "../pages/dashboard/admin/AdminDashboard.jsx";
import ManageUsers from "../pages/dashboard/admin/ManageUsers.jsx";
import ManageCategories from "../pages/dashboard/admin/ManageCategories.jsx";
import PaymentManagement from "../pages/dashboard/admin/PaymentManagement.jsx";
import SalesReport from "../pages/dashboard/admin/SalesReport.jsx";
import ManageBanner from "../pages/dashboard/admin/ManageBanner.jsx";

// Seller Dashboard
import SellerDashboard from "../pages/dashboard/seller/SellerDashboard.jsx";
import ManageMedicines from "../pages/dashboard/seller/ManageMedicines.jsx";
import PaymentHistory from "../pages/dashboard/seller/PaymentHistory.jsx";
import AskForAdvertisement from "../pages/dashboard/seller/AskForAdvertisement.jsx";

// User Dashboard
import UserDashboard from "../pages/dashboard/user/UserDashboard.jsx";
import UserPaymentHistory from "../pages/dashboard/user/UserPaymentHistory.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorFound />,
    children: [
      { index: true, element: <HomePage /> },

      // Public Routes
      { path: "shop", element: <ShopPage /> },
      { path: "category/:categoryName", element: <CategoryPage /> },
      { path: "login", element: <LogIn /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },

      // Private Routes
      {
        path: "cart",
        element: (
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: "invoice",
        element: (
          <PrivateRoute>
            <InvoicePage />
          </PrivateRoute>
        ),
      },
      // Error Route
      { path: "*", element: <ErrorFound /> },
    ],
  },

  // Dashboard Routes with Role Protection
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorFound />,
    children: [
      // Admin Dashboard Routes
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "admin/users",
        element: <ManageUsers />,
      },
      {
        path: "admin/categories",
        element: <ManageCategories />,
      },
      {
        path: "admin/payments",
        element: <PaymentManagement />,
      },
      {
        path: "admin/sales-report",
        element: <SalesReport />,
      },
      {
        path: "admin/banner",
        element: <ManageBanner />,
      },

      // Seller Dashboard Routes
      {
        path: "seller",
        element: <SellerDashboard />,
      },
      {
        path: "seller/medicines",
        element: <ManageMedicines />,
      },
      {
        path: "seller/payments",
        element: <PaymentHistory />,
      },
      {
        path: "seller/advertise",
        element: <AskForAdvertisement />,
      },

      // User Dashboard Routes
      {
        path: "user",
        element: <UserDashboard />,
      },
      {
        path: "user/payments",
        element: <UserPaymentHistory />,
      },
    ],
  },
]);

export default router;
