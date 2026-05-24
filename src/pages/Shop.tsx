import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { shopApi } from '../lib/api';
import { Coins, Package, Check, Lock } from 'lucide-react';

interface Mod {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_path: string;
  category: string;
}

export default function Shop() {
  const { mods, setMods, userMods, userCoins, setUserCoins, loading, setLoading } = useStore();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result = await shopApi.getMods();
    if (result.success && result.data) {
      setMods(result.data);
    }
    const userCoinsResult = await shopApi.getUserCoins('license:demo');
    if (userCoinsResult.success && userCoinsResult.data) {
      setUserCoins(userCoinsResult.data.coins);
    }
    setLoading(false);
  };

  const handlePurchase = async (mod: Mod) => {
    setPurchasing(mod.id);
    const result = await shopApi.buyMod('license:demo', mod.id);
    if (result.success) {
      setNotification({ type: 'success', message: `成功购买 ${mod.name}！` });
      if (result.data?.user) {
        setUserCoins(result.data.user.coins);
      }
    } else {
      setNotification({ type: 'error', message: result.error || '购买失败' });
    }
    setPurchasing(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const ownedModIds = userMods.map((m) => m.id || (m as any).mod_id);
  const availableMods = mods.filter((m) => !ownedModIds.includes(m.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-glow text-cyber-purple text-2xl font-orbitron">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg font-rajdhani font-semibold animate-slide-in ${
            notification.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-orbitron font-bold text-white">
            Mod商城
          </h1>
          <div className="card-cyber px-6 py-4 flex items-center gap-3">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-2xl font-orbitron font-bold text-yellow-400">
              {userCoins.toLocaleString()}
            </span>
            <span className="text-gray-400 font-rajdhani">代币</span>
          </div>
        </div>

        {availableMods.length === 0 ? (
          <div className="card-cyber p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
              暂无商品
            </h2>
            <p className="text-gray-400 font-rajdhani">
              所有Mod已被您购买或商城正在上新中
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableMods.map((mod: Mod) => {
              const canAfford = userCoins >= mod.price;
              return (
                <div key={mod.id} className="card-cyber overflow-hidden group">
                  <div className="h-56 bg-gradient-to-br from-cyber-purple/30 to-cyber-pink/30 flex items-center justify-center relative">
                    <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                      🎮
                    </div>
                    {ownedModIds.includes(mod.id) && (
                      <div className="absolute top-4 right-4 bg-green-500/80 px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-rajdhani font-semibold">已拥有</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                      {mod.name}
                    </h3>
                    <p className="text-gray-400 font-rajdhani mb-4 line-clamp-2">
                      {mod.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-xl font-orbitron font-bold text-yellow-400">
                          {mod.price.toLocaleString()}
                        </span>
                      </div>
                      <span className="badge badge-warning">{mod.category}</span>
                    </div>
                    {ownedModIds.includes(mod.id) ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-lg font-rajdhani font-semibold bg-green-500/20 text-green-400 border border-green-500/50 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        已拥有
                      </button>
                    ) : canAfford ? (
                      <button
                        onClick={() => handlePurchase(mod)}
                        disabled={purchasing === mod.id}
                        className="w-full btn-cyber py-3 flex items-center justify-center gap-2"
                      >
                        {purchasing === mod.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            购买中...
                          </>
                        ) : (
                          <>
                            <Coins className="w-5 h-5" />
                            立即购买
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-lg font-rajdhani font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/50 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-5 h-5" />
                        代币不足
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
