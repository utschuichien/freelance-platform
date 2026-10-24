import { ProjectFilterParams } from '@/types/project';
import { FreelancerFilterParams } from '@/types/user';

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (scope: 'my' | 'all', filters?: ProjectFilterParams) =>
      [...queryKeys.projects.lists(), scope, filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  freelancers: {
    all: ['freelancers'] as const,
    lists: () => [...queryKeys.freelancers.all, 'list'] as const,
    list: (filters?: FreelancerFilterParams) =>
      [...queryKeys.freelancers.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.freelancers.all, 'detail', id] as const,
    reviews: (id: string) => [...queryKeys.freelancers.all, 'reviews', id] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    list: () => [...queryKeys.contracts.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.contracts.all, 'detail', id] as const,
    dispute: (id: string) => [...queryKeys.contracts.all, 'dispute', id] as const,
    reviews: (id: string) => [...queryKeys.contracts.all, 'reviews', id] as const,
  },
  wallet: {
    all: ['wallet'] as const,
  },
  profile: {
    all: ['profile'] as const,
    me: ['profile', 'me'] as const,
    reviews: () => [...queryKeys.profile.all, 'reviews'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
  },
  chat: {
    all: ['chat'] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
    messages: (conversationId: string) => [...queryKeys.chat.all, 'messages', conversationId] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: (filters?: Record<string, any>) => [...queryKeys.admin.all, 'users', filters] as const,
    finance: () => [...queryKeys.admin.all, 'finance'] as const,
    withdrawals: (page?: string | number) => [...queryKeys.admin.all, 'withdrawals', page] as const,
    disputes: (status?: string) => [...queryKeys.admin.all, 'disputes', status] as const,
    disputeDetail: (id: string) => [...queryKeys.admin.all, 'dispute', id] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
  },
};
