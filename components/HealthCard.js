'use client';

import { cn } from '@/lib/utils';
import { Heart, Activity, Thermometer, FileHeart } from 'lucide-react';

const iconMap = {
  heartRate: Heart,
  spo2: Activity,
  temperature: Thermometer,
  ecg: FileHeart,
};

const colorMap = {
  heartRate: { bg: 'from-red-500/10 to-red-500/5', text: 'text-red-500', icon: 'text-red-500' },
  spo2: { bg: 'from-blue-500/10 to-blue-500/5', text: 'text-blue-500', icon: 'text-blue-500' },
  temperature: { bg: 'from-orange-500/10 to-orange-500/5', text: 'text-orange-500', icon: 'text-orange-500' },
  ecg: { bg: 'from-teal-500/10 to-teal-500/5', text: 'text-teal-500', icon: 'text-teal-500' },
};

export default function HealthCard({ type, title, value, unit, status, lastUpdated }) {
  const Icon = iconMap[type] || Activity;
  const colors = colorMap[type] || colorMap.heartRate;

  return (
    <div className={cn('relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md', 'animate-slide-up')}>
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', colors.bg)} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 shadow-sm', colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          {status && (
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              status === 'Normal' ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                : status === 'Critical' ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
            )}>
              {status}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{value || '--'}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {lastUpdated && (
          <p className="mt-2 text-xs text-muted-foreground">Updated {lastUpdated}</p>
        )}
      </div>
    </div>
  );
}
