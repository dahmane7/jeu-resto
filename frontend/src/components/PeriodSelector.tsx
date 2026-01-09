import { Calendar, TrendingUp } from 'lucide-react';

type Period = 'today' | '7d' | '30d' | 'custom';

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
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
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Période :</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onPeriodChange('today')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === 'today'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => onPeriodChange('7d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === '7d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => onPeriodChange('30d')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === '30d'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 jours
          </button>
          <button
            onClick={() => onPeriodChange('custom')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              period === 'custom'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Personnalisé
          </button>
        </div>

        {period === 'custom' && onDateChange && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onDateChange(e.target.value, endDate || '')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500">à</span>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onDateChange(startDate || '', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
