import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface DashboardStats {
  walletBalance: number;
  pendingInvoices: number;
  pendingInvoicesTotal: number;
  payoutsThisMonth: number;
  payoutsThisMonthTotal: number;
  activeEmployees: number;
  subsidiariesCount: number;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
      return data;
    },
  });
}
