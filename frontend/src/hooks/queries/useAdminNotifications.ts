import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminNotificationService,
  type AdminNotificationListParams,
} from '@/services/adminNotificationService';

export const adminNotificationKeys = {
  all: ['adminNotifications'] as const,
  list: (params?: AdminNotificationListParams) => [...adminNotificationKeys.all, 'list', params || {}] as const,
  header: () => [...adminNotificationKeys.all, 'header'] as const,
};

export function useAdminNotifications(params?: AdminNotificationListParams) {
  return useQuery({
    queryKey: adminNotificationKeys.list(params),
    queryFn: () => adminNotificationService.list(params),
  });
}

export function useAdminHeaderNotifications(enabled = true) {
  return useQuery({
    queryKey: adminNotificationKeys.header(),
    queryFn: () => adminNotificationService.listHeader(),
    enabled,
  });
}

export function useMarkAdminNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminNotificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNotificationKeys.all });
    },
  });
}

export function useMarkAllAdminNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminNotificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminNotificationKeys.all });
    },
  });
}
