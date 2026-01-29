import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Subsidiary } from "@/types/models";

// Fetch list of subsidiaries with filters
export function useSubsidiaries(filters: {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["subsidiaries", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/subsidiaries", { params: filters });
      return data;
    },
  });
}

// Fetch single subsidiary
export function useSubsidiary(id: string) {
  return useQuery({
    queryKey: ["subsidiary", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/subsidiaries/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create subsidiary
export function useCreateSubsidiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subsidiary: Partial<Subsidiary>) => {
      const { data } = await apiClient.post("/subsidiaries", subsidiary);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
    },
  });
}

// Update subsidiary
export function useUpdateSubsidiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...subsidiary }: Partial<Subsidiary> & { id: string }) => {
      const { data } = await apiClient.patch(`/subsidiaries/${id}`, subsidiary);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
    },
  });
}

// Delete subsidiary
export function useDeleteSubsidiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/subsidiaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
    },
  });
}

// Toggle subsidiary active status
export function useToggleSubsidiaryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await apiClient.patch(`/subsidiaries/${id}`, { is_active: isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
    },
  });
}
