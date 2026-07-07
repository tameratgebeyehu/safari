import type { ApiResponse } from './types';
import { ApiError, NetworkError } from './errors';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? '';
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timed out');
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildUrl(action: string, params?: Record<string, string>): string {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  if (API_KEY) {
    url.searchParams.set('apiKey', API_KEY);
  }
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: ApiResponse<T>;

  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('Invalid server response', response.status);
  }

  if (!json.success) {
    throw new ApiError(json.error ?? 'Request failed', json.code ?? response.status);
  }

  return json.data as T;
}

export async function apiGet<T>(action: string, params?: Record<string, string>): Promise<T> {
  if (!API_URL) {
    throw new ApiError('API URL not configured. Set EXPO_PUBLIC_API_URL in .env');
  }

  const response = await fetchWithTimeout(buildUrl(action, params), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    },
  });

  return parseResponse<T>(response);
}

export async function apiPost<T>(action: string, body: Record<string, unknown>): Promise<T> {
  if (!API_URL) {
    throw new ApiError('API URL not configured. Set EXPO_PUBLIC_API_URL in .env');
  }

  const response = await fetchWithTimeout(buildUrl(action), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify({ ...body, apiKey: API_KEY }),
    redirect: 'follow',
  });

  return parseResponse<T>(response);
}

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return apiGet('health');
}

export function isApiConfigured(): boolean {
  return Boolean(API_URL && API_URL.includes('script.google.com'));
}
