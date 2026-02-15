import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, MousePointerClick, FileText, RotateCw, Gift, TrendingUp, X, ChevronLeft, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
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

interface ParticipationItem {
  id: string;
  prize: { id: string; name: string; message: string } | null;
  claim_code: string;
  won_at: string;
  expires_at: string;
  status: string;
  claimed_at?: string | null;
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
  const [toClaimList, setToClaimList] = useState<ParticipationItem[]>([]);
  const [toClaimLoading, setToClaimLoading] = useState(false);
  const [showClaimedModal, setShowClaimedModal] = useState(false);
  const [claimedList, setClaimedList] = useState<ParticipationItem[]>([]);
  const [claimedLoading, setClaimedLoading] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredList, setExpiredList] = useState<ParticipationItem[]>([]);
  const [expiredLoading, setExpiredLoading] = useState(false);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [visitsList, setVisitsList] = useState<{ id: string; date: string; event_type: string }[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsViewMode, setVisitsViewMode] = useState<'months' | 'detail'>('months');
  const [visitsSelectedMonth, setVisitsSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const getStatsDateRange = (): { start: Date; end: Date } | null => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    if (period === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    if (period === '7d') {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    if (period === '30d') {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const endCustom = new Date(endDate);
      endCustom.setHours(23, 59, 59, 999);
      return { start, end: endCustom };
    }
    return null;
  };

  useEffect(() => {
    if (!id || !token) return;
    const range = getStatsDateRange();
    const params = range
      ? `?startDate=${encodeURIComponent(range.start.toISOString())}&endDate=${encodeURIComponent(range.end.toISOString())}`
      : '';
    apiFetch<Stats>(`/api/restaurants/${id}/stats${params}`, { token })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token, period, startDate, endDate]);

  const openLotsToClaim = () => {
    if (!id || !token) return;
    setShowToClaimModal(true);
    setToClaimLoading(true);
    apiFetch<ParticipationItem[]>(`/api/restaurants/${id}/participations?status=A_RECUPERER`, { token })
      .then(setToClaimList)
      .catch(() => setToClaimList([]))
      .finally(() => setToClaimLoading(false));
  };

  const openLotsClaimed = () => {
    if (!id || !token) return;
    setShowClaimedModal(true);
    setClaimedLoading(true);
    apiFetch<ParticipationItem[]>(`/api/restaurants/${id}/participations?status=RECUPERE`, { token })
      .then(setClaimedList)
      .catch(() => setClaimedList([]))
      .finally(() => setClaimedLoading(false));
  };

  const openLotsExpired = () => {
    if (!id || !token) return;
    setShowExpiredModal(true);
    setExpiredLoading(true);
    apiFetch<ParticipationItem[]>(`/api/restaurants/${id}/participations?status=EXPIRE`, { token })
      .then(setExpiredList)
      .catch(() => setExpiredList([]))
      .finally(() => setExpiredLoading(false));
  };

  const openVisits = () => {
    if (!id || !token) return;
    setShowVisitsModal(true);
    setVisitsViewMode('months');
    setVisitsSelectedMonth(null);
    setVisitsLoading(true);
    apiFetch<unknown>(`/api/restaurants/${id}/analytics?event_type=VISIT&limit=1000`, { token })
      .then((data) => setVisitsList(Array.isArray(data) ? data as { id: string; date: string; event_type: string }[] : []))
      .catch(() => setVisitsList([]))
      .finally(() => setVisitsLoading(false));
  };

  const currentYear = new Date().getFullYear();
  const visitsByMonth = (() => {
    const list = Array.isArray(visitsList) ? visitsList : [];
    const counts: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;
    list.forEach((v) => {
      const d = new Date(v.date);
      if (d.getFullYear() === currentYear) {
        const month = d.getMonth() + 1;
        counts[month] = (counts[month] ?? 0) + 1;
      }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return { counts, total };
  })();

  const visitsForSelectedMonth =
    visitsSelectedMonth && Array.isArray(visitsList)
      ? visitsList.filter((v) => {
          const d = new Date(v.date);
          return d.getFullYear() === visitsSelectedMonth.year && d.getMonth() + 1 === visitsSelectedMonth.month;
        })
      : [];

  const downloadDashboardPdf = async () => {
    if (!id || !token) return;
    setPdfLoading(true);
    try {
      const visitsData = await apiFetch<{ id: string; date: string; event_type: string }[]>(
        `/api/restaurants/${id}/analytics?event_type=VISIT&limit=1000`,
        { token }
      ).catch(() => [] as { id: string; date: string; event_type: string }[]);
      const list = Array.isArray(visitsData) ? visitsData : [];
      const year = new Date().getFullYear();
      const countsByMonth: number[] = [];
      for (let m = 1; m <= 12; m++) countsByMonth.push(0);
      list.forEach((v) => {
        const d = new Date(v.date);
        if (d.getFullYear() === year) {
          const month = d.getMonth();
          countsByMonth[month] += 1;
        }
      });
      const maxVisits = Math.max(...countsByMonth, 1);
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      doc.setFontSize(18);
      doc.text('Rapport Dashboard Restaurant', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, y);
      doc.setTextColor(0, 0, 0);
      y += 18;

      doc.setFontSize(12);
      doc.text('Visites par mois', margin, y);
      y += 8;

      const chartX = margin;
      const chartW = pageW - 2 * margin;
      const chartH = 55;
      const barGap = 2;
      const barCount = 12;
      const barW = (chartW - (barCount - 1) * barGap) / barCount;
      const barMaxH = chartH - 10;

      for (let i = 0; i < barCount; i++) {
        const x = chartX + i * (barW + barGap);
        const h = maxVisits > 0 ? (countsByMonth[i] / maxVisits) * barMaxH : 0;
        const barY = y + barMaxH - h + 2;
        doc.setFillColor(99, 102, 241);
        doc.rect(x, barY, barW, Math.max(h, 0), 'F');
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0);
        const monthLabel = monthNames[i];
        doc.text(monthLabel, x + barW / 2 - doc.getTextWidth(monthLabel) / 2, y + chartH - 5);
        const countStr = String(countsByMonth[i]);
        doc.text(countStr, x + barW / 2 - doc.getTextWidth(countStr) / 2, y + chartH - 2);
      }
      doc.setDrawColor(200, 200, 200);
      doc.rect(chartX, y + 2, chartW, chartH - 2, 'S');
      y += chartH + 14;

      doc.setFontSize(12);
      doc.text('Lots', margin, y);
      y += 10;
      doc.setFontSize(11);
      doc.setFillColor(34, 197, 94);
      doc.rect(margin, y - 5, 4, 4, 'F');
      doc.text(`Lots récupérés : ${stats.prizesClaimed}`, margin + 8, y);
      y += 8;
      doc.setFillColor(239, 68, 68);
      doc.rect(margin, y - 5, 4, 4, 'F');
      doc.text(`Lots expirés : ${stats.prizesExpired}`, margin + 8, y);

      doc.save(`dashboard-restaurant-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('Erreur génération PDF', e);
    } finally {
      setPdfLoading(false);
    }
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <img
          src="/images/specialthai-logo.png"
          alt="Special Thaï"
          className="h-20 w-auto object-contain"
        />
        <button
          type="button"
          onClick={downloadDashboardPdf}
          disabled={pdfLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FileDown className="w-5 h-5" />
          {pdfLoading ? 'Génération…' : 'Télécharger PDF'}
        </button>
      </div>

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

      {/* 4 cartes cliquables sur une même rangée (design compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          type="button"
          onClick={openVisits}
          className="text-left rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <StatCard
            title="Visites"
            value={stats.visits.toLocaleString()}
            icon={<Eye className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            compact
          />
        </button>
        <button
          type="button"
          onClick={openLotsToClaim}
          className="text-left rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <StatCard
            title="Lots à récupérer"
            value={stats.prizesToClaim}
            icon={<Gift className="w-6 h-6" />}
            compact
          />
        </button>
        <button
          type="button"
          onClick={openLotsClaimed}
          className="text-left rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <StatCard
            title="Lots récupérés"
            value={stats.prizesClaimed}
            icon={<TrendingUp className="w-6 h-6" />}
            compact
          />
        </button>
        <button
          type="button"
          onClick={openLotsExpired}
          className="text-left rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <StatCard
            title="Lots expirés"
            value={stats.prizesExpired}
            icon={<Gift className="w-6 h-6" />}
            compact
          />
        </button>
      </div>

      {/* Clics Google, Formulaires, Roue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          title="Nombre de fois que la roue a été tournée par les clients"
          value={stats.spins.toLocaleString()}
          icon={<RotateCw className="w-8 h-8" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Modal détail Visites */}
      {showVisitsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {visitsViewMode === 'detail' && visitsSelectedMonth && (
                  <button
                    type="button"
                    onClick={() => {
                      setVisitsViewMode('months');
                      setVisitsSelectedMonth(null);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 shrink-0"
                    aria-label="Retour"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {visitsViewMode === 'months'
                    ? 'Détail des visites'
                    : visitsSelectedMonth
                      ? `Visites - ${new Date(visitsSelectedMonth.year, visitsSelectedMonth.month - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                      : 'Détail des visites'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVisitsModal(false);
                  setVisitsViewMode('months');
                  setVisitsSelectedMonth(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {visitsLoading ? (
                <p className="text-gray-500 text-center py-8">Chargement...</p>
              ) : visitsViewMode === 'months' ? (
                visitsByMonth.total === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune visite enregistrée pour cette année.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                      const count = visitsByMonth.counts[month] ?? 0;
                      const pct = visitsByMonth.total > 0 ? Math.round((count / visitsByMonth.total) * 100) : 0;
                      const label = new Date(currentYear, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' });
                      return (
                        <button
                          key={month}
                          type="button"
                          onClick={() => {
                            setVisitsSelectedMonth({ year: currentYear, month });
                            setVisitsViewMode('detail');
                          }}
                          className="text-left rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <p className="font-medium text-gray-900 capitalize">{label}</p>
                          <p className="text-2xl font-bold text-indigo-600 mt-1">{pct} %</p>
                          <p className="text-xs text-gray-500 mt-0.5">{count} visite{count !== 1 ? 's' : ''}</p>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                visitsForSelectedMonth.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune visite pour ce mois.</p>
                ) : (
                  <ul className="space-y-2">
                    {visitsForSelectedMonth.map((v) => (
                      <li
                        key={v.id}
                        className="border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Eye className="w-5 h-5 text-indigo-600 shrink-0" />
                        <span className="text-sm text-gray-700">
                          Visite le {new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {new Date(v.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
            {visitsViewMode === 'detail' && !visitsLoading && visitsForSelectedMonth.length > 0 && (
              <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
                <p>{visitsForSelectedMonth.length} visite{visitsForSelectedMonth.length > 1 ? 's' : ''} ce mois.</p>
              </div>
            )}
            {visitsViewMode === 'months' && !visitsLoading && visitsByMonth.total > 0 && (
              <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
                <p>Année {currentYear} — {visitsByMonth.total} visite{visitsByMonth.total > 1 ? 's' : ''} au total (max. 1000).</p>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Modal détail Lots récupérés */}
      {showClaimedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lots récupérés</h2>
              <button
                type="button"
                onClick={() => setShowClaimedModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {claimedLoading ? (
                <p className="text-gray-500 text-center py-8">Chargement...</p>
              ) : claimedList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun lot récupéré pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {claimedList.map((p) => (
                    <li
                      key={p.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{p.prize?.name ?? 'Lot'}</p>
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
                        {p.claimed_at && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Récupéré le {new Date(p.claimed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal détail Lots expirés */}
      {showExpiredModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lots expirés</h2>
              <button
                type="button"
                onClick={() => setShowExpiredModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {expiredLoading ? (
                <p className="text-gray-500 text-center py-8">Chargement...</p>
              ) : expiredList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun lot expiré pour le moment.</p>
              ) : (
                <ul className="space-y-3">
                  {expiredList.map((p) => (
                    <li
                      key={p.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{p.prize?.name ?? 'Lot'}</p>
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
                        <p className="text-xs text-gray-500 mt-0.5">
                          Gagné le {new Date(p.won_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                          Expiré le {new Date(p.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
