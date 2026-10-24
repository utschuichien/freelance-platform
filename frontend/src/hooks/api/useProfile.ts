import { axiosInstance } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserReviewsResponse } from '@/types';
import { queryKeys } from '@/lib/query-keys';

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  hourlyRate: number | null;
  skills: string[] | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useGetProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: async (): Promise<UserProfile> => {
      const { data } = await axiosInstance.get('/users/me/profile');
      return data;
    },
    enabled,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const { data } = await axiosInstance.patch('/users/me/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      toast.success('Cập nhật hồ sơ thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    },
  });
};

export const useGetMyReviews = (enabled: boolean = true) => {
  return useQuery<UserReviewsResponse>({
    queryKey: queryKeys.profile.reviews(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/users/me/reviews');
      return data;
    },
    enabled,
  });
};


