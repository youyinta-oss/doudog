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
