import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, MousePointerClick, FileText, RotateCw, Gift, TrendingUp, X } from 'lucide-react';
import StatCard from '../../components/StatCard';
import PeriodSelector from '../../components/PeriodSelector';
import NavigationTabs from '../../components/NavigationTabs';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../api/client';

type Period = 'today' | '7d' | '30d' | 'custom';

type Stats = {
  visits: number;
  googleClicks: number;
  forms: number;
  spins: number;
  prizesToClaim: number;
  prizesClaimed: number;
  prizesExpired: number;
};

interface ParticipationToClaim {
  id: string;
  prize: { id: string; name: string; message: string } | null;
  claim_code: string;
  won_at: string;
  expires_at: string;
  status: string;
  client: {
    id: string;
    phone: string;
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export default function RestaurantDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [period, setPeriod] = useState<Period>('7d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<Stats>({
    visits: 0,
    googleClicks: 0,
    forms: 0,
    spins: 0,
    prizesToClaim: 0,
    prizesClaimed: 0,
    prizesExpired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showToClaimModal, setShowToClaimModal] = useState(false);
  const [toClaimList, setToClaimList] = useState<ParticipationToClaim[]>([]);
  const [toClaimLoading, setToClaimLoading] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    apiFetch<Stats>(`/api/restaurants/${id}/stats`, { token })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  const openLotsToClaim = () => {
    if (!id || !token) return;
    setShowToClaimModal(true);
    setToClaimLoading(true);
    apiFetch<ParticipationToClaim[]>(`/api/restaurants/${id}/participations?status=A_RECUPERER`, { token })
      .then(setToClaimList)
      .catch(() => setToClaimList([]))
      .finally(() => setToClaimLoading(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Chargement des statistiques...</p>
      </div>
    );
  }

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
        <button
          type="button"
          onClick={openLotsToClaim}
          className="text-left rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <StatCard
            title="Lots à récupérer"
            value={stats.prizesToClaim}
            icon={<Gift className="w-8 h-8" />}
          />
        </button>
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

      {/* Modal détail Lots à récupérer */}
      {showToClaimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lots à récupérer</h2>
              <button
                type="button"
                onClick={() => setShowToClaimModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {toClaimLoading ? (
                <p className="text-gray-500 text-center py-8">Chargement...</p>
              ) : toClaimList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun lot à récupérer pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {toClaimList.map((p) => (
                    <li
                      key={p.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.prize?.name ?? 'Lot'}
                          </p>
                          {p.prize?.message && (
                            <p className="text-sm text-gray-600 mt-0.5">{p.prize.message}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Code : <span className="font-mono font-medium">{p.claim_code}</span>
                          </p>
                          {p.client && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Client : {[p.client.first_name, p.client.last_name].filter(Boolean).join(' ') || p.client.phone || p.client.email}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Expire le {new Date(p.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowToClaimModal(false);
                  if (id) navigate(`/restaurant/${id}/recuperations`);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Gérer les récupérations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
