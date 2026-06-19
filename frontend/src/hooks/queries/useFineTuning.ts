import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fineTuningService,
  type CreateFineTuneDatasetPayload,
  type CreateFineTuneExamplePayload,
  type CreateFineTuneJobPayload,
  type FineTuneModel,
} from '@/services/fineTuningService';

export const fineTuningKeys = {
  all: ['fineTuning'] as const,
  datasets: () => [...fineTuningKeys.all, 'datasets'] as const,
  jobs: () => [...fineTuningKeys.all, 'jobs'] as const,
  models: () => [...fineTuningKeys.all, 'models'] as const,
  providers: () => [...fineTuningKeys.all, 'providers'] as const,
  quotas: () => [...fineTuningKeys.all, 'quotas'] as const,
  trainingLog: (jobId?: string) => [...fineTuningKeys.all, 'trainingLog', jobId || 'fallback'] as const,
  metrics: (jobId?: string) => [...fineTuningKeys.all, 'metrics', jobId || 'none'] as const,
  examplePairs: () => [...fineTuningKeys.all, 'examplePairs'] as const,
};

function invalidateFineTuneOverview(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: fineTuningKeys.datasets() });
  queryClient.invalidateQueries({ queryKey: fineTuningKeys.jobs() });
  queryClient.invalidateQueries({ queryKey: fineTuningKeys.models() });
  queryClient.invalidateQueries({ queryKey: fineTuningKeys.quotas() });
  queryClient.invalidateQueries({ queryKey: fineTuningKeys.examplePairs() });
}

function hasLiveFineTuneJobs(jobs?: FineTuneModel[]) {
  return Boolean(jobs?.some(job => job.status === 'training' || job.status === 'pending'));
}

export function useFineTuneDatasets() {
  return useQuery({
    queryKey: fineTuningKeys.datasets(),
    queryFn: () => fineTuningService.listDatasets({ limit: 50 }),
  });
}

export function useFineTuneJobs() {
  return useQuery({
    queryKey: fineTuningKeys.jobs(),
    queryFn: () => fineTuningService.listJobs({ limit: 50 }),
    refetchInterval: (query) => (hasLiveFineTuneJobs(query.state.data as FineTuneModel[] | undefined) ? 5000 : false),
    refetchIntervalInBackground: true,
  });
}

export function useFineTuningModels() {
  return useQuery({
    queryKey: fineTuningKeys.models(),
    queryFn: () => fineTuningService.listModels({ limit: 100 }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
}

export function useFineTuneProviders() {
  return useQuery({
    queryKey: fineTuningKeys.providers(),
    queryFn: () => fineTuningService.listProviders(),
  });
}

export function useFineTuneQuotas() {
  return useQuery({
    queryKey: fineTuningKeys.quotas(),
    queryFn: () => fineTuningService.getQuotas(),
  });
}

export function useCreateFineTuneDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFineTuneDatasetPayload) => fineTuningService.createDataset(payload),
    onSuccess: () => invalidateFineTuneOverview(queryClient),
  });
}

export function useAddFineTuneExamples() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, examples }: { datasetId: string; examples: CreateFineTuneExamplePayload[] }) => (
      fineTuningService.addExamples(datasetId, examples)
    ),
    onSuccess: () => invalidateFineTuneOverview(queryClient),
  });
}

export function useValidateFineTuneDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId: string) => fineTuningService.validateDataset(datasetId),
    onSuccess: () => invalidateFineTuneOverview(queryClient),
  });
}

export function useArchiveFineTuneDatasets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetIds: string[]) => fineTuningService.archiveDatasets(datasetIds),
    onSuccess: () => invalidateFineTuneOverview(queryClient),
  });
}

export function useCreateFineTuneJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFineTuneJobPayload) => fineTuningService.createJob(payload),
    onSuccess: (job) => {
      queryClient.setQueryData(fineTuningKeys.jobs(), (current?: FineTuneModel[]) => {
        if (!current) return [job];
        return [job, ...current.filter((item) => item.id !== job.id)];
      });
      invalidateFineTuneOverview(queryClient);
      queryClient.invalidateQueries({ queryKey: fineTuningKeys.trainingLog(job.id) });
      queryClient.invalidateQueries({ queryKey: fineTuningKeys.metrics(job.id) });
    },
  });
}

export function useCancelFineTuneJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => fineTuningService.cancelJob(jobId),
    onSuccess: (job) => {
      invalidateFineTuneOverview(queryClient);
      queryClient.invalidateQueries({ queryKey: fineTuningKeys.trainingLog(job.id) });
    },
  });
}

export function useRetryFineTuneJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => fineTuningService.retryJob(jobId),
    onSuccess: (job) => {
      invalidateFineTuneOverview(queryClient);
      queryClient.invalidateQueries({ queryKey: fineTuningKeys.trainingLog(job.id) });
      queryClient.invalidateQueries({ queryKey: fineTuningKeys.metrics(job.id) });
    },
  });
}

export function usePromoteFineTuneJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => fineTuningService.promoteJob(jobId),
    onSuccess: () => invalidateFineTuneOverview(queryClient),
  });
}

export function useSetFineTunedModelActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modelId, isActive }: { modelId: string; isActive: boolean }) => fineTuningService.setModelActive(modelId, isActive),
    onSuccess: () => invalidateFineTuneOverview(queryClient),
  });
}

export function useTrainingLog(jobId?: string) {
  return useQuery({
    queryKey: fineTuningKeys.trainingLog(jobId),
    queryFn: () => fineTuningService.getTrainingLog(jobId),
    refetchInterval: jobId ? 5000 : false,
    refetchIntervalInBackground: true,
  });
}

export function useFineTuneMetrics(jobId?: string) {
  return useQuery({
    queryKey: fineTuningKeys.metrics(jobId),
    queryFn: () => fineTuningService.getMetrics(jobId),
    enabled: Boolean(jobId),
    refetchInterval: jobId ? 5000 : false,
    refetchIntervalInBackground: true,
  });
}

export function useExamplePairs() {
  return useQuery({
    queryKey: fineTuningKeys.examplePairs(),
    queryFn: () => fineTuningService.getExamplePairs(),
  });
}
