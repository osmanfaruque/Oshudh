import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import API_CONFIG from "../configs/api.config";

export const useUserRole = () => {
  const { currentUser } = useAuth();

  const {
    data: userRole,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["user-role", currentUser?.email],
    enabled: !!currentUser,
    queryFn: async () => {
      if (!currentUser) throw new Error("User not logged in");
      const token = await currentUser.getIdToken(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const role = data?.data?.role || data?.role;

      if (!role || !["admin", "seller", "user"].includes(role)) {
        throw new Error("Invalid role received from server");
      }

      return role;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    userRole: userRole || null,
    loading,
    error: error ? error.message : null,
  };
};