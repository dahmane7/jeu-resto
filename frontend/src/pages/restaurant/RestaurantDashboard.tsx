import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, MousePointerClick, FileText, RotateCw, Gift, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard';
import PeriodSelector from '../../components/PeriodSelector';
import NavigationTabs from '../../components/NavigationTabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  // Données pour le graphique de répartition des lots
  const prizesDistribution = [
    { name: 'Café offert', value: 30, color: '#8B5CF6' },
    { name: 'Dessert offert', value: 25, color: '#EC4899' },
    { name: '-10% commande', value: 25, color: '#F59E0B' },
    { name: 'Perdu', value: 20, color: '#6B7280' },
  ];

  // Données pour le graphique des gains par statut
  const prizesByStatus = [
    { name: 'À récupérer', value: stats.prizesToClaim, color: '#3B82F6' },
    { name: 'Récupérés', value: stats.prizesClaimed, color: '#10B981' },
    { name: 'Expirés', value: stats.prizesExpired, color: '#EF4444' },
  ];

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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Répartition des lots */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition des lots
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prizesDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prizesDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gains par statut */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gains par statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prizesByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6">
                {prizesByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
