jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage = {};
  return {
    setItem: jest.fn((key, value) => {
      mockStorage[key] = value;
      return Promise.resolve(null);
    }),
    getItem: jest.fn((key) => Promise.resolve(mockStorage[key] ?? null)),
    removeItem: jest.fn((key) => {
      delete mockStorage[key];
      return Promise.resolve(null);
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
    multiGet: jest.fn((keys) =>
      Promise.resolve(keys.map((k) => [k, mockStorage[k] ?? null])),
    ),
    clear: jest.fn(() => {
      for (const key of Object.keys(mockStorage)) {
        delete mockStorage[key];
      }
      return Promise.resolve(null);
    }),
  };
});

jest.mock('expo-crypto', () => {
  function sha256Hex(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      hash = ((hash << 5) - hash + ch) | 0;
    }
    const h = (hash >>> 0).toString(16);
    return h.padStart(64, '0');
  }

  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    digestStringAsync: jest.fn((_algo, input) => {
      return Promise.resolve(sha256Hex(input));
    }),
    randomUUID: jest.fn(() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    })),
    getRandomBytes: jest.fn((count) => {
      const bytes = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        bytes[i] = (Math.random() * 256) | 0;
      }
      return bytes;
    }),
  };
});

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  setItemAsync: jest.fn(() => Promise.resolve(null)),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve(null)),
}));
