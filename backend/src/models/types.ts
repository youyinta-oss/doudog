export interface GameState {
  status: 'idle' | 'running' | 'paused';
  coins: number;
  materials: Record<string, number>;
  currentLocation: string;
  health: number;
  stamina: number;
  enemiesDefeated: number;
  timeElapsed: number;
}

export interface DetectionResult {
  id: string;
  timestamp: number;
  type: 'coin' | 'material' | 'enemy';
  value: number;
  location: string;
  confidence: number;
}

export interface Config {
  detectionInterval: number;
  autoCollect: boolean;
  targetCoins: number;
  targetMaterials: Record<string, number>;
  avoidCombat: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
