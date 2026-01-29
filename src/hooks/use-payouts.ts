import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Payout } from "@/types/models";

// Fetch list of payouts with filters
export function usePayouts(filters: {
  search?: string;
  subsidiary?: string | number;
  status?: string | number;
  dateRange?: [string | null, string | null] | null;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["payouts", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/payouts", { params: filters });
      return data;
    },
  });
}

// Fetch single payout
export function usePayout(id: string) {
  return useQuery({
    queryKey: ["payout", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payouts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Retry failed payout
export function useRetryPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/payouts/${id}/retry`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
  });
}
