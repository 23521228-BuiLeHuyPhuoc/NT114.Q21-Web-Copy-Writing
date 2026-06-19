import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminPlanService,
  type UpsertAdminPlanPayload,
} from '@/services/adminPlanService';

export const adminPlanKeys = {
  all: ['adminPlans'] as const,
  list: () => [...adminPlanKeys.all, 'list'] as const,
  trash: () => [...adminPlanKeys.all, 'trash'] as const,
};

function invalidateAdminPlans(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: adminPlanKeys.list(),
    queryFn: () => adminPlanService.list(),
  });
}

export function useAdminPlanTrash() {
  return useQuery({
    queryKey: adminPlanKeys.trash(),
    queryFn: () => adminPlanService.listTrash(),
  });
}

export function useCreateAdminPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertAdminPlanPayload) => adminPlanService.create(payload),
    onSuccess: () => invalidateAdminPlans(queryClient),
  });
}

export function useUpdateAdminPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertAdminPlanPayload }) => (
      adminPlanService.update(id, payload)
    ),
    onSuccess: () => invalidateAdminPlans(queryClient),
  });
}

export function useRemoveAdminPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPlanService.remove(id),
    onSuccess: () => invalidateAdminPlans(queryClient),
  });
}

export function useRestoreAdminPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPlanService.restore(id),
    onSuccess: () => invalidateAdminPlans(queryClient),
  });
}

export function usePermanentDeleteAdminPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPlanService.permanentDelete(id),
    onSuccess: () => invalidateAdminPlans(queryClient),
  });
}

export function usePermanentDeleteAllAdminPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => adminPlanService.permanentDeleteMany(ids),
    onSettled: () => invalidateAdminPlans(queryClient),
  });
}
