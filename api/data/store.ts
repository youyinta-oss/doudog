
import { Server, Service, LogEntry, ServerMetrics } from '../../shared/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateMetrics(count: number, min: number, max: number): { timestamp: number; value: number }[] {
  const now = Date.now();
  const metrics = [];
  for (let i = count - 1; i >= 0; i--) {
    metrics.push({
      timestamp: now - i * 60000,
      value: Math.random() * (max - min) + min
    });
  }
  return metrics;
}

const initialServers: Server[] = [
  {
    id: 'srv-001',
    name: '生产服务器-01',
    ip: '192.168.1.10',
    status: 'online',
    cpu: 65,
    memory: 72,
    disk: 45,
    uptime: 1209600,
    os: 'Ubuntu 22.04 LTS'
  },
  {
    id: 'srv-002',
    name: '生产服务器-02',
    ip: '192.168.1.11',
    status: 'online',
    cpu: 34,
    memory: 58,
    disk: 67,
    uptime: 864000,
    os: 'CentOS 8'
  },
  {
    id: 'srv-003',
    name: '测试服务器-01',
    ip: '192.168.1.20',
    status: 'warning',
    cpu: 89,
    memory: 92,
    disk: 88,
    uptime: 172800,
    os: 'Debian 11'
  }
];

const initialServices: Service[] = [
  { id: 'svc-001', name: 'Nginx Web Server', serverId: 'srv-001', status: 'running', port: 80, uptime: 1209600 },
  { id: 'svc-002', name: 'PostgreSQL Database', serverId: 'srv-001', status: 'running', port: 5432, uptime: 1200000 },
  { id: 'svc-003', name: 'Redis Cache', serverId: 'srv-002', status: 'running', port: 6379, uptime: 864000 },
  { id: 'svc-004', name: 'Node.js API', serverId: 'srv-002', status: 'stopped', port: 3000, uptime: 0 },
  { id: 'svc-005', name: 'MongoDB', serverId: 'srv-003', status: 'error', port: 27017, uptime: 0 }
];

const initialLogs: LogEntry[] = [
  { id: 'log-001', timestamp: Date.now() - 300000, level: 'info', message: '系统监控服务已启动', source: 'system' },
  { id: 'log-002', timestamp: Date.now() - 600000, level: 'warning', message: '测试服务器-01 CPU使用率过高', source: 'monitor' },
  { id: 'log-003', timestamp: Date.now() - 900000, level: 'error', message: 'MongoDB 服务异常', source: 'service' },
  { id: 'log-004', timestamp: Date.now() - 1200000, level: 'info', message: '备份任务完成', source: 'backup' },
  { id: 'log-005', timestamp: Date.now() - 1800000, level: 'info', message: '新用户登录', source: 'auth' }
];

const serverMetricsMap: Record<string, ServerMetrics> = {};
initialServers.forEach(server => {
  serverMetricsMap[server.id] = {
    serverId: server.id,
    cpu: generateMetrics(60, 20, 95),
    memory: generateMetrics(60, 30, 95),
    disk: generateMetrics(60, 20, 90),
    network: generateMetrics(60, 10, 100)
  };
});

export const store = {
  servers: [...initialServers],
  services: [...initialServices],
  logs: [...initialLogs],
  metrics: { ...serverMetricsMap }
};

export function updateServerMetrics() {
  store.servers.forEach(server => {
    if (!store.metrics[server.id]) {
      store.metrics[server.id] = {
        serverId: server.id,
        cpu: [],
        memory: [],
        disk: [],
        network: []
      };
    }
    const metrics = store.metrics[server.id];
    const now = Date.now();
    
    metrics.cpu.push({ timestamp: now, value: Math.max(0, Math.min(100, server.cpu + (Math.random() - 0.5) * 10)) });
    metrics.memory.push({ timestamp: now, value: Math.max(0, Math.min(100, server.memory + (Math.random() - 0.5) * 10)) });
    metrics.disk.push({ timestamp: now, value: Math.max(0, Math.min(100, server.disk + (Math.random() - 0.5) * 2)) });
    metrics.network.push({ timestamp: now, value: Math.max(0, Math.min(100, Math.random() * 100)) });
    
    if (metrics.cpu.length > 60) metrics.cpu.shift();
    if (metrics.memory.length > 60) metrics.memory.shift();
    if (metrics.disk.length > 60) metrics.disk.shift();
    if (metrics.network.length > 60) metrics.network.shift();
    
    server.cpu = metrics.cpu[metrics.cpu.length - 1].value;
    server.memory = metrics.memory[metrics.memory.length - 1].value;
  });
}

setInterval(updateServerMetrics, 5000);

