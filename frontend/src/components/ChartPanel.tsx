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
