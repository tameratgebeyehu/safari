import type { RequestStatus } from '../constants';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface Request {
  requestId: string;
  buyerPhone: string;
  amount: number;
  description: string;
  status: RequestStatus;
  createdDate: string;
  createdTime: string;
  completedDate?: string;
  completedTime?: string;
  lastUpdated: string;
  isoTimestamp: string;
  pendingSync?: boolean;
}

export interface CreateRequestPayload {
  requestId: string;
  buyerPhone: string;
  amount: number;
  description: string;
  createdDate: string;
  createdTime: string;
  isoTimestamp: string;
  userMode?: string;
}

export interface UpdateRequestPayload {
  requestId: string;
  status?: RequestStatus;
  description?: string;
  completedDate?: string;
  completedTime?: string;
  userMode?: string;
}

export interface Favorite {
  favoriteId: string;
  phoneNumber: string;
  customerName: string;
  description: string;
  createdDate: string;
}

export interface CreateFavoritePayload {
  favoriteId: string;
  phoneNumber: string;
  customerName: string;
  description: string;
  createdDate: string;
  userMode?: string;
}

export interface UpdateFavoritePayload {
  favoriteId: string;
  phoneNumber?: string;
  customerName?: string;
  description?: string;
  userMode?: string;
}

export interface AppSettings {
  [key: string]: string;
}

export interface OfflineQueueItem {
  id: string;
  type: 'createRequest';
  payload: CreateRequestPayload;
  createdAt: number;
  retries: number;
}

export interface DashboardStats {
  pending: number;
  completed: number;
  today: number;
  total: number;
}
