import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { adminApi } from '../lib/api';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface Mod {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_path: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export default function ModManagement() {
  const { mods, setMods, loading, setLoading } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingMod, setEditingMod] = useState<Mod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    model_path: '',
    category: 'default',
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchMods();
  }, []);

  const fetchMods = async () => {
    setLoading(true);
    const result = await adminApi.getMods();
    if (result.success && result.data) {
      setMods(result.data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.model_path) {
      setNotification({ type: 'error', message: '请填写所有必填项' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    let result;
    if (editingMod) {
      result = await adminApi.updateMod(editingMod.id, formData);
    } else {
      result = await adminApi.createMod(formData);
    }

    if (result.success) {
      setNotification({
        type: 'success',
        message: editingMod ? 'Mod更新成功' : 'Mod创建成功',
      });
      setShowModal(false);
      setEditingMod(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        model_path: '',
        category: 'default',
      });
      fetchMods();
    } else {
      setNotification({ type: 'error', message: result.error || '操作失败' });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const handleEdit = (mod: Mod) => {
    setEditingMod(mod);
    setFormData({
      name: mod.name,
      description: mod.description,
      price: mod.price,
      image_url: mod.image_url,
      model_path: mod.model_path,
      category: mod.category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个Mod吗？')) return;

    const result = await adminApi.deleteMod(id);
    if (result.success) {
      setNotification({ type: 'success', message: 'Mod删除成功' });
      fetchMods();
    } else {
      setNotification({ type: 'error', message: result.error || '删除失败' });
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleActive = async (mod: Mod) => {
    const result = await adminApi.updateMod(mod.id, {
      is_active: !mod.is_active,
    });
    if (result.success) {
      setNotification({
        type: 'success',
        message: mod.is_active ? 'Mod已下架' : 'Mod已上架',
      });
      fetchMods();
    } else {
      setNotification({ type: 'error', message: result.error || '操作失败' });
    }
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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-orbitron font-bold text-white">
          Mod商品管理
        </h1>
        <button
          onClick={() => {
            setEditingMod(null);
            setFormData({
              name: '',
              description: '',
              price: 0,
              image_url: '',
              model_path: '',
              category: 'default',
            });
            setShowModal(true);
          }}
          className="btn-cyber flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加Mod
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mods.map((mod: Mod) => (
          <div key={mod.id} className="card-cyber overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-cyber-purple/20 to-cyber-pink/20 flex items-center justify-center">
              <div className="text-6xl">🎮</div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-orbitron font-bold text-white">
                  {mod.name}
                </h3>
                <span
                  className={`badge ${
                    mod.is_active ? 'badge-success' : 'badge-error'
                  }`}
                >
                  {mod.is_active ? '上架中' : '已下架'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {mod.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">价格</span>
                  <span className="text-yellow-400 font-semibold">
                    {mod.price.toLocaleString()} 代币
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">模型路径</span>
                  <span className="text-gray-300 font-mono text-xs">
                    {mod.model_path}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">分类</span>
                  <span className="text-purple-400">{mod.category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(mod)}
                  className="btn-cyber !py-2 !px-4 flex-1 flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
                <button
                  onClick={() => handleToggleActive(mod)}
                  className="btn-cyber !py-2 !px-4 flex items-center justify-center"
                  title={mod.is_active ? '下架' : '上架'}
                >
                  {mod.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(mod.id)}
                  className="btn-cyber-pink !py-2 !px-4 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-cyber p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-cyber animate-fade-in">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
              {editingMod ? '编辑Mod' : '添加新Mod'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 font-rajdhani mb-2">
                  Mod名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-cyber"
                  placeholder="例如：赛博朋克战士"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-rajdhani mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-cyber min-h-[100px]"
                  placeholder="描述这个Mod的特点..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-rajdhani mb-2">
                    价格 (代币) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="input-cyber"
                    placeholder="500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-rajdhani mb-2">
                    分类
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="input-cyber"
                    placeholder="例如：cyberpunk"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 font-rajdhani mb-2">
                  模型路径 *
                </label>
                <input
                  type="text"
                  value={formData.model_path}
                  onChange={(e) =>
                    setFormData({ ...formData, model_path: e.target.value })
                  }
                  className="input-cyber font-mono"
                  placeholder="mp_m_freemode_01"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-rajdhani mb-2">
                  图片URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="input-cyber"
                  placeholder="/images/mod.png"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleSubmit} className="btn-cyber flex-1">
                {editingMod ? '保存修改' : '创建Mod'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingMod(null);
                }}
                className="btn-cyber !bg-gray-500/20 !border-gray-500 hover:!bg-gray-500 flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
