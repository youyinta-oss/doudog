import { Settings } from 'lucide-react';
import type { Config } from '../types';
import { useState, useEffect } from 'react';

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
