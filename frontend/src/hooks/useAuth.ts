import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useLoginMutation = () => {
  const loginUser = useAuthStore((state) => state.loginUser);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      loginUser(data.user);
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
    },
  });
};

export const useRegisterMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đã có lỗi xảy ra');
    },
  });
};

export const useLogoutMutation = () => {
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/auth/logout');
      return response.data;
    },
    onSuccess: (data) => {
      logoutUser();
      router.push('/');
    },
    onError: () => {
      logoutUser();
      router.push('/login');
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Đã gửi mã xác nhận');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể gửi mã xác nhận');
    },
  });
};

export const useResetPasswordMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/auth/reset-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Đổi mật khẩu thành công');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Mã xác nhận không chính xác');
    },
  });
};
