import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiKeyService, type CreateApiKeyPayload } from '@/services/apiKeyService';

export const apiKeyKeys = {
  all: ['apiKeys'] as const,
  keys: () => [...apiKeyKeys.all, 'keys'] as const,
  logs: () => [...apiKeyKeys.all, 'logs'] as const,
};

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.keys(),
    queryFn: () => apiKeyService.listKeys(),
  });
}

export function useApiKeyLogs() {
  return useQuery({
    queryKey: apiKeyKeys.logs(),
    queryFn: () => apiKeyService.listLogs(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) => apiKeyService.createKey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeyService.revokeKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
}
