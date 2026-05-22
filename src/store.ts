
import { create } from 'zustand';
import { Server, Service, LogEntry, ServerMetrics } from '../shared/types';

interface AppState {
  servers: Server[];
  services: Service[];
  logs: LogEntry[];
  metrics: Record<string, ServerMetrics>;
  loading: boolean;
  fetchServers: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchLogs: (filters?: { level?: string; source?: string }) => Promise<void>;
  fetchMetrics: (serverId: string) => Promise<void>;
  addServer: (server: Omit<Server, 'id'>) => Promise<void>;
  updateServer: (id: string, data: Partial<Server>) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  startService: (id: string) => Promise<void>;
  stopService: (id: string) => Promise<void>;
  restartService: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  servers: [],
  services: [],
  logs: [],
  metrics: {},
  loading: false,

  fetchServers: async () => {
    set({ loading: true });
    const response = await fetch('/api/servers');
    const data = await response.json();
    set({ servers: data, loading: false });
  },

  fetchServices: async () => {
    set({ loading: true });
    const response = await fetch('/api/services');
    const data = await response.json();
    set({ services: data, loading: false });
  },

  fetchLogs: async (filters = {}) => {
    set({ loading: true });
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`/api/logs?${params.toString()}`);
    const data = await response.json();
    set({ logs: data, loading: false });
  },

  fetchMetrics: async (serverId: string) => {
    const response = await fetch(`/api/servers/${serverId}/metrics`);
    const data = await response.json();
    set(state => ({ metrics: { ...state.metrics, [serverId]: data } }));
  },

  addServer: async (server) => {
    const response = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(server)
    });
    const newServer = await response.json();
    set(state => ({ servers: [...state.servers, newServer] }));
  },

  updateServer: async (id, data) => {
    const response = await fetch(`/api/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const updatedServer = await response.json();
    set(state => ({
      servers: state.servers.map(s => s.id === id ? updatedServer : s)
    }));
  },

  deleteServer: async (id) => {
    await fetch(`/api/servers/${id}`, { method: 'DELETE' });
    set(state => ({
      servers: state.servers.filter(s => s.id !== id),
      metrics: { ...state.metrics }
    }));
  },

  startService: async (id) => {
    const response = await fetch(`/api/services/${id}/start`, { method: 'POST' });
    const updatedService = await response.json();
    set(state => ({
      services: state.services.map(s => s.id === id ? updatedService : s)
    }));
  },

  stopService: async (id) => {
    const response = await fetch(`/api/services/${id}/stop`, { method: 'POST' });
    const updatedService = await response.json();
    set(state => ({
      services: state.services.map(s => s.id === id ? updatedService : s)
    }));
  },

  restartService: async (id) => {
    const response = await fetch(`/api/services/${id}/restart`, { method: 'POST' });
    const updatedService = await response.json();
    set(state => ({
      services: state.services.map(s => s.id === id ? updatedService : s)
    }));
  }
}));

