import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface AdminDashboardData {
  totalUsers: number;
  activeProjects: number;
  totalEscrow: number;
  pendingWithdrawals: number;
  recentKycRequests: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
    kycStatus: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    userName: string;
    userEmail: string;
    amount: number;
    bankInfo: { bankName: string };
    status: string;
    createdAt: string;
  }>;
}

import { queryKeys } from '@/lib/query-keys';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/admin/dashboard');
      return data as AdminDashboardData;
    }
  });
};
