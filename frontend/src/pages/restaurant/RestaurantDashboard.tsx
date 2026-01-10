import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, MousePointerClick, FileText, RotateCw, Gift, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard';
import PeriodSelector from '../../components/PeriodSelector';
import NavigationTabs from '../../components/NavigationTabs';

type Period = 'today' | '7d' | '30d' | 'custom';

export default function RestaurantDashboard() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState<Period>('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Données mockées pour l'instant
  const stats = {
    visits: 1247,
    googleClicks: 892,
    forms: 654,
    spins: 543,
    prizesToClaim: 45,
    prizesClaimed: 234,
    prizesExpired: 12,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Restaurant
      </h1>

      <NavigationTabs restaurantId={id || ''} />

      <PeriodSelector
        period={period}
        onPeriodChange={setPeriod}
        startDate={startDate}
        endDate={endDate}
        onDateChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Visites"
          value={stats.visits.toLocaleString()}
          icon={<Eye className="w-8 h-8" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Clics Google"
          value={stats.googleClicks.toLocaleString()}
          icon={<MousePointerClick className="w-8 h-8" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Formulaires complétés"
          value={stats.forms.toLocaleString()}
          icon={<FileText className="w-8 h-8" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Spins"
          value={stats.spins.toLocaleString()}
          icon={<RotateCw className="w-8 h-8" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Résumé des gains */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Lots à récupérer"
          value={stats.prizesToClaim}
          icon={<Gift className="w-8 h-8" />}
        />
        <StatCard
          title="Lots récupérés"
          value={stats.prizesClaimed}
          icon={<TrendingUp className="w-8 h-8" />}
        />
        <StatCard
          title="Lots expirés"
          value={stats.prizesExpired}
          icon={<Gift className="w-8 h-8" />}
        />
      </div>
    </div>
  );
}
