import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { shopApi } from '../lib/api';
import { Package, Check, Zap } from 'lucide-react';

interface UserMod {
  id: number;
  mod_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_path: string;
  category: string;
  equipped: boolean;
  purchased_at: string;
}

export default function Inventory() {
  const { userMods, setUserMods, loading, setLoading, equippedMod, setEquippedMod } = useStore();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [equipping, setEquipping] = useState<number | null>(null);

  useEffect(() => {
    fetchUserMods();
  }, []);

  const fetchUserMods = async () => {
    setLoading(true);
    const result = await shopApi.getUserMods('license:demo');
    if (result.success && result.data) {
      setUserMods(result.data);
    }
    const equippedResult = await shopApi.getEquippedMod('license:demo');
    if (equippedResult.success && equippedResult.data) {
      setEquippedMod(equippedResult.data);
    }
    setLoading(false);
  };

  const handleEquip = async (userMod: UserMod) => {
    setEquipping(userMod.mod_id);
    const result = await shopApi.equipMod('license:demo', userMod.mod_id);
    if (result.success) {
      setNotification({ type: 'success', message: `已装备 ${userMod.name}` });
      setUserMods(
        userMods.map((m) => ({
          ...m,
          equipped: m.mod_id === userMod.mod_id,
        })) as any
      );
      setEquippedMod(result.data);
    } else {
      setNotification({ type: 'error', message: result.error || '装备失败' });
    }
    setEquipping(null);
    setTimeout(() => setNotification(null), 3000);
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
        <div className="mb-8">
          <h1 className="text-5xl font-orbitron font-bold text-white mb-2">
            我的仓库
          </h1>
          <p className="text-gray-400 font-rajdhani">
            管理您拥有的人物Mod，点击装备按钮应用到游戏角色
          </p>
        </div>

        {equippedMod && (
          <div className="card-cyber p-6 mb-8 border-green-500/50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-orbitron font-bold text-green-400">
                当前装备
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-cyber-purple/30 to-cyber-pink/30 rounded-xl flex items-center justify-center">
                <span className="text-5xl">🎮</span>
              </div>
              <div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-1">
                  {equippedMod.name}
                </h3>
                <p className="text-gray-400 font-rajdhani">{equippedMod.description}</p>
              </div>
            </div>
          </div>
        )}

        {userMods.length === 0 ? (
          <div className="card-cyber p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
              仓库为空
            </h2>
            <p className="text-gray-400 font-rajdhani mb-6">
              您还没有购买任何Mod，快去商城看看吧
            </p>
            <a
              href="/shop"
              className="btn-cyber inline-flex"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/shop';
              }}
            >
              前往商城
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userMods.map((userMod: UserMod) => (
              <div
                key={userMod.id}
                className={`card-cyber overflow-hidden ${
                  userMod.equipped ? 'border-green-500/50' : ''
                }`}
              >
                {userMod.equipped && (
                  <div className="bg-green-500/20 px-4 py-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-rajdhani font-semibold text-green-400">
                      当前装备
                    </span>
                  </div>
                )}
                <div className="h-48 bg-gradient-to-br from-cyber-purple/20 to-cyber-pink/20 flex items-center justify-center">
                  <div className="text-7xl">🎮</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                    {userMod.name}
                  </h3>
                  <p className="text-gray-400 font-rajdhani text-sm mb-4 line-clamp-2">
                    {userMod.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>分类: {userMod.category}</span>
                    <span>购买于 {new Date(userMod.purchased_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  {userMod.equipped ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-lg font-rajdhani font-semibold bg-green-500/20 text-green-400 border border-green-500/50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      已装备
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(userMod)}
                      disabled={equipping === userMod.mod_id}
                      className="w-full btn-cyber py-3 flex items-center justify-center gap-2"
                    >
                      {equipping === userMod.mod_id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          装备中...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          装备此Mod
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
