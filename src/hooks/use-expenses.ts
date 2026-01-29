import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Expense } from "@/types/models";

// Fetch list of expenses with filters
export function useExpenses(filters: {
  search?: string;
  category?: string | number;
  status?: string | number;
  dateRange?: [string | null, string | null] | null;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/expenses", { params: filters });
      return data;
    },
  });
}

// Fetch single expense
export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/expenses/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: any) => {
      const { data } = await apiClient.post("/expenses", expense);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}


// Approve expense
export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/expenses/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

// Reject expense
export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/expenses/${id}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

// Reimburse expense
export function useReimburseExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/expenses/${id}/reimburse`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
