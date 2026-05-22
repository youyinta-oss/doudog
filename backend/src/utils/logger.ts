import type { LogEntry } from '../models/types.js';

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(level: LogEntry['level'], message: string): LogEntry {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      level,
      message
    };
    
    this.logs.unshift(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    
    return entry;
  }

  info(message: string) {
    return this.log('info', message);
  }

  warn(message: string) {
    return this.log('warn', message);
  }

  error(message: string) {
    return this.log('error', message);
  }

  success(message: string) {
    return this.log('success', message);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}
