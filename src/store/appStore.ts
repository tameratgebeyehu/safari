import { create } from 'zustand';
import type { Language, ThemePreference, UserMode } from '../constants';
import { getBoolean, getNumber, getString, setBoolean, setNumber, setString, getObject, setObject, initStorage, StorageKeys } from '../storage/mmkv';

interface LatestRequestInfo {
  requestId: string;
  buyerPhone: string;
  amount: number;
  createdTime: string;
  createdDate: string;
  status: string;
}

export interface SyncNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  title?: string;
  requestId?: string;
}

interface AppState {
  userMode: UserMode | null;
  hasLaunched: boolean;
  theme: ThemePreference;
  language: Language;
  pinVerified: boolean;
  lastSyncAt: number | null;
  latestRequest: LatestRequestInfo | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncMessage: string;
  notification: SyncNotification | null;
  syncRequested: number;
  requestSync: () => void;
  setUserMode: (mode: UserMode) => void;
  setHasLaunched: (value: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: Language) => void;
  setPinVerified: (value: boolean) => void;
  setLastSyncAt: (timestamp: number) => void;
  setLatestRequest: (req: LatestRequestInfo) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setSyncMessage: (msg: string) => void;
  setNotification: (notification: SyncNotification | null) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userMode: null,
  hasLaunched: false,
  theme: 'system',
  language: 'en',
  pinVerified: false,
  lastSyncAt: null,
  latestRequest: null,
  syncStatus: 'idle',
  syncMessage: '',
  notification: null,
  syncRequested: 0,

  requestSync: () => set((state) => ({ syncRequested: state.syncRequested + 1 })),

  setUserMode: (mode) => {
    setString(StorageKeys.USER_MODE, mode);
    set({ userMode: mode });
  },

  setHasLaunched: (value) => {
    setBoolean(StorageKeys.HAS_LAUNCHED, value);
    set({ hasLaunched: value });
  },

  setTheme: (theme) => {
    setString(StorageKeys.THEME, theme);
    set({ theme });
  },

  setLanguage: (language) => {
    setString(StorageKeys.LANGUAGE, language);
    set({ language });
  },

  setPinVerified: (value) => {
    setBoolean(StorageKeys.PIN_VERIFIED_SESSION, value);
    set({ pinVerified: value });
  },

  setLastSyncAt: (timestamp) => {
    setNumber(StorageKeys.LAST_SYNC, timestamp);
    set({ lastSyncAt: timestamp });
  },

  setLatestRequest: (req) => {
    setObject(StorageKeys.LATEST_REQUEST, req);
    set({ latestRequest: req });
  },

  setSyncStatus: (syncStatus) => set({ syncStatus }),

  setSyncMessage: (syncMessage) => set({ syncMessage }),

  setNotification: (notification) => set({ notification }),

  hydrate: async () => {
    await initStorage();
    const mode = getString(StorageKeys.USER_MODE) as UserMode | '';
    const saved = getObject<LatestRequestInfo | null>(StorageKeys.LATEST_REQUEST, null);
    set({
      userMode: mode === 'sender' || mode === 'receiver' ? mode : null,
      hasLaunched: getBoolean(StorageKeys.HAS_LAUNCHED),
      theme: (getString(StorageKeys.THEME, 'system') as ThemePreference) || 'system',
      language: (getString(StorageKeys.LANGUAGE, 'en') as Language) || 'en',
      pinVerified: getBoolean(StorageKeys.PIN_VERIFIED_SESSION),
      lastSyncAt: getNumber(StorageKeys.LAST_SYNC, 0) || null,
      latestRequest: saved,
    });
  },
}));
