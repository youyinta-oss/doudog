import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: '控制台' },
    { path: '/admin/users', icon: Users, label: '用户管理' },
    { path: '/admin/mods', icon: Package, label: 'Mod管理' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-cyber-gray/80 backdrop-blur-md border-r border-cyber-purple/30 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-cyber-purple/30">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl font-orbitron font-bold text-white">
                Admin
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-cyber-purple/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-cyber-purple text-white shadow-neon'
                  : 'text-gray-400 hover:bg-cyber-purple/20 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-rajdhani font-semibold">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-cyber-purple/30">
          <button
            onClick={() => navigate('/shop')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-cyber-purple/20 hover:text-white transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && (
              <span className="font-rajdhani font-semibold">返回商城</span>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
