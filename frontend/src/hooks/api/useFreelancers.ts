import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import { FreelancerProfile, FreelancerFilterParams, CursorPaginatedResponse, UserReviewsResponse } from '@/types';

export const useGetFreelancers = (filters: FreelancerFilterParams = {}) => {
  return useInfiniteQuery<CursorPaginatedResponse<FreelancerProfile>>({
    queryKey: queryKeys.freelancers.list(filters),
    queryFn: async ({ pageParam = undefined }: { pageParam?: unknown }) => {
      const response = await axiosInstance.get<CursorPaginatedResponse<FreelancerProfile>>('/freelancers', {
        params: { cursor: pageParam, ...filters },
      });
      return response.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
};

export const useGetFreelancer = (id: string) => {
  return useQuery<FreelancerProfile>({
    queryKey: queryKeys.freelancers.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<FreelancerProfile>(`/freelancers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGetFreelancerReviews = (id: string) => {
  return useQuery<UserReviewsResponse>({
    queryKey: queryKeys.freelancers.reviews(id),
    queryFn: async () => {
      const response = await axiosInstance.get<UserReviewsResponse>(`/freelancers/${id}/reviews`);
      return response.data;
    },
    enabled: !!id,
  });
};

