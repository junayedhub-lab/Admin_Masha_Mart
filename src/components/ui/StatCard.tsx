import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: { value: number; type: 'up' | 'down' | 'neutral' };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({ title, value, change, icon: Icon, iconColor = '#E91E63', iconBg = '#FCE4EC' }: StatCardProps) {
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1.5">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-semibold',
              change.type === 'up' && 'text-emerald-600',
              change.type === 'down' && 'text-red-500',
              change.type === 'neutral' && 'text-slate-400',
            )}>
              {change.type === 'up' ? <ArrowUpRight size={14} /> : change.type === 'down' ? <ArrowDownRight size={14} /> : <Minus size={14} />}
              <span>{change.value}%</span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
