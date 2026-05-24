import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { adminApi } from '../lib/api';
import { UserPlus, Gift, Package, Copy, Check } from 'lucide-react';

interface User {
  id: number;
  identifier: string;
  name: string;
  coins: number;
  mod_count: number;
  created_at: string;
}

export default function UserManagement() {
  const { users, setUsers, mods, setMods, loading, setLoading, updateUserCoins } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGiveCoinsModal, setShowGiveCoinsModal] = useState(false);
  const [showGiveModModal, setShowGiveModModal] = useState(false);
  const [coinsAmount, setCoinsAmount] = useState<number>(100);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const [usersResult, modsResult] = await Promise.all([
      adminApi.getUsers(),
      adminApi.getMods(),
    ]);

    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    } else {
      setError(usersResult.error || 'Failed to fetch users');
    }

    if (modsResult.success && modsResult.data) {
      setMods(modsResult.data);
    }

    setLoading(false);
  };

  const handleGiveCoins = async () => {
    if (!selectedUser || coinsAmount <= 0) return;

    const result = await adminApi.giveCoins(selectedUser.id, coinsAmount);
    if (result.success) {
      updateUserCoins(selectedUser.id, coinsAmount);
      setNotification({ type: 'success', message: `成功赠送 ${coinsAmount} 代币给 ${selectedUser.name}` });
      setShowGiveCoinsModal(false);
      setSelectedUser(null);
      fetchData();
    } else {
      setNotification({ type: 'error', message: result.error || '赠送失败' });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const handleGiveMod = async (modId: number) => {
    if (!selectedUser) return;

    const result = await adminApi.giveMod(selectedUser.id, modId);
    if (result.success) {
      setNotification({ type: 'success', message: result.message || 'Mod赠送成功' });
      setShowGiveModModal(false);
      setSelectedUser(null);
      fetchData();
    } else {
      setNotification({ type: 'error', message: result.error || '赠送失败' });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const copyIdentifier = (identifier: string, id: number) => {
    navigator.clipboard.writeText(identifier);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
    <div className="p-8">
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

      <h1 className="text-4xl font-orbitron font-bold text-white mb-8">
        用户管理
      </h1>

      <div className="card-cyber overflow-hidden">
        <table className="table-cyber">
          <thead>
            <tr>
              <th>玩家ID</th>
              <th>游戏昵称</th>
              <th>Identifier</th>
              <th>代币余额</th>
              <th>拥有Mod数</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id}>
                <td className="font-semibold text-white">#{user.id}</td>
                <td className="font-semibold text-white">{user.name}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono truncate max-w-xs">
                      {user.identifier}
                    </span>
                    <button
                      onClick={() => copyIdentifier(user.identifier, user.id)}
                      className="p-1 hover:bg-cyber-purple/20 rounded transition-colors"
                      title="复制Identifier"
                    >
                      {copiedId === user.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="text-yellow-400 font-semibold">
                  {user.coins.toLocaleString()}
                </td>
                <td className="text-purple-400 font-semibold">
                  {user.mod_count}
                </td>
                <td className="text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowGiveCoinsModal(true);
                      }}
                      className="btn-cyber !py-1 !px-3 text-sm flex items-center gap-1"
                    >
                      <Gift className="w-4 h-4" />
                      代币
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowGiveModModal(true);
                      }}
                      className="btn-cyber-pink !py-1 !px-3 text-sm flex items-center gap-1"
                    >
                      <Package className="w-4 h-4" />
                      Mod
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGiveCoinsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-cyber p-8 w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
              赠送代币
            </h2>
            <p className="text-gray-400 font-rajdhani mb-4">
              玩家: <span className="text-white font-semibold">{selectedUser.name}</span>
            </p>
            <p className="text-gray-400 font-rajdhani mb-6">
              当前余额: <span className="text-yellow-400 font-semibold">{selectedUser.coins.toLocaleString()}</span>
            </p>
            <input
              type="number"
              value={coinsAmount}
              onChange={(e) => setCoinsAmount(Number(e.target.value))}
              className="input-cyber mb-6"
              placeholder="输入赠送数量"
              min="1"
            />
            <div className="flex gap-4">
              <button
                onClick={handleGiveCoins}
                className="btn-cyber flex-1"
              >
                确认赠送
              </button>
              <button
                onClick={() => {
                  setShowGiveCoinsModal(false);
                  setSelectedUser(null);
                }}
                className="btn-cyber !bg-gray-500/20 !border-gray-500 hover:!bg-gray-500 flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showGiveModModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-cyber p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-cyber animate-fade-in">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
              赠送Mod
            </h2>
            <p className="text-gray-400 font-rajdhani mb-6">
              选择要赠送的Mod给: <span className="text-white font-semibold">{selectedUser.name}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mods.filter(m => m.is_active).map((mod) => (
                <div
                  key={mod.id}
                  className="bg-cyber-dark/50 rounded-lg p-4 border border-cyber-purple/30 hover:border-cyber-purple transition-colors"
                >
                  <h3 className="text-white font-semibold mb-2">{mod.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{mod.description}</p>
                  <button
                    onClick={() => handleGiveMod(mod.id)}
                    className="btn-cyber w-full !py-2"
                  >
                    <UserPlus className="w-4 h-4 mr-2 inline" />
                    赠送此Mod
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowGiveModModal(false);
                setSelectedUser(null);
              }}
              className="btn-cyber !bg-gray-500/20 !border-gray-500 hover:!bg-gray-500 w-full mt-6"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
