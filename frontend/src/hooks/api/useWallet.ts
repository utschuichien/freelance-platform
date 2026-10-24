import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import { Wallet } from '@/types';

export const useGetWallet = (enabled: boolean = true) => {
  return useQuery<Wallet>({
    queryKey: queryKeys.wallet.all,
    queryFn: async () => {
      const response = await axiosInstance.get<Wallet>('/payments/wallet');
      return response.data;
    },
    enabled,
    staleTime: 60 * 1000,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const response = await axiosInstance.post<Wallet>('/payments/deposit', { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const response = await axiosInstance.post<Wallet>('/payments/withdraw', { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};
