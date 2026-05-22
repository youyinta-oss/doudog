# 三角洲自动跑刀Web检测系统 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个三角洲游戏自动刷金币材料的模拟检测Web系统，包含控制面板、实时状态显示、历史记录、可视化图表、配置管理和日志输出功能。

**Architecture:** 前后端分离架构，使用React + TypeScript前端，Node.js + Express后端，通过REST API和WebSocket进行通信。

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Node.js, Express, WebSocket, localStorage

---

## 文件结构

```
/workspace
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── services/
│       │   └── SimulationEngine.ts
│       ├── models/
│       │   └── types.ts
│       └── utils/
│           └── logger.ts
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ControlPanel.tsx
│       │   ├── StatusDisplay.tsx
│       │   ├── HistoryPanel.tsx
│       │   ├── ChartPanel.tsx
│       │   ├── ConfigManager.tsx
│       │   └── LogPanel.tsx
│       ├── hooks/
│       │   └── useWebSocket.ts
│       ├── store/
│       │   └── useStore.ts
│       ├── types/
│       │   └── index.ts
│       └── lib/
│           └── utils.ts
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-05-22-delta-auto-detection-system.md
```

---

## 任务清单

### 任务 1: 初始化项目结构和后端配置

**Files:**
- Create: `/workspace/backend/package.json`
- Create: `/workspace/backend/tsconfig.json`
- Create: `/workspace/backend/src/index.ts`
- Create: `/workspace/backend/src/models/types.ts`
- Create: `/workspace/backend/src/utils/logger.ts`

- [ ] **Step 1: 创建后端 package.json**

```json
{
  "name": "delta-detection-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/ws": "^8.5.10",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建类型定义文件**

```typescript
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
```

- [ ] **Step 4: 创建 logger 工具**

```typescript
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
```

- [ ] **Step 5: 创建基础服务器入口**

```typescript
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### 任务 2: 实现模拟引擎

**Files:**
- Create: `/workspace/backend/src/services/SimulationEngine.ts`
- Modify: `/workspace/backend/src/index.ts`

- [ ] **Step 1: 创建 SimulationEngine**

```typescript
import type { GameState, DetectionResult, Config, LogEntry } from '../models/types.js';
import { Logger } from '../utils/logger.js';
import type { WebSocket } from 'ws';

const LOCATIONS = [
  '废弃工厂', '沙漠绿洲', '军事基地', '港口码头', 
  '森林营地', '地铁站', '购物中心', '医院'
];

const MATERIALS = ['子弹', '医疗包', '护甲碎片', '能量饮料', '高级配件'];

export class SimulationEngine {
  private state: GameState;
  private config: Config;
  private history: DetectionResult[] = [];
  private logger: Logger;
  private intervalId: NodeJS.Timeout | null = null;
  private clients: Set<WebSocket> = new Set();
  private startTime: number = 0;

  constructor() {
    this.state = this.createInitialState();
    this.config = this.createDefaultConfig();
    this.logger = new Logger();
  }

  private createInitialState(): GameState {
    return {
      status: 'idle',
      coins: 0,
      materials: {
        '子弹': 0,
        '医疗包': 0,
        '护甲碎片': 0,
        '能量饮料': 0,
        '高级配件': 0
      },
      currentLocation: '废弃工厂',
      health: 100,
      stamina: 100,
      enemiesDefeated: 0,
      timeElapsed: 0
    };
  }

  private createDefaultConfig(): Config {
    return {
      detectionInterval: 1000,
      autoCollect: true,
      targetCoins: 10000,
      targetMaterials: {
        '子弹': 100,
        '医疗包': 50,
        '护甲碎片': 30,
        '能量饮料': 40,
        '高级配件': 10
      },
      avoidCombat: false
    };
  }

  addClient(ws: WebSocket) {
    this.clients.add(ws);
    this.broadcastState();
    this.broadcastHistory();
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  private broadcastState() {
    const message = JSON.stringify({
      type: 'state',
      data: this.state
    });
    this.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private broadcastHistory() {
    const message = JSON.stringify({
      type: 'history',
      data: this.history
    });
    this.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private broadcastLog(log: LogEntry) {
    const message = JSON.stringify({
      type: 'log',
      data: log
    });
    this.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private broadcastDetection(result: DetectionResult) {
    const message = JSON.stringify({
      type: 'detection',
      data: result
    });
    this.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  getState(): GameState {
    return { ...this.state };
  }

  getHistory(): DetectionResult[] {
    return [...this.history];
  }

  getLogs(): LogEntry[] {
    return this.logger.getLogs();
  }

  getConfig(): Config {
    return { ...this.config };
  }

  setConfig(config: Partial<Config>) {
    this.config = { ...this.config, ...config };
    this.logger.info(`配置已更新: ${JSON.stringify(config)}`);
    this.broadcastState();
  }

  start() {
    if (this.state.status === 'running') return;
    
    this.state.status = 'running';
    this.startTime = Date.now() - this.state.timeElapsed * 1000;
    this.logger.success('检测系统已启动');
    this.broadcastState();
    this.broadcastLog(this.logger.success('检测系统已启动'));
    
    this.intervalId = setInterval(() => this.tick(), this.config.detectionInterval);
  }

  pause() {
    if (this.state.status !== 'running') return;
    
    this.state.status = 'paused';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.logger.warn('检测系统已暂停');
    this.broadcastState();
    this.broadcastLog(this.logger.warn('检测系统已暂停'));
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state = this.createInitialState();
    this.history = [];
    this.logger.clear();
    this.logger.info('检测系统已重置');
    this.broadcastState();
    this.broadcastHistory();
  }

  private tick() {
    if (this.state.status !== 'running') return;

    this.state.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.state.stamina = Math.max(0, Math.min(100, this.state.stamina - 0.5));

    if (Math.random() < 0.1) {
      this.state.currentLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      this.logger.info(`移动到新位置: ${this.state.currentLocation}`);
      this.broadcastLog(this.logger.info(`移动到新位置: ${this.state.currentLocation}`));
    }

    if (Math.random() < 0.3) {
      this.generateDetection();
    }

    if (Math.random() < 0.1 && !this.config.avoidCombat) {
      this.handleCombat();
    }

    if (this.state.health < 100 && this.state.materials['医疗包'] > 0 && Math.random() < 0.05) {
      this.state.materials['医疗包']--;
      this.state.health = Math.min(100, this.state.health + 30);
      this.logger.success('使用医疗包恢复生命值');
      this.broadcastLog(this.logger.success('使用医疗包恢复生命值'));
    }

    if (this.state.stamina < 30 && this.state.materials['能量饮料'] > 0 && Math.random() < 0.1) {
      this.state.materials['能量饮料']--;
      this.state.stamina = Math.min(100, this.state.stamina + 40);
      this.logger.success('使用能量饮料恢复体力');
      this.broadcastLog(this.logger.success('使用能量饮料恢复体力'));
    }

    this.broadcastState();
  }

  private generateDetection() {
    const types: Array<'coin' | 'material' | 'enemy'> = ['coin', 'material', 'enemy'];
    const type = types[Math.floor(Math.random() * types.length)];
    const confidence = 0.7 + Math.random() * 0.3;

    let result: DetectionResult = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      value: 0,
      location: this.state.currentLocation,
      confidence
    };

    if (type === 'coin') {
      const value = Math.floor(50 + Math.random() * 200);
      result.value = value;
      if (this.config.autoCollect) {
        this.state.coins += value;
      }
      this.logger.success(`检测到金币: +${value}`);
    } else if (type === 'material') {
      const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
      const value = Math.floor(1 + Math.random() * 5);
      result.value = value;
      if (this.config.autoCollect) {
        this.state.materials[material] = (this.state.materials[material] || 0) + value;
      }
      this.logger.success(`检测到材料: ${material} x${value}`);
    } else if (type === 'enemy') {
      const value = Math.floor(1 + Math.random() * 3);
      result.value = value;
      if (!this.config.avoidCombat) {
        this.state.enemiesDefeated += value;
        this.state.coins += value * 100;
        this.state.health -= 5 * value;
        this.logger.warn(`击败敌人: +${value * 100}金币, -${5 * value}生命值`);
      } else {
        this.logger.info('避开了敌人');
      }
    }

    this.history.unshift(result);
    if (this.history.length > 100) {
      this.history.pop();
    }

    this.broadcastDetection(result);
    this.broadcastLog(this.logger.getLogs()[0]);
  }

  private handleCombat() {
    const damage = Math.floor(5 + Math.random() * 15);
    this.state.health = Math.max(0, this.state.health - damage);
    this.state.enemiesDefeated++;
    const reward = Math.floor(100 + Math.random() * 300);
    this.state.coins += reward;
    
    if (Math.random() < 0.3) {
      const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
      this.state.materials[material] = (this.state.materials[material] || 0) + 1;
      this.logger.success(`战斗胜利! +${reward}金币, +${material}x1`);
    } else {
      this.logger.success(`战斗胜利! +${reward}金币`);
    }
    
    this.broadcastLog(this.logger.getLogs()[0]);
  }
}
```

- [ ] **Step 2: 更新服务器入口文件**

```typescript
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { SimulationEngine } from './services/SimulationEngine.js';
import type { Config } from './models/types.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const engine = new SimulationEngine();

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/state', (req, res) => {
  res.json(engine.getState());
});

app.get('/api/history', (req, res) => {
  res.json(engine.getHistory());
});

app.get('/api/logs', (req, res) => {
  res.json(engine.getLogs());
});

app.get('/api/config', (req, res) => {
  res.json(engine.getConfig());
});

app.post('/api/config', (req, res) => {
  const config = req.body as Partial<Config>;
  engine.setConfig(config);
  res.json(engine.getConfig());
});

app.post('/api/start', (req, res) => {
  engine.start();
  res.json({ success: true });
});

app.post('/api/pause', (req, res) => {
  engine.pause();
  res.json({ success: true });
});

app.post('/api/stop', (req, res) => {
  engine.stop();
  res.json({ success: true });
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  engine.addClient(ws);
  
  ws.on('close', () => {
    console.log('Client disconnected');
    engine.removeClient(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### 任务 3: 初始化前端项目

**Files:**
- Create: `/workspace/frontend/package.json`
- Create: `/workspace/frontend/tsconfig.json`
- Create: `/workspace/frontend/vite.config.ts`
- Create: `/workspace/frontend/index.html`
- Create: `/workspace/frontend/src/main.tsx`
- Create: `/workspace/frontend/src/App.tsx`
- Create: `/workspace/frontend/src/types/index.ts`
- Create: `/workspace/frontend/src/lib/utils.ts`
- Create: `/workspace/frontend/src/index.css`

- [ ] **Step 1: 创建前端 package.json**

```json
{
  "name": "delta-detection-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.314.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

- [ ] **Step 5: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>三角洲自动跑刀检测系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建类型定义**

```typescript
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

export interface WebSocketMessage {
  type: 'state' | 'history' | 'log' | 'detection';
  data: any;
}
```

- [ ] **Step 7: 创建工具函数**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN');
}
```

- [ ] **Step 8: 创建 Tailwind 配置**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 9: 创建 PostCSS 配置**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 10: 创建全局样式**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
```

- [ ] **Step 11: 创建 main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 12: 创建 App.tsx**

```tsx
import { useState, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import StatusDisplay from './components/StatusDisplay';
import HistoryPanel from './components/HistoryPanel';
import ChartPanel from './components/ChartPanel';
import ConfigManager from './components/ConfigManager';
import LogPanel from './components/LogPanel';
import useWebSocket from './hooks/useWebSocket';
import type { GameState, DetectionResult, LogEntry, Config } from './types';

function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [connected, setConnected] = useState(false);

  const handleMessage = (data: any) => {
    if (data.type === 'state') {
      setState(data.data);
    } else if (data.type === 'history') {
      setHistory(data.data);
    } else if (data.type === 'log') {
      setLogs(prev => [data.data, ...prev].slice(0, 100));
    } else if (data.type === 'detection') {
      setHistory(prev => [data.data, ...prev].slice(0, 100));
    }
  };

  useWebSocket('ws://localhost:3001', {
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
    onMessage: handleMessage
  });

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig);
    fetch('/api/logs')
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">Δ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">三角洲自动跑刀检测系统</h1>
              <p className="text-sm text-gray-400">模拟金币材料自动采集</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{connected ? '已连接' : '未连接'}</span>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2 xl:col-span-1 space-y-6">
            <ControlPanel state={state} config={config} />
            <StatusDisplay state={state} />
            <ConfigManager config={config} onUpdate={setConfig} />
          </div>

          <div className="space-y-6">
            <ChartPanel history={history} state={state} />
            <LogPanel logs={logs} />
          </div>

          <div className="lg:col-span-2 xl:col-span-3">
            <HistoryPanel history={history} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
```

---

### 任务 4: 创建状态管理和 WebSocket Hook

**Files:**
- Create: `/workspace/frontend/src/hooks/useWebSocket.ts`

- [ ] **Step 1: 创建 useWebSocket Hook**

```typescript
import { useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
}

export default function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        options.onOpen?.();
      };

      ws.onclose = () => {
        options.onClose?.();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };

      ws.onerror = (error) => {
        options.onError?.(error);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }, [url, options]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    send: (data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  };
}
```

---

### 任务 5: 创建前端组件

**Files:**
- Create: `/workspace/frontend/src/components/ControlPanel.tsx`
- Create: `/workspace/frontend/src/components/StatusDisplay.tsx`
- Create: `/workspace/frontend/src/components/HistoryPanel.tsx`
- Create: `/workspace/frontend/src/components/ChartPanel.tsx`
- Create: `/workspace/frontend/src/components/ConfigManager.tsx`
- Create: `/workspace/frontend/src/components/LogPanel.tsx`

- [ ] **Step 1: 创建 ControlPanel 组件**

```tsx
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { GameState, Config } from '../types';

interface Props {
  state: GameState | null;
  config: Config | null;
}

export default function ControlPanel({ state, config }: Props) {
  const handleStart = async () => {
    await fetch('/api/start', { method: 'POST' });
  };

  const handlePause = async () => {
    await fetch('/api/pause', { method: 'POST' });
  };

  const handleStop = async () => {
    await fetch('/api/stop', { method: 'POST' });
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        控制面板
      </h2>

      <div className="flex gap-3">
        <button
          onClick={handleStart}
          disabled={state?.status === 'running'}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <Play size={20} />
          开始
        </button>

        <button
          onClick={handlePause}
          disabled={state?.status !== 'running'}
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <Pause size={20} />
          暂停
        </button>

        <button
          onClick={handleStop}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <RotateCcw size={20} />
          重置
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-gray-400">当前状态:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          state?.status === 'running' ? 'bg-green-500/20 text-green-400' :
          state?.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {state?.status === 'running' ? '运行中' :
           state?.status === 'paused' ? '已暂停' : '空闲'}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 StatusDisplay 组件**

```tsx
import { Coins, Skull, MapPin, Heart, Zap, Clock } from 'lucide-react';
import type { GameState } from '../types';
import { formatTime } from '../lib/utils';

interface Props {
  state: GameState | null;
}

export default function StatusDisplay({ state }: Props) {
  if (!state) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusCards = [
    {
      icon: Coins,
      label: '金币',
      value: state.coins.toLocaleString(),
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: Skull,
      label: '击败敌人',
      value: state.enemiesDefeated.toString(),
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    },
    {
      icon: MapPin,
      label: '当前位置',
      value: state.currentLocation,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Clock,
      label: '运行时间',
      value: formatTime(state.timeElapsed),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        状态显示
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {statusCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`${card.bg} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={card.color} />
                <span className="text-sm text-gray-400">{card.label}</span>
              </div>
              <div className={`text-xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">生命值</span>
            <span className="text-green-400">{Math.round(state.health)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{ width: `${state.health}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">体力值</span>
            <span className="text-blue-400">{Math.round(state.stamina)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
              style={{ width: `${state.stamina}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm text-gray-400 mb-2">材料库存</h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(state.materials).map(([name, count]) => (
              <div key={name} className="bg-gray-700 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400 truncate">{name}</div>
                <div className="text-lg font-bold text-orange-400">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 HistoryPanel 组件**

```tsx
import { Coins, Package, Skull } from 'lucide-react';
import type { DetectionResult } from '../types';
import { formatDate } from '../lib/utils';

interface Props {
  history: DetectionResult[];
}

export default function HistoryPanel({ history }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'coin': return Coins;
      case 'material': return Package;
      case 'enemy': return Skull;
      default: return Coins;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'coin': return 'text-yellow-400 bg-yellow-500/10';
      case 'material': return 'text-orange-400 bg-orange-500/10';
      case 'enemy': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'coin': return '金币';
      case 'material': return '材料';
      case 'enemy': return '敌人';
      default: return '未知';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
        检测历史
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-sm text-gray-400 font-medium py-3 px-2">时间</th>
              <th className="text-left text-sm text-gray-400 font-medium py-3 px-2">类型</th>
              <th className="text-left text-sm text-gray-400 font-medium py-3 px-2">数值</th>
              <th className="text-left text-sm text-gray-400 font-medium py-3 px-2">位置</th>
              <th className="text-left text-sm text-gray-400 font-medium py-3 px-2">置信度</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  暂无检测记录
                </td>
              </tr>
            ) : (
              history.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-2 text-sm text-gray-300">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${getColor(item.type)} flex items-center justify-center`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-sm text-gray-300">{getLabel(item.type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-white">
                      +{item.value}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-300">
                      {item.location}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden max-w-20">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${item.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建 ChartPanel 组件**

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { DetectionResult, GameState } from '../types';
import { useEffect, useState } from 'react';

interface Props {
  history: DetectionResult[];
  state: GameState | null;
}

export default function ChartPanel({ history, state }: Props) {
  const [coinHistory, setCoinHistory] = useState<{ time: string; coins: number }[]>([]);

  useEffect(() => {
    if (state) {
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCoinHistory(prev => {
        const newData = [...prev, { time: now, coins: state.coins }];
        return newData.slice(-30);
      });
    }
  }, [state?.coins]);

  const typeStats = history.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: '金币', value: typeStats.coin || 0, color: '#fbbf24' },
    { name: '材料', value: typeStats.material || 0, color: '#f97316' },
    { name: '敌人', value: typeStats.enemy || 0, color: '#ef4444' }
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
        数据图表
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-400 mb-3">金币增长趋势</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={coinHistory}>
                <defs>
                  <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 10}} />
                <YAxis stroke="#9ca3af" tick={{fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area type="monotone" dataKey="coins" stroke="#fbbf24" fillOpacity={1} fill="url(#colorCoins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-gray-400 mb-3">检测类型分布</h3>
          <div className="flex gap-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex-1">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color }}></div>
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-sm text-gray-400">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 创建 ConfigManager 组件**

```tsx
import { Settings } from 'lucide-react';
import type { Config } from '../types';
import { useState } from 'react';

interface Props {
  config: Config | null;
  onUpdate: (config: Config) => void;
}

export default function ConfigManager({ config, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState<Config | null>(null);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSave = async () => {
    if (!localConfig) return;
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localConfig)
    });
    const newConfig = await res.json();
    onUpdate(newConfig);
    setIsEditing(false);
  };

  if (!localConfig) return null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
        配置管理
      </h2>

      {!isEditing ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">检测间隔</span>
            <span className="text-white">{localConfig.detectionInterval}ms</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">自动收集</span>
            <span className={`${localConfig.autoCollect ? 'text-green-400' : 'text-red-400'}`}>
              {localConfig.autoCollect ? '开启' : '关闭'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">目标金币</span>
            <span className="text-white">{localConfig.targetCoins.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 text-sm">避免战斗</span>
            <span className={`${localConfig.avoidCombat ? 'text-green-400' : 'text-red-400'}`}>
              {localConfig.avoidCombat ? '开启' : '关闭'}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
          >
            <Settings size={18} />
            编辑配置
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">检测间隔 (ms)</label>
            <input
              type="number"
              value={localConfig.detectionInterval}
              onChange={(e) => setLocalConfig({ ...localConfig, detectionInterval: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">目标金币</label>
            <input
              type="number"
              value={localConfig.targetCoins}
              onChange={(e) => setLocalConfig({ ...localConfig, targetCoins: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400 text-sm">自动收集</span>
            <button
              onClick={() => setLocalConfig({ ...localConfig, autoCollect: !localConfig.autoCollect })}
              className={`w-12 h-6 rounded-full transition-colors ${localConfig.autoCollect ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${localConfig.autoCollect ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400 text-sm">避免战斗</span>
            <button
              onClick={() => setLocalConfig({ ...localConfig, avoidCombat: !localConfig.avoidCombat })}
              className={`w-12 h-6 rounded-full transition-colors ${localConfig.avoidCombat ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${localConfig.avoidCombat ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setIsEditing(false); setLocalConfig(config); }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

哦，还需要添加 useEffect 的导入：

```tsx
import { Settings } from 'lucide-react';
import type { Config } from '../types';
import { useState, useEffect } from 'react';
```

- [ ] **Step 6: 创建 LogPanel 组件**

```tsx
import { Terminal } from 'lucide-react';
import type { LogEntry } from '../types';
import { formatDate } from '../lib/utils';

interface Props {
  logs: LogEntry[];
}

export default function LogPanel({ logs }: Props) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-500/10';
      case 'warn': return 'bg-yellow-500/10';
      case 'error': return 'bg-red-500/10';
      case 'success': return 'bg-green-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
        系统日志
      </h2>

      <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500">等待日志...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 py-1">
              <span className="text-gray-600 shrink-0">[{formatDate(log.timestamp)}]</span>
              <span className={`${getLevelColor(log.level)} ${getLevelBg(log.level)} px-2 py-0.5 rounded text-xs shrink-0`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

### 任务 6: 安装依赖并测试

**Files:**
- 无新文件创建

- [ ] **Step 1: 安装后端依赖**

```bash
cd /workspace/backend && npm install
```

- [ ] **Step 2: 安装前端依赖**

```bash
cd /workspace/frontend && npm install
```

- [ ] **Step 3: 启动后端服务（后台运行）**

```bash
cd /workspace/backend && npm run dev
```

- [ ] **Step 4: 启动前端服务（新终端）**

```bash
cd /workspace/frontend && npm run dev
```

---

## 最终检查

- [ ] **1. 后端启动测试** - 访问 http://localhost:3001/health 确认返回 {"status":"ok"}
- [ ] **2. 前端启动测试** - 访问 http://localhost:3000 确认页面正常加载
- [ ] **3. WebSocket 连接测试** - 确认前端显示"已连接"状态
- [ ] **4. 功能测试** - 点击开始、暂停、重置按钮，确认所有功能正常工作
