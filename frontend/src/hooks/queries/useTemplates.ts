import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templateService, type CreateTemplatePayload, type TemplateListParams } from '@/services/templateService';

export const templateKeys = {
  all: ['templates'] as const,
  list: (params?: TemplateListParams) => [...templateKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
};

export function useTemplates(params?: TemplateListParams) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => templateService.list(params),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templateService.get(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => templateService.create(payload),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      if (template.id) {
        queryClient.setQueryData(templateKeys.detail(template.id), template);
      }
    },
  });
}
