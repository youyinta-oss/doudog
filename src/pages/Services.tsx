
import { useEffect } from 'react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { 
  Activity, Play, Square, RotateCcw, Server } from 'lucide-react';

export default function Services() {
  const { servers, services, fetchServers, fetchServices, startService, stopService, restartService } = useAppStore();

  useEffect(() => {
    fetchServers();
    fetchServices();
  }, [fetchServers, fetchServices]);

  const getServerName = (serverId: string) => {
    return servers.find(s => s.id === serverId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">服务管理</h1>
        <p className="text-slate-500 mt-1">管理所有服务器上的服务</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{service.name}</h3>
                  <p className="text-sm text-slate-500">{getServerName(service.serverId)}</p>
                </div>
              </div>
              <StatusBadge status={service.status} />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">端口</span>
                <span className="font-medium text-slate-700">{service.port}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">运行时间</span>
                <span className="font-medium text-slate-700">
                  {service.uptime > 0 
                    ? `${Math.floor(service.uptime / 3600)}小时 ${Math.floor((service.uptime % 3600) / 60)}分钟`
                    : '未运行'
                  }
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {service.status !== 'running' && (
                <button
                  onClick={() => startService(service.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  启动
                </button>
              )}
              {service.status === 'running' && (
                <button
                  onClick={() => stopService(service.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  停止
                </button>
              )}
              <button
                onClick={() => restartService(service.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重启
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

