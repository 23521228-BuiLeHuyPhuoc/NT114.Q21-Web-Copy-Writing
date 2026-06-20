import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  systemSettingsService,
  type UpdateEnvSettingsPayload,
  type UpdateSystemSettingsPayload,
} from '@/services/systemSettingsService';

export const systemSettingsKeys = {
  all: ['systemSettings'] as const,
  publicStatus: () => [...systemSettingsKeys.all, 'publicStatus'] as const,
  admin: () => [...systemSettingsKeys.all, 'admin'] as const,
  adminEnv: () => [...systemSettingsKeys.all, 'adminEnv'] as const,
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

export function useAdminEnvSettings() {
  return useQuery({
    queryKey: systemSettingsKeys.adminEnv(),
    queryFn: () => systemSettingsService.getAdminEnvSettings(),
  });
}

export function useUpdateAdminEnvSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEnvSettingsPayload) => systemSettingsService.updateAdminEnvSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(systemSettingsKeys.adminEnv(), settings);
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.admin() });
    },
  });
}

export function useResetAdminQuotas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemSettingsService.resetQuotas(),
    onSuccess: (settings) => {
      queryClient.setQueryData(systemSettingsKeys.admin(), settings);
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      queryClient.invalidateQueries({ queryKey: ['fineTuning'] });
    },
  });
}
