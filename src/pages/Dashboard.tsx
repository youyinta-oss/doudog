
import { useEffect } from 'react';
import { useAppStore } from '../store';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Server, Cpu, HardDrive, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { servers, services, fetchServers, fetchServices } = useAppStore();

  useEffect(() => {
    fetchServers();
    fetchServices();
  }, [fetchServers, fetchServices]);

  const stats = {
    total: servers.length,
    online: servers.filter(s => s.status === 'online').length,
    warning: servers.filter(s => s.status === 'warning').length,
    running: services.filter(s => s.status === 'running').length
  };

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    name: `${9 + i}:00`,
    cpu: 40 + Math.random() * 40,
    memory: 50 + Math.random() * 30
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表板</h1>
          <p className="text-slate-500 mt-1">服务器监控概览</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="服务器总数"
          value={stats.total}
          icon={<Server className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="在线服务器"
          value={stats.online}
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="警告状态"
          value={stats.warning}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="运行中服务"
          value={stats.running}
          icon={<Cpu className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">资源使用趋势</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#0ea5e9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCpu)"
              />
              <Area
                type="monotone"
                dataKey="memory"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMem)"
              />
            </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">服务器列表</h2>
            <Link to="/servers" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {servers.slice(0, 5).map(server => (
              <div key={server.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{server.name}</p>
                    <p className="text-sm text-slate-500">{server.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                  <p className="text-xs text-slate-400">CPU</p>
                  <p className="font-semibold text-slate-700">{server.cpu.toFixed(1)}%</p>
                  </div>
                  <StatusBadge status={server.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

