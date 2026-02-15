import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  compact?: boolean;
}

export default function StatCard({ title, value, icon, trend, compact }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className={`font-medium text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
          <p className={`font-bold text-gray-900 mt-1 ${compact ? 'text-xl' : 'text-2xl mt-2'}`}>{value}</p>
          {trend && (
            <p className={`${compact ? 'text-xs' : 'text-sm'} mt-0.5 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </p>
          )}
        </div>
        <div className="text-indigo-600 shrink-0">{icon}</div>
      </div>
    </div>
  );
}
