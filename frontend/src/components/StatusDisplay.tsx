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
