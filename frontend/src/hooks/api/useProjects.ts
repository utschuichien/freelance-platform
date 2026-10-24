import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import {
  Project,
  ProjectFilterParams,
  CreateProjectPayload,
  SubmitProposalPayload,
  CursorPaginatedResponse,
} from '@/types';

export const useGetProjects = (
  myProjects: boolean = false,
  filters: ProjectFilterParams = {}
) => {
  return useInfiniteQuery<CursorPaginatedResponse<Project>>({
    queryKey: queryKeys.projects.list(myProjects ? 'my' : 'all', filters),
    queryFn: async ({ pageParam = undefined }: { pageParam?: unknown }) => {
      const endpoint = myProjects ? '/projects/my-projects' : '/projects';
      const response = await axiosInstance.get<CursorPaginatedResponse<Project>>(endpoint, {
        params: { cursor: pageParam, ...filters },
      });
      return response.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
};

export const useGetProject = (id: string) => {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<Project>(`/projects/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectPayload) => {
      const response = await axiosInstance.post<Project>('/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

export const useSubmitProposal = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitProposalPayload) => {
      const response = await axiosInstance.post(`/projects/${projectId}/proposals`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};

export const useAcceptProposal = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await axiosInstance.patch(`/projects/${projectId}/proposals/${proposalId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};
