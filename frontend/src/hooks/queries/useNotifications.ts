import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService, type NotificationListParams } from '@/services/notificationService';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationListParams) => [...notificationKeys.all, 'list', params || {}] as const,
  header: () => [...notificationKeys.all, 'header'] as const,
};

export function useNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
  });
}

export function useHeaderNotifications() {
  return useQuery({
    queryKey: notificationKeys.header(),
    queryFn: () => notificationService.listHeader(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
