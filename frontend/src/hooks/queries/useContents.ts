import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  contentService,
  type ContentListParams,
  type CreateContentPayload,
  type UpdateContentPayload,
} from '@/services/contentService';
import { projectKeys } from '@/hooks/queries/useProjects';
import { templateKeys } from '@/hooks/queries/useTemplates';
import { notificationKeys } from '@/hooks/queries/useNotifications';
import { billingKeys } from '@/hooks/queries/useBilling';

export const contentKeys = {
  all: ['contents'] as const,
  list: (params?: ContentListParams) => [...contentKeys.all, 'list', params ?? {}] as const,
  trash: (params?: ContentListParams) => [...contentKeys.all, 'trash', params ?? {}] as const,
  detail: (id: string) => [...contentKeys.all, 'detail', id] as const,
};

export function useContents(params?: ContentListParams) {
  return useQuery({
    queryKey: contentKeys.list(params),
    queryFn: () => contentService.list(params),
  });
}

export function useTrashContents(params?: ContentListParams, enabled = true) {
  return useQuery({
    queryKey: contentKeys.trash(params),
    queryFn: () => contentService.listTrash(params),
    enabled,
  });
}

export function useContent(id: string) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => contentService.get(id),
    enabled: !!id,
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contentService.generate,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      if (result.content.id) {
        queryClient.setQueryData(contentKeys.detail(result.content.id), result.content);
      }
    },
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContentPayload) => contentService.create(payload),
    onSuccess: (content) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      if (content.id) {
        queryClient.setQueryData(contentKeys.detail(content.id), content);
      }
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContentPayload }) => contentService.update(id, payload),
    onSuccess: (content) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      if (content.id) {
        queryClient.setQueryData(contentKeys.detail(content.id), content);
      }
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentService.remove(id),
    onSuccess: (content) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      if (content.id) {
        queryClient.removeQueries({ queryKey: contentKeys.detail(content.id) });
      }
    },
  });
}

export function useRestoreContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentService.restore(id),
    onSuccess: (content) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      if (content.id) {
        queryClient.setQueryData(contentKeys.detail(content.id), content);
      }
    },
  });
}

export function usePermanentDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contentService.permanentDelete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.removeQueries({ queryKey: contentKeys.detail(id) });
    },
  });
}
