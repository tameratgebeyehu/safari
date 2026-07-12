import { log, getLogs, getLogsByCategory, clearLogs, info, warn, error } from '../services/Logger';

beforeEach(() => {
  clearLogs();
});

describe('log', () => {
  it('adds a log entry', () => {
    log('info', 'test', 'hello');
    expect(getLogs()).toHaveLength(1);
  });

  it('stores level, category, message, detail', () => {
    log('error', 'api', 'timeout', 'GET /requests');
    const entry = getLogs()[0];
    expect(entry.level).toBe('error');
    expect(entry.category).toBe('api');
    expect(entry.message).toBe('timeout');
    expect(entry.detail).toBe('GET /requests');
  });

  it('assigns a numeric ts and an id', () => {
    log('info', 't', 'm');
    const entry = getLogs()[0];
    expect(typeof entry.ts).toBe('number');
    expect(typeof entry.id).toBe('string');
    expect(entry.id.length).toBeGreaterThan(0);
  });

  it('rotates entries beyond MAX_LOG_ENTRIES (200)', () => {
    for (let i = 0; i < 250; i++) {
      log('info', 'stress', `entry ${i}`);
    }
    expect(getLogs()).toHaveLength(200);
    const msgs = getLogs().map((e) => e.message);
    expect(msgs[0]).toBe('entry 50');
    expect(msgs[msgs.length - 1]).toBe('entry 249');
  });
});

describe('getLogsByCategory', () => {
  it('filters by category', () => {
    log('info', 'network', 'online');
    log('warn', 'sync', 'conflict');
    log('error', 'network', 'timeout');
    const network = getLogsByCategory('network');
    expect(network).toHaveLength(2);
    expect(network.every((e) => e.category === 'network')).toBe(true);
  });
});

describe('clearLogs', () => {
  it('empties the log buffer', () => {
    log('info', 'a', 'b');
    clearLogs();
    expect(getLogs()).toHaveLength(0);
  });
});

describe('convenience helpers', () => {
  it('info() logs at info level', () => {
    info('cat', 'msg');
    expect(getLogs()[0].level).toBe('info');
  });

  it('warn() logs at warn level', () => {
    warn('cat', 'msg');
    expect(getLogs()[0].level).toBe('warn');
  });

  it('error() logs at error level', () => {
    error('cat', 'msg');
    expect(getLogs()[0].level).toBe('error');
  });
});
