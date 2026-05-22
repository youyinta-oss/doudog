
import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import StatusBadge from '../components/StatusBadge';
import { 
  Server, Plus, MoreVertical, Edit, Trash2, Activity, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Server as ServerType } from '../../shared/types';

export default function Servers() {
  const { servers, fetchServers, addServer, deleteServer } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [newServer, setNewServer] = useState<Omit<ServerType, 'id'>>({
    name: '',
    ip: '',
    status: 'online',
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 0,
    os: 'Ubuntu 22.04'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServer(newServer);
    setShowModal(false);
    setNewServer({
      name: '',
      ip: '',
      status: 'online',
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: 0,
      os: 'Ubuntu 22.04'
    });
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}天 ${hours}小时`;
    return `${hours}小时`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">服务器管理</h1>
          <p className="text-slate-500 mt-1">管理所有服务器节点</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
        >
          <Plus className="w-4 h-4" />
          添加服务器
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">服务器</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">状态</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">CPU</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">内存</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">磁盘</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">运行时间</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">系统</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servers.map(server => (
                <tr key={server.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Server className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{server.name}</p>
                        <p className="text-sm text-slate-500 font-mono">{server.ip}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={server.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{server.cpu.toFixed(1)}%</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            server.cpu > 80 ? 'bg-red-500' : server.cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                          )}
                          style={{ width: `${Math.min(server.cpu, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{server.memory.toFixed(1)}%</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            server.memory > 80 ? 'bg-red-500' : server.memory > 60 ? 'bg-amber-500' : 'bg-blue-500'
                          )}
                          style={{ width: `${Math.min(server.memory, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-slate-700">{server.disk.toFixed(1)}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-600">{formatUptime(server.uptime)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-600">{server.os}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/servers/${server.id}`)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteServer(server.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">添加服务器</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">服务器名称</label>
                <input
                  type="text"
                  value={newServer.name}
                  onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IP地址</label>
                <input
                  type="text"
                  value={newServer.ip}
                  onChange={e => setNewServer({ ...newServer, ip: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">操作系统</label>
                <select
                  value={newServer.os}
                  onChange={e => setNewServer({ ...newServer, os: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                >
                  <option>Ubuntu 22.04</option>
                  <option>CentOS 8</option>
                  <option>Debian 11</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

