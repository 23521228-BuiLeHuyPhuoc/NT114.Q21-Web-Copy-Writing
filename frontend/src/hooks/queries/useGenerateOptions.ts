import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generateOptionService,
  type GenerateOptionGroup,
  type UpsertGenerateOptionPayload,
} from '@/services/generateOptionService';

export const generateOptionKeys = {
  all: ['generateOptions'] as const,
  activeGroups: () => [...generateOptionKeys.all, 'activeGroups'] as const,
  admin: (group: GenerateOptionGroup) => [...generateOptionKeys.all, 'admin', group] as const,
  trash: (group: GenerateOptionGroup) => [...generateOptionKeys.all, 'trash', group] as const,
};

function invalidateGenerateOptions(queryClient: ReturnType<typeof useQueryClient>, group?: GenerateOptionGroup) {
  queryClient.invalidateQueries({ queryKey: generateOptionKeys.activeGroups() });
  if (group) {
    queryClient.invalidateQueries({ queryKey: generateOptionKeys.admin(group) });
    queryClient.invalidateQueries({ queryKey: generateOptionKeys.trash(group) });
  } else {
    queryClient.invalidateQueries({ queryKey: generateOptionKeys.all });
  }
}

export function useGenerateOptions() {
  return useQuery({
    queryKey: generateOptionKeys.activeGroups(),
    queryFn: () => generateOptionService.listActiveGroups(),
  });
}

export function useAdminGenerateOptions(group: GenerateOptionGroup) {
  return useQuery({
    queryKey: generateOptionKeys.admin(group),
    queryFn: () => generateOptionService.listAdmin(group),
  });
}

export function useAdminGenerateOptionTrash(group: GenerateOptionGroup) {
  return useQuery({
    queryKey: generateOptionKeys.trash(group),
    queryFn: () => generateOptionService.listTrash(group),
  });
}

export function useCreateGenerateOption(group: GenerateOptionGroup) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertGenerateOptionPayload) => generateOptionService.create(group, payload),
    onSuccess: () => invalidateGenerateOptions(queryClient, group),
  });
}

export function useUpdateGenerateOption(group: GenerateOptionGroup) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertGenerateOptionPayload }) => (
      generateOptionService.update(group, id, payload)
    ),
    onSuccess: () => invalidateGenerateOptions(queryClient, group),
  });
}

export function useRemoveGenerateOption(group: GenerateOptionGroup) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => generateOptionService.remove(group, id),
    onSuccess: () => invalidateGenerateOptions(queryClient, group),
  });
}

export function useRestoreGenerateOption(group: GenerateOptionGroup) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => generateOptionService.restore(group, id),
    onSuccess: () => invalidateGenerateOptions(queryClient, group),
  });
}

export function usePermanentDeleteGenerateOption(group: GenerateOptionGroup) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => generateOptionService.permanentDelete(group, id),
    onSuccess: () => invalidateGenerateOptions(queryClient, group),
  });
}
