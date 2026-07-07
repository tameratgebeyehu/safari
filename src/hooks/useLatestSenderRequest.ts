import { useCallback, useEffect, useRef, useState } from 'react';
import { useRequests } from './useRequests';
import { useAppStore } from '../store/appStore';
import type { Request } from '../api/types';

export type StatusChange = 'Completed' | 'Processing' | 'Cancelled' | null;

interface UseLatestSenderRequestResult {
  latestRequest: Request | null;
  statusChange: StatusChange;
  clearStatusChange: () => void;
}

export function useLatestSenderRequest(): UseLatestSenderRequestResult {
  const latestRequestInfo = useAppStore((s) => s.latestRequest);
  const { data: requests } = useRequests();
  const prevRequestIdRef = useRef<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const [statusChange, setStatusChange] = useState<StatusChange>(null);

  // Fallback to latestRequestInfo if not found in requests query (e.g. offline or during loading)
  const latestRequest: Request | null =
    latestRequestInfo
      ? (requests?.find((r) => r.requestId === latestRequestInfo.requestId) ?? ({
          ...latestRequestInfo,
          description: '',
          lastUpdated: latestRequestInfo.createdTime,
          isoTimestamp: new Date().toISOString(),
          status: latestRequestInfo.status,
        } as Request))
      : null;

  const currentStatus = latestRequest?.status ?? latestRequestInfo?.status ?? null;

  useEffect(() => {
    if (!latestRequestInfo) {
      prevRequestIdRef.current = null;
      prevStatusRef.current = null;
      return;
    }

    const reqIdChanged = prevRequestIdRef.current !== latestRequestInfo.requestId;
    prevRequestIdRef.current = latestRequestInfo.requestId;

    if (reqIdChanged) {
      // It's a new request, set previous status to current and do not trigger notification
      prevStatusRef.current = currentStatus;
      return;
    }

    if (!currentStatus) return;

    const prev = prevStatusRef.current;
    prevStatusRef.current = currentStatus;

    if (!prev) return;
    if (prev === currentStatus) return;

    if (
      currentStatus === 'Completed' ||
      currentStatus === 'Processing' ||
      currentStatus === 'Cancelled'
    ) {
      setStatusChange(currentStatus as StatusChange);
    }
  }, [latestRequestInfo?.requestId, currentStatus]);

  const clearStatusChange = useCallback(() => setStatusChange(null), []);

  return {
    latestRequest,
    statusChange,
    clearStatusChange,
  };
}
