import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { adminApi } from '../lib/api';
import { Users, Coins, Package, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { stats, setStats, loading, setLoading } = useStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const result = await adminApi.getStats();
    if (result.success && result.data) {
      setStats(result.data);
    } else {
      setError(result.error || 'Failed to fetch stats');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-glow text-cyber-purple text-2xl font-orbitron">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400 text-xl font-rajdhani">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: '总玩家数',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: '代币总量',
      value: stats?.total_coins || 0,
      icon: Coins,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      title: 'Mod总数',
      value: stats?.total_mods || 0,
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: '今日销售',
      value: stats?.today_sales || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
  ];

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="text-4xl font-orbitron font-bold text-white mb-8">
        控制台概览
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card group cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-orbitron font-bold text-white mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm font-rajdhani text-gray-400">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      <div className="card-cyber p-6">
        <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
          欢迎使用FiveM人物Mod管理系统
        </h2>
        <p className="text-gray-300 font-rajdhani leading-relaxed">
          这是一个为FiveM服务器设计的人物Mod管理系统。您可以通过左侧导航栏管理玩家代币、赠送Mod、管理商品库存。
        </p>
      </div>
    </div>
  );
}
