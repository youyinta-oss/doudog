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
