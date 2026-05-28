import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  projectService,
  type CreateProjectPayload,
  type ProjectListParams,
  type UpdateProjectPayload,
} from '@/services/projectService';

export const projectKeys = {
  all: ['projects'] as const,
  list: (params?: ProjectListParams) => [...projectKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export function useProjects(params?: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.list(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.create(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      if (project.id) {
        queryClient.setQueryData(projectKeys.detail(project.id), project);
      }
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) => projectService.update(id, payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      if (project.id) {
        queryClient.setQueryData(projectKeys.detail(project.id), project);
      }
    },
  });
}
