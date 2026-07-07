import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateFavoritePayload, Favorite, UpdateFavoritePayload } from '../api/types';
import { favoriteRepository } from '../repositories/appsScriptRepository';
import { isApiConfigured } from '../api/client';
import { useAppStore } from '../store/appStore';

export const FAVORITES_QUERY_KEY = ['favorites'];

export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => favoriteRepository.getAll(),
    staleTime: 60_000,
    enabled: isApiConfigured(),
  });
}

export function useCreateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFavoritePayload) => favoriteRepository.create(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Favorite[]>(FAVORITES_QUERY_KEY, (old: Favorite[] | undefined) => [data, ...(old ?? [])]);
      useAppStore.getState().requestSync();
    },
  });
}

export function useUpdateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateFavoritePayload) => favoriteRepository.update(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<Favorite[]>(FAVORITES_QUERY_KEY, (old: Favorite[] | undefined) =>
        (old ?? []).map((f: Favorite) => (f.favoriteId === data.favoriteId ? data : f))
      );
      useAppStore.getState().requestSync();
    },
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favoriteId: string) => favoriteRepository.delete(favoriteId),
    onSuccess: (_: void, favoriteId: string) => {
      queryClient.setQueryData<Favorite[]>(FAVORITES_QUERY_KEY, (old: Favorite[] | undefined) =>
        (old ?? []).filter((f: Favorite) => f.favoriteId !== favoriteId)
      );
      useAppStore.getState().requestSync();
    },
  });
}
