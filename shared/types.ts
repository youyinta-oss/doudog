
export interface Server {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  os: string;
}

export interface Metric {
  timestamp: number;
  value: number;
}

export interface ServerMetrics {
  serverId: string;
  cpu: Metric[];
  memory: Metric[];
  disk: Metric[];
  network: Metric[];
}

export interface Service {
  id: string;
  name: string;
  serverId: string;
  status: 'running' | 'stopped' | 'error';
  port: number;
  uptime: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

