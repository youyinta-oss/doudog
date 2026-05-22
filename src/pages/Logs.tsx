
import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { 
  FileText, Search, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Logs() {
  const { logs, fetchLogs } = useAppStore();
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs(filterLevel ? { level: filterLevel } : {});
  }, [fetchLogs, filterLevel]);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-700';
      case 'warning': return 'bg-amber-100 text-amber-700';
      default: return 'bg-cyan-100 text-cyan-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">系统日志</h1>
        <p className="text-slate-500 mt-1">查看和搜索系统日志</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索日志..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          >
            <option value="">全部级别</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <span className="text-slate-300 font-medium">系统日志</span>
        </div>
        <div className="p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex gap-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-4 px-4">
              <div className="flex-shrink-0 mt-0.5">
                {getLevelIcon(log.level)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-slate-400">
                    {new Date(log.timestamp).toLocaleString('zh-CN')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeClass(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-slate-500 text-xs">
                    [{log.source}]
                  </span>
                </div>
                <p className="text-slate-700 break-words">{log.message}</p>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              没有找到匹配的日志
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

