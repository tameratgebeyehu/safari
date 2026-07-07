import { apiGet, apiPost } from '../api/client';
import type {
  CreateFavoritePayload,
  CreateRequestPayload,
  Favorite,
  Request,
  UpdateFavoritePayload,
  UpdateRequestPayload,
  AppSettings,
} from '../api/types';
import type {
  IFavoriteRepository,
  IRequestRepository,
  ISettingsRepository,
} from './interfaces';

export class AppsScriptRequestRepository implements IRequestRepository {
  async getAll(): Promise<Request[]> {
    return apiGet<Request[]>('getRequests');
  }

  async create(payload: CreateRequestPayload): Promise<Request> {
    return apiPost<Request>('createRequest', payload as unknown as Record<string, unknown>);
  }

  async update(payload: UpdateRequestPayload): Promise<Request> {
    return apiPost<Request>('updateRequest', payload as unknown as Record<string, unknown>);
  }

  async delete(requestId: string): Promise<void> {
    await apiPost('deleteRequest', { requestId, userMode: 'receiver' });
  }
}

export class AppsScriptFavoriteRepository implements IFavoriteRepository {
  async getAll(): Promise<Favorite[]> {
    return apiGet<Favorite[]>('getFavorites');
  }

  async create(payload: CreateFavoritePayload): Promise<Favorite> {
    return apiPost<Favorite>('createFavorite', payload as unknown as Record<string, unknown>);
  }

  async update(payload: UpdateFavoritePayload): Promise<Favorite> {
    return apiPost<Favorite>('updateFavorite', payload as unknown as Record<string, unknown>);
  }

  async delete(favoriteId: string): Promise<void> {
    await apiPost('deleteFavorite', { favoriteId, userMode: 'receiver' });
  }
}

export class AppsScriptSettingsRepository implements ISettingsRepository {
  async getAll(): Promise<AppSettings> {
    return apiGet<AppSettings>('getSettings');
  }

  async update(settings: AppSettings): Promise<AppSettings> {
    return apiPost<AppSettings>('updateSettings', { settings, userMode: 'receiver' });
  }
}

export const requestRepository = new AppsScriptRequestRepository();
export const favoriteRepository = new AppsScriptFavoriteRepository();
export const settingsRepository = new AppsScriptSettingsRepository();
