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
              <p className="text-sm text-gray-400">模拟金币材料自动收集</p>
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
