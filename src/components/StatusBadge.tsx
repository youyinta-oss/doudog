
import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'running' | 'stopped' | 'error';
  label?: string;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  online: { color: 'text-green-400', bg: 'bg-green-400/10', label: '在线' },
  offline: { color: 'text-slate-400', bg: 'bg-slate-400/10', label: '离线' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-400/10', label: '警告' },
  running: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: '运行中' },
  stopped: { color: 'text-slate-400', bg: 'bg-slate-400/10', label: '已停止' },
  error: { color: 'text-red-400', bg: 'bg-red-400/10', label: '错误' }
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.offline;
  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
      config.color,
      config.bg
    )}>
      <span className={cn('w-2 h-2 rounded-full animate-pulse', status === 'online' || status === 'running' ? 'bg-green-400' : status === 'warning' ? 'bg-amber-400' : status === 'error' ? 'bg-red-400' : 'bg-slate-400')} />
      {label || config.label}
    </span>
  );
}

