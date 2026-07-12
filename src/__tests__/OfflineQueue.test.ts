const mockStore: Record<string, string> = {};

jest.mock('../storage/mmkv', () => ({
  getObject: jest.fn((_key: string, fallback: unknown) => {
    const raw = mockStore[_key];
    if (raw === undefined) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }),
  setObject: jest.fn((key: string, value: unknown) => {
    mockStore[key] = JSON.stringify(value);
  }),
  remove: jest.fn((key: string) => {
    delete mockStore[key];
  }),
  getString: jest.fn((key: string, fallback = '') => mockStore[key] ?? fallback),
  setString: jest.fn((key: string, value: string) => { mockStore[key] = value; }),
  getNumber: jest.fn((key: string, fallback = 0) => {
    const v = mockStore[key];
    return v !== undefined ? Number(v) : fallback;
  }),
  setNumber: jest.fn((key: string, value: number) => { mockStore[key] = String(value); }),
  getBoolean: jest.fn((key: string, fallback = false) => {
    const v = mockStore[key];
    return v !== undefined ? v === 'true' : fallback;
  }),
  setBoolean: jest.fn((key: string, value: boolean) => { mockStore[key] = value ? 'true' : 'false'; }),
  StorageKeys: {
    OFFLINE_QUEUE: 'offline_queue',
    PIN_ATTEMPTS: 'pin_attempts',
    PIN_LOCKOUT: 'pin_lockout',
    API_KEY: 'api_key',
    API_URL: 'api_url',
    LOG: 'app_log',
    LATEST_REQUEST: 'latest_request',
    USER_MODE: 'user_mode',
    THEME: 'theme',
    LANGUAGE: 'language',
    LAST_SYNC: 'last_sync',
    PIN_HASH: 'pin_hash',
    PIN_VERIFIED_SESSION: 'pin_verified_session',
    HAS_LAUNCHED: 'has_launched',
    SETUP_COMPLETE: 'setup_complete',
  },
}));

import {
  getOfflineQueue,
  enqueueRequest,
  removeFromQueue,
  incrementRetry,
  getQueueSize,
  getQueueIntegrityHash,
} from '../services/OfflineQueue';
import type { CreateRequestPayload } from '../api/types';

function makePayload(overrides?: Partial<CreateRequestPayload>): CreateRequestPayload {
  return {
    requestId: 'REQ-001',
    buyerPhone: '0912345678',
    amount: 1500,
    description: 'test order',
    createdDate: '2026-07-07',
    createdTime: '10:00',
    isoTimestamp: '2026-07-07T10:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  for (const key of Object.keys(mockStore)) {
    delete mockStore[key];
  }
});

describe('enqueueRequest', () => {
  it('adds item to queue', () => {
    enqueueRequest(makePayload());
    expect(getQueueSize()).toBe(1);
  });

  it('obfuscates phone in stored payload', () => {
    enqueueRequest(makePayload({ buyerPhone: '0912345678' }));
    const q = getOfflineQueue();
    expect(q[0].payload.buyerPhone).toBe('091XXXX678');
  });

  it('obfuscates short description', () => {
    enqueueRequest(makePayload({ description: 'hi' }));
    const q = getOfflineQueue();
    expect(q[0].payload.description).toBe('****');
  });

  it('obfuscates long description', () => {
    enqueueRequest(makePayload({ description: 'abcdefgh' }));
    const q = getOfflineQueue();
    expect(q[0].payload.description).toBe('ab****gh');
  });

  it('sets initial retries to 0', () => {
    enqueueRequest(makePayload());
    const q = getOfflineQueue();
    expect(q[0].retries).toBe(0);
  });

  it('sets createdAt as a number', () => {
    enqueueRequest(makePayload());
    const q = getOfflineQueue();
    expect(typeof q[0].createdAt).toBe('number');
  });
});

describe('removeFromQueue', () => {
  it('removes item by id', () => {
    enqueueRequest(makePayload({ requestId: 'R1' }));
    enqueueRequest(makePayload({ requestId: 'R2' }));
    removeFromQueue('R1');
    expect(getQueueSize()).toBe(1);
    expect(getOfflineQueue()[0].id).toBe('R2');
  });
});

describe('incrementRetry', () => {
  it('increments retry count', () => {
    enqueueRequest(makePayload({ requestId: 'R1' }));
    incrementRetry('R1');
    expect(getOfflineQueue()[0].retries).toBe(1);
    incrementRetry('R1');
    expect(getOfflineQueue()[0].retries).toBe(2);
  });
});

describe('getQueueSize', () => {
  it('returns 0 for empty queue', () => {
    expect(getQueueSize()).toBe(0);
  });

  it('returns correct count', () => {
    enqueueRequest(makePayload());
    enqueueRequest(makePayload({ requestId: 'R2' }));
    expect(getQueueSize()).toBe(2);
  });
});

describe('getQueueIntegrityHash', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await getQueueIntegrityHash();
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('changes after mutation', async () => {
    const before = await getQueueIntegrityHash();
    enqueueRequest(makePayload());
    const after = await getQueueIntegrityHash();
    expect(after).not.toBe(before);
  });
});
