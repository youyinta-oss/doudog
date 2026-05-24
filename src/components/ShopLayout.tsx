import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, Package, User, Coins, Menu, X } from 'lucide-react';

export default function ShopLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/shop', icon: Store, label: 'Mod商城' },
    { path: '/inventory', icon: Package, label: '我的仓库' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-cyber-gray/90 backdrop-blur-md border-b border-cyber-purple/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2"
            >
              <div className="text-3xl">🎮</div>
              <span className="text-xl font-orbitron font-bold text-white">
                FiveM Mod
              </span>
            </button>

            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-cyber-purple text-white shadow-neon'
                      : 'text-gray-400 hover:bg-cyber-purple/20 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate('/admin')}
                className="ml-4 px-4 py-2 rounded-lg font-rajdhani font-semibold text-gray-400 hover:bg-cyber-purple/20 hover:text-white transition-all duration-300"
              >
                管理面板
              </button>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-cyber-purple/20 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="md:hidden bg-cyber-gray/95 border-t border-cyber-purple/30 px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-rajdhani font-semibold transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-cyber-purple text-white'
                    : 'text-gray-400 hover:bg-cyber-purple/20 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
