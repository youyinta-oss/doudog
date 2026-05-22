
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { 
  ArrowLeft, Server, Cpu, HardDrive, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ServerDetail() {
  const { id } = useParams();
  const { servers, metrics, fetchServers, fetchMetrics } = useAppStore();
  const [chartKey, setChartKey] = useState(0);

  const server = servers.find(s => s.id === id);
  const serverMetrics = id ? metrics[id] : null;

  useEffect(() => {
    fetchServers();
    if (id) {
      fetchMetrics(id);
    }
  }, [fetchServers, fetchMetrics, id]);

  useEffect(() => {
    if (id) {
      const interval = setInterval(() => {
        fetchMetrics(id);
        setChartKey(k => k + 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, id]);

  if (!server) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-500">服务器未找到</p>
          <Link to="/servers" className="text-cyan-600 hover:text-cyan-700 mt-2 inline-block">
            返回服务器列表
          </Link>
        </div>
      </div>
    );
  }

  const formatChartData = (data: { timestamp: number; value: number }[]) => {
    return data.map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: d.value
    }));
  };

  const ResourceCard = ({ title, value, icon: Icon, color, data }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-4">{value.toFixed(1)}%</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatChartData(data)} key={chartKey}>
            <defs>
              <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color === 'cyan' ? '#0ea5e9' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : '#f59e0b'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color === 'cyan' ? '#0ea5e9' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : '#f59e0b'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color === 'cyan' ? '#0ea5e9' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : '#f59e0b'}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${title})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/servers" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{server.name}</h1>
          <p className="text-slate-500">{server.ip}</p>
        </div>
        <StatusBadge status={server.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {serverMetrics && (
          <>
            <ResourceCard title="CPU" value={server.cpu} icon={Cpu} color="cyan" data={serverMetrics.cpu} />
            <ResourceCard title="内存" value={server.memory} icon={Activity} color="purple" data={serverMetrics.memory} />
            <ResourceCard title="磁盘" value={server.disk} icon={HardDrive} color="emerald" data={serverMetrics.disk} />
            <ResourceCard title="网络" value={serverMetrics.network[serverMetrics.network.length - 1]?.value || 0} icon={Server} color="amber" data={serverMetrics.network} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">服务器信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">操作系统</p>
              <p className="font-medium text-slate-800">{server.os}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">运行时间</p>
              <p className="font-medium text-slate-800">
                {Math.floor(server.uptime / 86400)}天 {Math.floor((server.uptime % 86400) / 3600)}小时
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

