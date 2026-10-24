import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

export interface FinanceStats {
  totalEscrow: number;
  totalFees: number;
  pendingWithdrawals: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const useAdminFinanceStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.finance(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/admin/finance/stats');
      return data as FinanceStats;
    }
  });
};

export interface PaginatedWithdrawals {
  data: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAdminWithdrawals = (page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.admin.withdrawals(page),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/withdrawals?page=${page}`);
      return data as PaginatedWithdrawals;
    }
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.patch(`/admin/withdrawals/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    }
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
      const { data } = await axiosInstance.patch(`/admin/withdrawals/${id}/reject`, { adminNote: reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    }
  });
};

