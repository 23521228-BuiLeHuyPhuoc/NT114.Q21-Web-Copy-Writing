import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  plagiarismService,
  type CheckPlagiarismPayload,
  type PlagiarismHistoryParams,
} from '@/services/plagiarismService';

export const plagiarismKeys = {
  all: ['plagiarism'] as const,
  history: (params?: PlagiarismHistoryParams) => [...plagiarismKeys.all, 'history', params ?? {}] as const,
  detail: (id: string) => [...plagiarismKeys.all, 'detail', id] as const,
};

export function usePlagiarismHistory(params?: PlagiarismHistoryParams) {
  return useQuery({
    queryKey: plagiarismKeys.history(params),
    queryFn: () => plagiarismService.list(params),
  });
}

export function usePlagiarismResults() {
  return usePlagiarismHistory({ limit: 5 });
}

export function usePlagiarismReport(id: string) {
  return useQuery({
    queryKey: plagiarismKeys.detail(id),
    queryFn: () => plagiarismService.get(id),
    enabled: Boolean(id),
  });
}

export function useCheckPlagiarism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckPlagiarismPayload) => plagiarismService.check(payload),
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: plagiarismKeys.all });
      if (report.id) {
        queryClient.setQueryData(plagiarismKeys.detail(report.id), report);
      }
    },
  });
}
