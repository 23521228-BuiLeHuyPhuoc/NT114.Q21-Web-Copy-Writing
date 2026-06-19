import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  systemSettingsService,
  type UpdateSystemSettingsPayload,
} from '@/services/systemSettingsService';

export const systemSettingsKeys = {
  all: ['systemSettings'] as const,
  publicStatus: () => [...systemSettingsKeys.all, 'publicStatus'] as const,
  admin: () => [...systemSettingsKeys.all, 'admin'] as const,
};

export function usePublicSystemStatus(enabled = true) {
  return useQuery({
    queryKey: systemSettingsKeys.publicStatus(),
    queryFn: () => systemSettingsService.getPublicStatus(),
    enabled,
    staleTime: 30_000,
  });
}

export function useAdminSystemSettings() {
  return useQuery({
    queryKey: systemSettingsKeys.admin(),
    queryFn: () => systemSettingsService.getAdminSettings(),
  });
}

export function useUpdateAdminSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSystemSettingsPayload) => systemSettingsService.updateAdminSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(systemSettingsKeys.admin(), settings);
      queryClient.setQueryData(systemSettingsKeys.publicStatus(), settings);
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.all });
    },
  });
}
