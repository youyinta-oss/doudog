import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Server, Activity, FileText } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: '仪表板', icon: LayoutDashboard },
    { to: '/servers', label: '服务器管理', icon: Server },
    { to: '/services', label: '服务管理', icon: Activity },
    { to: '/logs', label: '系统日志', icon: FileText }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          服务器管理系统
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
              to={item.to}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          © 2025 Server Management System
        </div>
      </div>
    </aside>
  );
}
