import { useQuery } from '@tanstack/react-query';
import { billingService } from '@/services/billingService';

export const billingKeys = {
  all: ['billing'] as const,
  me: () => [...billingKeys.all, 'me'] as const,
};

export function useMyBilling() {
  return useQuery({
    queryKey: billingKeys.me(),
    queryFn: () => billingService.me(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
