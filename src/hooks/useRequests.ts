import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateRequestPayload, Request, UpdateRequestPayload } from '../api/types';
import { requestRepository } from '../repositories/appsScriptRepository';
import { enqueueRequest } from '../services/OfflineQueue';
import { useNetworkStatus } from './useNetworkStatus';
import { isApiConfigured } from '../api/client';
import { useAppStore } from '../store/appStore';

export const REQUESTS_QUERY_KEY = ['requests'];

export function useRequests() {
  return useQuery({
    queryKey: REQUESTS_QUERY_KEY,
    queryFn: () => requestRepository.getAll(),
    staleTime: 30_000,
    enabled: isApiConfigured(),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { isConnected } = useNetworkStatus();

  return useMutation({
    mutationFn: async (payload: CreateRequestPayload) => {
      if (!isConnected || !isApiConfigured()) {
        enqueueRequest(payload);
        const offlineRequest: Request = {
          requestId: payload.requestId,
          buyerPhone: payload.buyerPhone,
          amount: payload.amount,
          description: payload.description,
          status: 'Pending',
          createdDate: payload.createdDate,
          createdTime: payload.createdTime,
          lastUpdated: payload.isoTimestamp,
          isoTimestamp: payload.isoTimestamp,
          pendingSync: true,
        };
        return offlineRequest;
      }
      return requestRepository.create(payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Request[]>(REQUESTS_QUERY_KEY, (old: Request[] | undefined) => {
        const existing = old ?? [];
        return [data, ...existing.filter((r: Request) => r.requestId !== data.requestId)];
      });
      useAppStore.getState().requestSync();
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRequestPayload) => requestRepository.update(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Request[]>(REQUESTS_QUERY_KEY, (old: Request[] | undefined) =>
        (old ?? []).map((r: Request) => (r.requestId === data.requestId ? data : r))
      );
      useAppStore.getState().requestSync();
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => requestRepository.delete(requestId),
    onSuccess: (_: void, requestId: string) => {
      queryClient.setQueryData<Request[]>(REQUESTS_QUERY_KEY, (old: Request[] | undefined) =>
        (old ?? []).filter((r: Request) => r.requestId !== requestId)
      );
      useAppStore.getState().requestSync();
    },
  });
}

export function useDashboardStats(requests: Request[] | undefined) {
  const all = requests ?? [];
  const today = new Date().toDateString();

  return {
    pending: all.filter((r) => r.status === 'Pending').length,
    processing: all.filter((r) => r.status === 'Processing').length,
    completed: all.filter((r) => r.status === 'Completed').length,
    completedToday: all.filter((r) => r.status === 'Completed' && new Date(r.isoTimestamp).toDateString() === today).length,
    total: all.length,
  };
}
