import { Calendar } from 'lucide-react';

type Period = 'today' | '7d' | '30d' | 'custom';

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
}

export default function PeriodSelector({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onDateChange,
}: PeriodSelectorProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          <button
            onClick={() => onPeriodChange('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => onPeriodChange('7d')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === '7d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => onPeriodChange('30d')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === '30d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 jours
          </button>
        </div>
      </div>
    </div>
  );
}
