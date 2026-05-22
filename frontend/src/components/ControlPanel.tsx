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
