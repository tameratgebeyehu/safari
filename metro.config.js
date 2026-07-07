const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

// In-memory cache store to avoid E: drive write issues
class MemoryStore {
  constructor() { this._data = new Map(); }
  async get(key) { return this._data.get(key.toString('hex')) ?? null; }
  async set(key, value) { this._data.set(key.toString('hex'), value); }
  clear() { this._data.clear(); }
}

config.cacheStores = [new MemoryStore()];
module.exports = config;
