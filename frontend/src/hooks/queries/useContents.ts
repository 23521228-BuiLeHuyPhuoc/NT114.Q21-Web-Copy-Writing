import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentService, type ContentListParams } from '@/services/contentService';

export const contentKeys = {
  all: ['contents'] as const,
  list: (params?: ContentListParams) => [...contentKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...contentKeys.all, 'detail', id] as const,
};

export function useContents(params?: ContentListParams) {
  return useQuery({
    queryKey: contentKeys.list(params),
    queryFn: () => contentService.list(params),
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
      if (result.content.id) {
        queryClient.setQueryData(contentKeys.detail(result.content.id), result.content);
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
