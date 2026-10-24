import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';

export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: async () => {
      const { data } = await axiosInstance.get('/chat/conversations');
      return data;
    },
  });
};

export const useMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: conversationId ? queryKeys.chat.messages(conversationId) : ['chat', 'messages', 'empty'],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data } = await axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
      return data;
    },
    enabled: !!conversationId,
  });
};

export const useCreateDirectConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data } = await axiosInstance.post('/chat/conversations/direct', { targetUserId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
  });
};

export const useMarkAsRead = () => {
  return useMutation({
    mutationFn: async ({ messageId, conversationId }: { messageId: string, conversationId: string }) => {
      const { data } = await axiosInstance.post(`/chat/messages/${messageId}/read`, { conversationId });
      return data;
    }
  });
};
