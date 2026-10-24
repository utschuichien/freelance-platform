import { axiosInstance } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export interface DashboardOverview {
  wallet: {
    availableBalance: number;
    escrowBalance: number;
  };
  milestones: any[];
  projects: any[];
  stats: {
    activeProjectsCount: number;
    activeContractsCount: number;
    milestonesCount: number;
    paidAmount: number;
    pendingProposals: number;
  };
}

export const useDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: async (): Promise<DashboardOverview> => {
      const response = await axiosInstance.get('/dashboard/overview');
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};
