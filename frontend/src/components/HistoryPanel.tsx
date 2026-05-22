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
