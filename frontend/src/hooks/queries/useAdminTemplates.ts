import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminTemplateService,
  type AdminTemplateListParams,
  type UpsertAdminTemplatePayload,
} from '@/services/adminTemplateService';

export const adminTemplateKeys = {
  all: ['adminTemplates'] as const,
  list: () => [...adminTemplateKeys.all, 'list'] as const,
  trash: () => [...adminTemplateKeys.all, 'trash'] as const,
};

function invalidateAdminTemplates(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminTemplateKeys.all });
}

export function useAdminTemplates(params?: AdminTemplateListParams) {
  return useQuery({
    queryKey: [...adminTemplateKeys.list(), params || {}] as const,
    queryFn: () => adminTemplateService.list(params),
  });
}

export function useAdminTemplateTrash(params?: AdminTemplateListParams) {
  return useQuery({
    queryKey: [...adminTemplateKeys.trash(), params || {}] as const,
    queryFn: () => adminTemplateService.listTrash(params),
  });
}

export function useCreateAdminTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertAdminTemplatePayload) => adminTemplateService.create(payload),
    onSuccess: () => invalidateAdminTemplates(queryClient),
  });
}

export function useUpdateAdminTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertAdminTemplatePayload }) => (
      adminTemplateService.update(id, payload)
    ),
    onSuccess: () => invalidateAdminTemplates(queryClient),
  });
}

export function useRemoveAdminTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminTemplateService.remove(id),
    onSuccess: () => invalidateAdminTemplates(queryClient),
  });
}

export function useRestoreAdminTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminTemplateService.restore(id),
    onSuccess: () => invalidateAdminTemplates(queryClient),
  });
}

export function usePermanentDeleteAdminTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminTemplateService.permanentDelete(id),
    onSuccess: () => invalidateAdminTemplates(queryClient),
  });
}

export function usePermanentDeleteAllAdminTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => adminTemplateService.permanentDeleteMany(ids),
    onSettled: () => invalidateAdminTemplates(queryClient),
  });
}
