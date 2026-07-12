import { getObject, setObject, remove, StorageKeys } from '../storage/mmkv';
import { sha256 } from '../security/crypto';

const CACHE_PREFIX = 'cache_';
const CACHE_TTL_DEFAULT = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
  etag?: string;
}

function cacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const entry = getObject<CacheEntry<T> | null>(cacheKey(key), null);
  if (!entry) return null;

  if (Date.now() - entry.cachedAt > entry.ttl) {
    remove(cacheKey(key));
    return null;
  }

  return entry.data;
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL_DEFAULT,
  etag?: string
): Promise<void> {
  const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl, etag };
  setObject(cacheKey(key), entry);
}

export async function getCachedEtag(key: string): Promise<string | undefined> {
  const entry = getObject<CacheEntry<unknown> | null>(cacheKey(key), null);
  return entry?.etag;
}

export async function invalidateCache(key: string): Promise<void> {
  remove(cacheKey(key));
}

export async function invalidateCacheByPrefix(prefix: string): Promise<void> {
  const allKeys = Object.values(StorageKeys).filter(
    (k) => typeof k === 'string' && k.startsWith(CACHE_PREFIX + prefix)
  );
  for (const k of allKeys) {
    remove(k);
  }
}

export function cacheKeyForRequest(filters?: { status?: string; sortBy?: string }): string {
  const parts = ['requests'];
  if (filters?.status) parts.push(`st:${filters.status}`);
  if (filters?.sortBy) parts.push(`sb:${filters.sortBy}`);
  return parts.join('|');
}

export const cacheKeyForFavorites = 'favorites';
export const cacheKeyForSettings = 'settings';

export function isCacheExpired(timestamp: number | null, ttl: number = CACHE_TTL_DEFAULT): boolean {
  if (!timestamp) return true;
  return Date.now() - timestamp > ttl;
}