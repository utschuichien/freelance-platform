import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import { Contract, EnrichedContract } from '@/types';

export const useGetContracts = () => {
  return useQuery<EnrichedContract[]>({
    queryKey: queryKeys.contracts.list(),
    queryFn: async () => {
      const response = await axiosInstance.get<EnrichedContract[]>('/contracts');
      return response.data;
    },
  });
};

export const useGetContract = (id: string) => {
  return useQuery<Contract>({
    queryKey: queryKeys.contracts.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<Contract>(`/contracts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSubmitMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { notes: string; attachmentUrls?: string[] };
    }) => {
      const response = await axiosInstance.post(`/contracts/milestones/${id}/submit`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
};

export const useApproveMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.patch(`/contracts/milestones/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
    },
  });
};

export const useRequestRevision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      feedbackNotes,
    }: {
      id: string;
      feedbackNotes: string;
    }) => {
      const response = await axiosInstance.patch(
        `/contracts/milestones/${id}/request-revision`,
        { feedbackNotes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
};

export const useTerminateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => {
      const response = await axiosInstance.post(
        `/contracts/${id}/terminate`,
        { reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      rating,
      comment,
    }: {
      contractId: string;
      rating: number;
      comment?: string;
    }) => {
      const response = await axiosInstance.post(`/contracts/${contractId}/reviews`, {
        rating,
        comment,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(variables.contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancers.all });
    },
  });
};

export const useGetContractDispute = (contractId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.contracts.dispute(contractId),
    queryFn: async () => {
      const response = await axiosInstance.get(`/contracts/${contractId}/dispute`);
      return response.data;
    },
    enabled: !!contractId && enabled,
  });
};

export const useOpenDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      data,
    }: {
      contractId: string;
      data: { reason: string; evidenceUrls?: string[]; milestoneId?: string };
    }) => {
      const response = await axiosInstance.post(`/contracts/${contractId}/dispute`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(variables.contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.dispute(variables.contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
};

export const useCancelDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      contractId,
    }: {
      disputeId: string;
      contractId: string;
    }) => {
      const response = await axiosInstance.post(`/contracts/disputes/${disputeId}/cancel`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(variables.contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.dispute(variables.contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
    },
  });
};


