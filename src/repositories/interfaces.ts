import type {
  CreateFavoritePayload,
  CreateRequestPayload,
  Favorite,
  Request,
  UpdateFavoritePayload,
  UpdateRequestPayload,
  AppSettings,
} from '../api/types';

export interface IRequestRepository {
  getAll(): Promise<Request[]>;
  create(payload: CreateRequestPayload): Promise<Request>;
  update(payload: UpdateRequestPayload): Promise<Request>;
  delete(requestId: string): Promise<void>;
}

export interface IFavoriteRepository {
  getAll(): Promise<Favorite[]>;
  create(payload: CreateFavoritePayload): Promise<Favorite>;
  update(payload: UpdateFavoritePayload): Promise<Favorite>;
  delete(favoriteId: string): Promise<void>;
}

export interface ISettingsRepository {
  getAll(): Promise<AppSettings>;
  update(settings: AppSettings): Promise<AppSettings>;
}
