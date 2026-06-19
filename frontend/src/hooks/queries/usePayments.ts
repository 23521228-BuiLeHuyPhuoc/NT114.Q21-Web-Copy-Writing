import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminPlanKeys } from '@/hooks/queries/useAdminPlans';
import { billingKeys } from '@/hooks/queries/useBilling';
import { fineTuningKeys } from '@/hooks/queries/useFineTuning';
import { paymentService } from '@/services/paymentService';

export const paymentKeys = {
  all: ['payments'] as const,
  list: () => [...paymentKeys.all, 'list'] as const,
  revenue: () => [...paymentKeys.all, 'revenue'] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.list(),
    queryFn: () => paymentService.list(),
  });
}

export function useRevenue() {
  return useQuery({
    queryKey: paymentKeys.revenue(),
    queryFn: () => paymentService.getRevenue(),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPlanKeys.all });
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      queryClient.invalidateQueries({ queryKey: fineTuningKeys.quotas() });
    },
  });
}
