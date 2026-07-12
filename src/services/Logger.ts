import { getObject, setObject, StorageKeys } from '../storage/mmkv';

const MAX_LOG_ENTRIES = 200;

export interface LogEntry {
  id: string;
  ts: number;
  level: 'info' | 'warn' | 'error';
  category: string;
  message: string;
  detail?: string;
}

let logBuffer: LogEntry[] | null = null;

function load(): LogEntry[] {
  if (logBuffer) return logBuffer;
  logBuffer = getObject<LogEntry[]>(StorageKeys.LOG, []);
  return logBuffer;
}

function save(): void {
  setObject(StorageKeys.LOG, logBuffer!);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function log(level: LogEntry['level'], category: string, message: string, detail?: string): void {
  const entry: LogEntry = { id: generateId(), ts: Date.now(), level, category, message, detail };
  const buf = load();
  buf.push(entry);
  if (buf.length > MAX_LOG_ENTRIES) {
    buf.splice(0, buf.length - MAX_LOG_ENTRIES);
  }
  save();
  const prefix = level === 'error' ? '[E]' : level === 'warn' ? '[W]' : '[I]';
  console.log(`${prefix} [${category}] ${message}${detail ? ' — ' + detail : ''}`);
}

export function getLogs(): LogEntry[] {
  return [...load()];
}

export function getLogsByCategory(category: string): LogEntry[] {
  return load().filter((e) => e.category === category);
}

export function clearLogs(): void {
  logBuffer = [];
  save();
  console.log('[I] [logger] Logs cleared');
}

export function info(category: string, message: string, detail?: string): void {
  log('info', category, message, detail);
}

export function warn(category: string, message: string, detail?: string): void {
  log('warn', category, message, detail);
}

export function error(category: string, message: string, detail?: string): void {
  log('error', category, message, detail);
}
