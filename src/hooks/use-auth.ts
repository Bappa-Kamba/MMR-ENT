import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { message } from "antd";
import { useRouter } from "next/navigation";

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout: storeLogout,
  } = useAuthStore();
  const router = useRouter();

  const loginUser = async (username: string, password: string) => {
    try {
      const { data } = await apiClient.post("/auth/login", {
        username,
        password,
      });
      login(data.user, data.access_token);
      message.success("Login successful");
      router.push("/dashboard");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Ignore logout errors
      console.log("Error occured", error);
    } finally {
      storeLogout();
      router.push("/login");
      message.info("Logged out successfully");
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login: loginUser,
    logout: logoutUser,
  };
}
