import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { useReTitle } from "re-title";
import API_CONFIG from "../../../configs/api.config";
import {
  FaUsers,
  FaSearch,
  FaUserShield,
  FaStore,
  FaUser,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const ManageUsers = () => {
  const setTitle = useReTitle();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  React.useEffect(() => {
    setTitle("Manage Users | Admin Dashboard");
  }, [setTitle]);

  // Fetch users
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", searchTerm, filterRole],
    queryFn: async () => {
      try {
        const token = await currentUser.getIdToken(true);

        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterRole !== "all") params.role = filterRole;

        const response = await axios.get(`${API_CONFIG.BASE_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params,
        });

        return response.data.data || [];
      } catch (error) {
        console.error("❌ Users fetch error:", error);
        throw error;
      }
    },
    enabled: !!currentUser,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      try {
        const token = await currentUser.getIdToken(true);

        const response = await axios.patch(
          `${API_CONFIG.BASE_URL}/admin/users/${userId}/role`,
          { role: newRole },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error("❌ Role update error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["admin-users"]);

      Swal.fire({
        icon: "success",
        title: "Role Updated!",
        text: `User role changed to ${variables.newRole} successfully`,
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    },
  });

  // Handle role change
  const handleRoleChange = (user, newRole) => {
    if (
      user.email === currentUser?.email &&
      user.role === "admin" &&
      newRole !== "admin"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Change Own Role",
        text: "You cannot demote yourself from admin role",
      });
      return;
    }

    let actionText = "";
    let confirmColor = "#2563eb";

    if (newRole === "admin") {
      actionText = "promote to Admin";
      confirmColor = "#dc2626";
    } else if (newRole === "seller") {
      actionText = "make Seller";
      confirmColor = "#059669";
    } else {
      actionText = "downgrade to User";
      confirmColor = "#6b7280";
    }

    Swal.fire({
      title: `${actionText}?`,
      html: `
        <p>Are you sure you want to <strong>${actionText}</strong> <br/>
        <strong>${user.username}</strong> (${user.email})?</p>
        <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p class="text-sm text-yellow-800">
            <strong>Current:</strong> ${user.role} → <strong>New:</strong> ${newRole}
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${actionText}!`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        updateRoleMutation.mutate({ userId: user._id, newRole });
      }
    });
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaUserShield className="text-red-600" />;
      case "seller":
        return <FaStore className="text-green-600" />;
      default:
        return <FaUser className="text-blue-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      seller: "bg-green-100 text-green-800 border-green-200",
      user: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[role]}`}
      >
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Users
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => queryClient.invalidateQueries(["admin-users"])}
            className="medical-btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaUsers className="mr-3 text-medical-primary" />
            Manage Users
          </h1>
          <p className="text-gray-600">
            Manage user roles and permissions. Total: {users.length} users
          </p>
        </div>

        {/* Live Data Indicator */}
        <div className="text-right">
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live Data
          </div>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <FaUsers className="text-3xl text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <FaUserShield className="text-3xl text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sellers</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.role === "seller").length}
              </p>
            </div>
            <FaStore className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter((u) => u.role === "user").length}
              </p>
            </div>
            <FaUser className="text-3xl text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin Only</option>
            <option value="seller">Seller Only</option>
            <option value="user">User Only</option>
          </select>

          {/* Results Count */}
          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* User Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          src={
                            user.photoURL ||
                            `https://ui-avatars.com/?name=${encodeURIComponent(
                              user.username
                            )}&background=random`
                          }
                          alt={user.username}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/?name=${encodeURIComponent(
                              user.username
                            )}&background=6366f1&color=ffffff`;
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                          {user.email === currentUser?.email && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>

                  {/* Activity Stats */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === "user" && (
                      <div>
                        <p>{user.totalOrders || 0} orders</p>
                        <p className="text-green-600">
                          ৳{user.totalSpent?.toLocaleString() || "0"}
                        </p>
                      </div>
                    )}
                    {user.role === "seller" && (
                      <div>
                        <p>{user.totalMedicines || 0} medicines</p>
                        <p className="text-green-600">
                          ৳{user.totalSales?.toLocaleString() || "0"}
                        </p>
                      </div>
                    )}
                    {user.role === "admin" && (
                      <div>
                        <p className="text-red-600 font-medium">System Admin</p>
                        <p className="text-xs text-gray-500">Full Access</p>
                      </div>
                    )}
                  </td>

                  {/* Join Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Role Change Dropdown */}
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className={`btn btn-sm btn-outline ${
                            updateRoleMutation.isPending ? "loading" : ""
                          }`}
                          disabled={updateRoleMutation.isPending}
                        >
                          <FaEdit className="mr-1" />
                          Change Role
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-2 z-10"
                        >
                          {user.role !== "admin" && (
                            <li>
                              <button
                                onClick={() => handleRoleChange(user, "admin")}
                                className="text-red-600 hover:bg-red-50"
                                disabled={updateRoleMutation.isPending}
                              >
                                <FaUserShield />
                                Promote to Admin
                              </button>
                            </li>
                          )}
                          {user.role !== "seller" && (
                            <li>
                              <button
                                onClick={() => handleRoleChange(user, "seller")}
                                className="text-green-600 hover:bg-green-50"
                                disabled={updateRoleMutation.isPending}
                              >
                                <FaStore />
                                Make Seller
                              </button>
                            </li>
                          )}
                          {user.role !== "user" && (
                            <li>
                              <button
                                onClick={() => handleRoleChange(user, "user")}
                                className="text-blue-600 hover:bg-blue-50"
                                disabled={updateRoleMutation.isPending}
                              >
                                <FaUser />
                                Downgrade to User
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No users exist in the system yet."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="medical-btn-primary"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <FaUserShield className="mr-2" />
          Role Management Instructions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <strong className="text-red-600">Admin:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Full system access</li>
              <li>• Manage all users</li>
              <li>• View admin dashboard</li>
            </ul>
          </div>
          <div>
            <strong className="text-green-600">Seller:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Manage medicines</li>
              <li>• View sales reports</li>
              <li>• Request advertisements</li>
            </ul>
          </div>
          <div>
            <strong className="text-blue-600">User:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Purchase medicines</li>
              <li>• View order history</li>
              <li>• Limited access</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ Warning:</strong> You cannot demote yourself from admin
            role. Role changes are immediate and affect user permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
