
import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: 'blue' | 'green' | 'amber' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  purple: 'from-purple-500 to-pink-500'
};

export default function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
          {trend && (
            <p className={cn(
              'text-sm mt-2 font-medium',
              trend.positive ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          'p-4 rounded-xl bg-gradient-to-br',
          colorClasses[color]
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

