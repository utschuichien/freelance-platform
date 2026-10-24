import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

export interface AdminDispute {
  id: string;
  contractId: string;
  milestoneId?: string;
  initiatorId: string;
  initiatorRole: string;
  initiatorName?: string;
  clientName?: string;
  freelancerName?: string;
  projectTitle?: string;
  reason: string;
  evidenceUrls?: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CANCELLED';
  resolution?: 'REFUND_CLIENT' | 'RELEASE_FREELANCER' | 'SPLIT';
  adminNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  contract?: any;
}

export const useAdminDisputes = (status?: string) => {
  return useQuery({
    queryKey: queryKeys.admin.disputes(status),
    queryFn: async () => {
      const url = status ? `/admin/disputes?status=${status}` : '/admin/disputes';
      const { data } = await axiosInstance.get(url);
      return data as AdminDispute[];
    },
  });
};

export const useAdminDisputeDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.admin.disputeDetail(id),
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/disputes/${id}`);
      return data as AdminDispute;
    },
    enabled: !!id,
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      resolution,
      adminNote,
      clientRefundAmount,
      freelancerReleaseAmount,
    }: {
      id: string;
      resolution: 'REFUND_CLIENT' | 'RELEASE_FREELANCER' | 'SPLIT';
      adminNote: string;
      clientRefundAmount?: number;
      freelancerReleaseAmount?: number;
    }) => {
      const { data } = await axiosInstance.post(`/admin/disputes/${id}/resolve`, {
        resolution,
        adminNote,
        clientRefundAmount,
        freelancerReleaseAmount,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.disputeDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
};
