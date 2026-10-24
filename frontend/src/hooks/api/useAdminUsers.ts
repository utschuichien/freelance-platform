import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  kycStatus: string;
}

export interface PaginatedAdminUsers {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAdminUsers = (page: number = 1, role?: string, search?: string, status?: string) => {
  return useQuery({
    queryKey: queryKeys.admin.users({ page, role, search, status }),
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString() });
      if (role) params.set('role', role);
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const { data } = await axiosInstance.get(`/admin/users?${params.toString()}`);
      return data as PaginatedAdminUsers;
    }
  });
};

export const useUpdateKycStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
      const { data } = await axiosInstance.patch(`/admin/users/${userId}/kyc`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    }
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      const { data } = await axiosInstance.patch(`/admin/users/${userId}/status`, { isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    }
  });
};
